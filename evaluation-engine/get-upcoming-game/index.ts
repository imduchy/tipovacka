import { AzureFunction, Context } from '@azure/functions';
import { Game, Group, IGameDocument } from '@duchynko/tipovacka-models';
import { getDatabase } from '../utils/database';
import { getCompetition, getLatestSeason } from '../utils/competition';
import { findUpcomingGame } from './utils';
import { Types } from 'mongoose';

const activityFunction: AzureFunction = async function (
  context: Context
): Promise<string> {
  const groupId = context.bindingData.groupId;
  context.log('Starting to process the item ' + groupId);

  await getDatabase();

  try {
    context.log(`Fetching the group with ID ${groupId} from the database.`);
    const group = await Group.findById(groupId).populate('upcomingGame').exec();

    // We currently don't support groups following multiple teams, so we
    // can hardcode the first item from the followedTeams array.
    const team = group.followedTeams[0];
    const latestSeason = getLatestSeason(team);
    const competitionIds = latestSeason.competitions.map((c) => c.apiId);

    context.log('Starting to search for the new upcoming game of the team.');
    const newUpcomingGame = await findUpcomingGame(
      context.log,
      team.apiId,
      latestSeason.season,
      competitionIds
    );

    // If no new upcoming game was found, we can return as there is nothing else to do.
    // This can happen e.g., at the end of the season, after the last game was played.
    if (!newUpcomingGame) {
      context.log(
        `Didn't find an upcoming game for the team ${team.name}. Terminating ` +
          `the function.`
      );
      return;
    }

    const currentUpcomingGame = group.upcomingGames[0] as IGameDocument;
    if (currentUpcomingGame && newUpcomingGame.gameId === currentUpcomingGame.gameId) {
      context.log(
        'The upcoming game is already updated, and the upcomingGames field contains ' +
          'an id of the game. No further actions needed.'
      );
      context.log('The function is successfully terminating.');
      return;
    }

    context.log(
      `The new upcoming game for the group is the game ${newUpcomingGame.gameId}` +
        `between ${newUpcomingGame.homeTeam.name} and ${newUpcomingGame.awayTeam.name}.`
    );

    // Check if the game already exists in the database. One game can be shared between
    // multiple groups, if they follow one of the teams playing the game.
    let upcomingGameId = await Game.findOne({ gameId: newUpcomingGame.gameId })
      .exec()
      .then((doc) => {
        if (doc) {
          return doc._id as Types.ObjectId;
        }
      });

    const competition = getCompetition(
      group.followedTeams[0],
      newUpcomingGame.season,
      newUpcomingGame.competitionId
    );
    const competitionGames = competition.games as Types.ObjectId[];

    if (upcomingGameId) {
      context.log(
        `The game with API id ${upcomingGameId} already exists in the database.`
      );

      if (!competitionGames.includes(upcomingGameId)) {
        context.log(
          "The game doesn't exist in the group's competition object yet. Pushing " +
            "the game's id to the competition object."
        );
        competitionGames.push(upcomingGameId);
      }
    } else {
      context.log('Creating the new game record in the database.');
      upcomingGameId = await Game.create(newUpcomingGame).then(
        (doc) => {
          return doc._id as Types.ObjectId;
        },
        (err) => {
          context.log.error(
            `An error occured while creating a new game object. Error: ${err}`
          );
          throw err;
        }
      );

      context.log("Pushing the game's id to the group's competition object.");
      competitionGames.push(upcomingGameId);
    }

    context.log('Updating the upcoming game in the group record.');
    await group.update({ upcomingGames: [upcomingGameId] }).exec();

    context.log('Saving the updated group record in the database');
    await group.save();

    context.log('Publishing the upcoming game id and group id to the queue.');
    context.bindings.upcomingGame = {
      groupId: group._id,
      gameId: upcomingGameId,
    };

    context.log('The GetUpcomingGame service has finished successfully.');
  } catch (error) {
    context.log.error(`An unexpected error occured. Error: ${error}`);
    throw error;
  }
};

export default activityFunction;
