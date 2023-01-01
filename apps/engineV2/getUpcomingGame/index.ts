import { AzureFunction, Context } from '@azure/functions';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { Game, GameStatus, Group, IGame } from '@tipovacka/models';
import { getDatabase } from '../utils/database';
import { FootballApi } from '../utils/footballApi';
import { ReturnCodes, ReturnObject } from '../utils/returnCodes';
import { getLatestSeason } from '../utils/utils';
import { getUpcomingGameForLeague } from './utils';
import { HydratedDocument, Types } from 'mongoose';

const activityFunction: AzureFunction = async function (
  context: Context,
  groupId: string
): Promise<ReturnObject> {
  context.log(`Received the group ID ${groupId}`);

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

  context.log('Getting the competition IDs from the group object.');
  const followedTeam = group.followedTeams[0];
  const latestSeason = getLatestSeason(followedTeam);

  let upcomingGames: IGame[] = [];

  context.log('Starting to loop through competitions and fetch upcoming games.');
  for (const competition of latestSeason.competitions) {
    const competitionName = competition.name;
    const competitionId = competition.apiId;

    context.log(`Fetching the upcoming game for the league ${competitionName}.`);
    const game = await getUpcomingGameForLeague(
      footballApi,
      followedTeam.apiId,
      latestSeason.season,
      competitionId
    );

    if (!game) {
      context.log(`An upcoming game for the league ${competitionName} not found.`);
      continue;
    }

    context.log(`Adding the upcoming game with ID ${game.gameId} to a list.`);
    upcomingGames.push(game);
  }

  if (!upcomingGames) {
    context.log('No upcoming games found.');
    return {
      code: ReturnCodes.NO_UPCOMING_GAME_FOUND,
      data: undefined,
    };
  }

  context.log('Filtering out postponed and/or canceled games.');
  const invalidGameStatuses = [GameStatus.CANC, GameStatus.PST];
  upcomingGames = upcomingGames.filter((g) => !invalidGameStatuses.includes(g.status));

  if (!upcomingGames) {
    context.log('All upcoming games were canceled or postponed.');
    context.log('Fetching the second upcoming game for all leagues.');

    for (const competition of latestSeason.competitions) {
      const competitionName = competition.name;
      const competitionId = competition.apiId;

      context.log(`Fetching the upcoming game for the league ${competitionName}.`);
      const game = await getUpcomingGameForLeague(
        footballApi,
        followedTeam.apiId,
        latestSeason.season,
        competitionId,
        2
      );

      if (!game) {
        context.log(`A second upcoming game for the league ${competitionName} not found.`);
        continue;
      }

      context.log(`Adding the upcoming game with ID ${game.gameId} to a list.`);
      upcomingGames.push(game);
    }
  }

  if (!upcomingGames) {
    context.log('No upcoming games found.');
    return {
      code: ReturnCodes.NO_UPCOMING_GAME_FOUND,
      data: undefined,
    };
  }

  context.log('Sorting upcoming games by date to find upcoming game.');
  upcomingGames.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const upcomingGame = upcomingGames[0];
  context.log(`The upcoming game for is ${JSON.stringify(upcomingGame)}.`);

  context.log('Checking if the new upcoming game differs from the current upcoming game.');
  const currentUpcomingGame = group.upcomingGame as HydratedDocument<IGame>;

  if (currentUpcomingGame && currentUpcomingGame.gameId === upcomingGame.gameId) {
    context.log('The current upcoming game is already updated.');

    return {
      code: ReturnCodes.UPCOMING_GAME_ALREADY_UPDATED,
      data: undefined,
    };
  }

  context.log(`The new upcoming game for the group is the game ${JSON.stringify(upcomingGame)}.`);

  // Check if the game already exists in the database. One game can be shared between
  // multiple groups, if they follow one of the teams playing the game.
  let upcomingGameId = await Game.findOne({ gameId: upcomingGame.gameId })
    .exec()
    .then((doc) => {
      if (doc) {
        return doc._id as Types.ObjectId;
      }
    });

  if (upcomingGameId) {
    context.log(`The game with API ID ${upcomingGameId} already exists in the database.`);
  } else {
    context.log('Creating a new game object in the database.');

    upcomingGameId = await Game.create(upcomingGame).then(
      (doc) => {
        return doc._id as Types.ObjectId;
      },
      (err) => {
        context.log.error(`An error occured while creating a new game object. Error: ${err}`);
        throw err;
      }
    );
  }

  context.log('Updating the upcoming game in the group object in the database.');
  await group.updateOne({ upcomingGame: upcomingGameId });

  context.log('Saving the updated group object in the database.');
  await group.save();

  return {
    code: ReturnCodes.UPCOMING_GAME_UPDATED,
    data: upcomingGame,
  };
};

export default activityFunction;
