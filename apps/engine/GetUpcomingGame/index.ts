import { AzureFunction, Context } from '@azure/functions';
import { Game, Group, IGame } from '@tipovacka/models';
import { HydratedDocument, Types } from 'mongoose';
import { getDatabase } from '../src/database';
import { getLatestSeason } from '../src/utils';
import { findUpcomingGame } from './utils';

const queueTrigger: AzureFunction = async function (
  context: Context,
  queueItem: string
): Promise<void> {
  context.log('Starting to process the item ', queueItem);
  const groupId = queueItem;

  await getDatabase().catch((err) => {
    context.log.error("Couldn't connect to the database. Error:", err);
    throw err;
  });

  try {
    context.log(`Fetching the group with ID ${groupId} from the database.`);
    const group = await Group.findById(groupId).populate('upcomingGame').exec();
    context.log(`The group ${group.name} was fetched from the database.`);

    // We currently don't support groups following multiple teams, so we
    // can hardcode the first item from the followedTeams array.
    const team = group.followedTeams[0];
    const latestSeason = getLatestSeason(team);
    const competitionIds = latestSeason.competitions.map((c) => c.apiId);
    context.log(
      `The group is, during the season ${latestSeason.season}, enrolled ` +
        `in the following competitions ${competitionIds.join(', ')}.`
    );

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
      context.log(`Didn't find an upcoming game for the team ${team.name}.`);
      context.log('Updating the upcoming game in the group record.');
      await group.updateOne({ upcomingGame: null }).exec();

      context.log('Saving the updated group record in the database');
      await group.save();

      context.log('Publishing the group id and undefined game id to the queue.');
      context.bindings.upcomingGame = {
        groupId: group._id,
        competitionId: competitionIds[0],
        season: latestSeason.season,
      };

      context.log('The GetUpcomingGame service has finished successfully.');
      return;
    }

    const currentUpcomingGame = group.upcomingGame as HydratedDocument<IGame>;
    if (currentUpcomingGame && newUpcomingGame.gameId === currentUpcomingGame.gameId) {
      context.log(
        'The upcoming game is already updated, and the upcomingGame field contains ' +
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

    if (upcomingGameId) {
      context.log(`The game with API id ${upcomingGameId} already exists in the database.`);
    } else {
      context.log('Creating the new game record in the database.');
      upcomingGameId = await Game.create(newUpcomingGame).then(
        (doc) => {
          return doc._id as Types.ObjectId;
        },
        (err) => {
          context.log.error(`An error occured while creating a new game object. Error: ${err}`);
          throw err;
        }
      );
    }

    context.log('Updating the upcoming game in the group record.');
    await group.updateOne({ upcomingGame: upcomingGameId }).exec();

    context.log('Saving the updated group record in the database');
    await group.save();

    context.log('Publishing the upcoming game id and group id to the queue.');
    context.bindings.upcomingGame = {
      groupId: group._id,
      competitionId: competitionIds[0],
      season: latestSeason.season,
    };

    context.log('The GetUpcomingGame service has finished successfully.');
  } catch (error) {
    context.log.error(`An unexpected error occured. Error: ${error}`);
    throw error;
  }
};

export default queueTrigger;
