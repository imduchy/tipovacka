import { AzureFunction, Context } from '@azure/functions';
import { Group } from '@tipovacka/models';
import { getDatabase } from '../src/database';
import * as FootballApi from '../src/footballApi';
import { getCompetition } from '../src/utils';
import { mapPlayersResponse } from './utils';

const queueTrigger: AzureFunction = async function (
  context: Context,
  queueItem: { groupId: string; competitionId: number; season: number }
): Promise<void> {
  context.log('Starting to process the item', queueItem);
  const { groupId, competitionId, season } = queueItem;

  await getDatabase().catch((err) => {
    context.log.error("Couldn't connect to the database. Error:", err);
    throw err;
  });

  context.log('Fetching the group from the database.');
  const group = await Group.findById(groupId)
    .exec()
    .catch((err) => {
      context.log.error("Couldn't find the group. Error:", err);
      throw err;
    });

  // We currently don't support groups following multiple teams, so we
  // can hardcode the first item from the followedTeams array.
  const followedTeam = group.followedTeams[0];

  context.log('Finding the competition object in the group record.');
  const competition = getCompetition(followedTeam, season, competitionId);
  context.log(
    `Found the competition object for the competition ${competitionId} ` +
      `and the season ${season}.`
  );

  context.log('Fetching players statistics from the API.');
  const playersResponse = await FootballApi.getPlayers(context.log, {
    team: followedTeam.apiId,
    league: competition.apiId,
    season: season,
  }).catch((err) => {
    context.log.error("Couldn't fetch players from the API. Error:", err);
    throw err;
  });

  // context.log("Fetching competition standings from the API.");
  // const standingsResponse = await FootballApi.getStandings(context.log, {
  //   league: competition.apiId,
  //   season: upcomingGame.season,
  // }).catch((err) => {
  //   context.log.error("Couldn't fetch standings from the API. Error:", err);
  //   throw err;
  // });

  const players = playersResponse.data.response;
  // const standings = standingsResponse.data.response;

  context.log('Mapping the players response to the expected format.');
  competition.players = mapPlayersResponse(players);
  // context.log("Mapping the standings response to the expected format.");
  // competition.standings = mapStandingsResponse(standings);

  // At the moment we don't utilize detailed team statistics, so this is not
  // yet implemented. We can enable it in the future, if needed.
  // competition.teamStatistics = mapTeamStatisticsResponse();

  context.log('Saving the updated group record in the database.');
  await group.save().catch((err) => {
    context.log.error("Couldn't save the updated group record to the database. Error:", err);
    throw err;
  });

  context.log('The UpdateCompetition service has finished successfully.');
};

export default queueTrigger;
