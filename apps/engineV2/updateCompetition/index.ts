import { AzureFunction, Context } from '@azure/functions';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { Group } from '@tipovacka/models';
import { getDatabase } from '../utils/database';
import { FootballApi } from '../utils/footballApi';
import { ReturnCodes, ReturnObject } from '../utils/returnCodes';
import { getCompetition } from '../utils/utils';
import { mapPlayersResponse } from './utils';

const activityFunction: AzureFunction = async function (
  context: Context,
  params: any
): Promise<ReturnObject> {
  context.log(`Received the array ${params}`);
  const groupId = params[0] as string;
  const competitionId = params[1] as number;
  const season = params[2] as number;

  const apiHost = process.env.API_FOOTBALL_HOST;
  const keyVaultUrl = process.env.KEY_VAULT_URL;
  const credentials = new DefaultAzureCredential();
  const secretClient = new SecretClient(keyVaultUrl, credentials);

  context.log('Fetching secrets from the Key Vault.');
  const footballApiKey = await secretClient.getSecret('FOOTBALL-API-KEY');
  const connectionStringSecret = await secretClient.getSecret('DB-CONNECTION-STRING');

  context.log('Getting the database object.');
  await getDatabase(connectionStringSecret.value);

  context.log('Getting the FootballApi client.');
  const footballApi = new FootballApi(context, secretClient, apiHost, footballApiKey.value);

  context.log('Fetching the group object from the database.');
  const group = await Group.findById(groupId);

  const followedTeam = group.followedTeams[0];

  context.log('Getting the competition object from the group object.');
  const competition = getCompetition(followedTeam, season, competitionId);

  context.log('Fetching players statistics from the external API.');
  const playersResponse = await footballApi.getPlayers({
    team: followedTeam.apiId,
    league: competition.apiId,
    season: season,
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

  context.log('Mapping players from the response to the expected format.');
  competition.players = mapPlayersResponse(players);
  // context.log("Mapping the standings response to the expected format.");
  // competition.standings = mapStandingsResponse(standings);

  // At the moment we don't utilize detailed team statistics, so this is not
  // yet implemented. We can enable it in the future, if needed.
  // competition.teamStatistics = mapTeamStatisticsResponse();

  context.log('Saving the updated group object in the database.');
  await group.save();

  return {
    code: ReturnCodes.COMPETITION_UPDATED,
    data: undefined,
  };
};

export default activityFunction;
