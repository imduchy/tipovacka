import { AzureFunction, Context } from '@azure/functions';
import { Game, GameStatus, Group, IGame } from '@tipovacka/models';
import { getDatabase } from '../utils/database';
import { HydratedDocument } from 'mongoose';
import { FootballApi } from '../utils/footballApi';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { EmptyApiResponseError } from '../utils/exceptions';
import { hasFinished, mapFixtureEvents, hasBeenCancelled, hasBeenPostponed } from './utils';
import { ReturnCodes, ReturnObject } from '../utils/returnCodes';

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

  context.log('Getting the FootballApi client.');
  const footballApi = new FootballApi(context, secretClient, apiHost, footballApiKey.value);

  context.log('Getting the database object.');
  await getDatabase(connectionStringSecret.value);

  context.log('Retrieving the group object from the database.');
  const group = await Group.findById(groupId).populate('upcomingGame');

  context.log(`Updating the group ${group.name}`);

  const upcomingGame = group.upcomingGame as HydratedDocument<IGame>;

  if (!upcomingGame) {
    context.log("The group doesn't have an upcoming game specified.");

    return {
      code: ReturnCodes.NO_UPCOMING_GAME,
      data: undefined,
    };
  }

  context.log(`The upcoming game for the group is ${JSON.stringify(upcomingGame)}`);

  context.log('Fetching a fixture for the game from the external API.');
  const fixtureResponse = await footballApi.getFixture({
    id: upcomingGame.gameId,
  });

  if (!fixtureResponse.data.response[0]) {
    context.log.error(fixtureResponse.data.errors);
    throw new EmptyApiResponseError('The fixture endpoint returned no data in the response.');
  }

  const { goals, fixture } = fixtureResponse.data.response[0];

  /**
   * =====================
   * The game has finished
   * =====================
   */
  if (hasFinished(fixture)) {
    context.log(`The game has finished with the status ${fixture.status.long}.`);

    context.log('Fetching the fixture events from the external API.');
    const eventsResponse = await footballApi.getEvents({
      fixture: upcomingGame.gameId,
    });
    const events = eventsResponse.data.response;

    if (!events) {
      context.log.error('The events endpoint returned no data in the response.');
      throw new EmptyApiResponseError('The events endpoint returned no data in the response.');
    }

    context.log(`The event response contains ${events.length} events.`);

    context.log('Updating the game record.');
    const updatedRecord = await Game.findOneAndUpdate(
      { _id: upcomingGame._id },
      {
        status: GameStatus[fixture.status.short],
        awayTeamScore: goals.away,
        homeTeamScore: goals.home,
        venue: fixture.venue.name,
        date: new Date(fixture.date),
        events: mapFixtureEvents(events),
      },
      { new: true }
    );
    context.log('The game record successfully updated.');

    return {
      code: ReturnCodes.GAME_FINISHED,
      data: updatedRecord,
    };

    /**
     * =====================================
     * The game has been cancelled/postponed
     * =====================================
     */
  } else if (hasBeenCancelled(fixture) || hasBeenPostponed(fixture)) {
    context.log(`The game has been cancelled or postponed with the status ${fixture.status.long}.`);

    context.log('Updating the game record.');
    await Game.findOneAndUpdate(
      { _id: upcomingGame._id },
      {
        status: GameStatus[fixture.status.short],
        awayTeamScore: goals.away,
        homeTeamScore: goals.home,
        venue: fixture.venue.name,
        date: new Date(fixture.date),
      }
    );

    return {
      code: ReturnCodes.GAME_POSTPONED,
      data: undefined,
    };

    /**
     * ============================
     * The game hasn't finished yet
     * ============================
     */
  } else {
    context.log(`The game has not finished yet. The status is ${fixture.status.long}.`);

    context.log('Updating the game record.');
    await Game.findOneAndUpdate(
      { _id: upcomingGame._id },
      {
        status: GameStatus[fixture.status.short],
        awayTeamScore: goals.away,
        homeTeamScore: goals.home,
        venue: fixture.venue.name,
        date: new Date(fixture.date),
      }
    );

    return {
      code: ReturnCodes.GAME_NOT_FINISHED,
      data: undefined,
    };
  }
};

export default activityFunction;
