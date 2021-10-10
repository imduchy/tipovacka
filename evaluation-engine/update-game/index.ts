import { AzureFunction, Context } from '@azure/functions';
import { Game, GameStatus, Group, IGameDocument } from '@duchynko/tipovacka-models';
import { FootballApi, FootballApiMappings } from '@duchynko/tipovacka-utilities';
import { getDatabase } from '../utils/database';
import { hasBeenCancelled, hasBeenPostponed, hasFinished } from '../utils/games';
import { ReturnCodes } from '../utils/returnCodes';

const activityFunction: AzureFunction = async function (
  context: Context
): Promise<string> {
  try {
    await getDatabase();

    const groupId = context.bindingData.groupId;
    context.log(`Starting to update the upcoming game for the group ${groupId}.`);

    context.log(`Fetching the group ${groupId} from the database.`);
    const group = await Group.findById(groupId);

    const upcomingGame = group.upcomingGame as IGameDocument;
    context.log(
      `The upcoming game for the group is the game between ` +
        `${upcomingGame.homeTeam.name} and ${upcomingGame.awayTeam.name} ` +
        `(${upcomingGame.gameId}). `
    );

    context.log('Fetching a fixture for the game from the Football API.');
    const fixtureResponse = await FootballApi.getFixture({ id: upcomingGame.gameId });

    if (!fixtureResponse.data.response[0]) {
      /**
       * TODO: Log a specific message and use an equivalent of AWS Metric Filters
       * to trigger an alarm if this happens.
       */
      throw new Error(
        'Fixture response contains no data. Response: ' +
          JSON.stringify(fixtureResponse.data)
      );
    }
    const { goals, fixture } = fixtureResponse.data.response[0];

    context.log(`The status of the game is: ${fixture.status.long}.`);
    if (hasFinished(fixture)) {
      context.log('Fetching fixture events from the Football API.');
      const eventsResponse = await FootballApi.getEvents({
        fixture: upcomingGame.gameId,
      });

      if (!eventsResponse.data.response) {
        /**
         * TODO: Log a specific message and use an equivalent of AWS Metric Filters
         * to trigger an alarm if this happens.
         */
        throw new Error(
          'Fixture events response contains no data. Response: ' +
            JSON.stringify(eventsResponse.data)
        );
      }
      const events = eventsResponse.data.response;

      context.log('Updating the game record.');
      const gameRecord = await Game.findOneAndUpdate(
        { _id: upcomingGame._id },
        {
          status: GameStatus[fixture.status.short],
          awayTeamScore: goals.away,
          homeTeamScore: goals.home,
          venue: fixture.venue.name,
          date: new Date(fixture.date),
          // @ts-ignore should be fixed in mongoose 6.0.8
          // https://github.com/Automattic/mongoose/issues/10597
          // update (after 6.0.8): there's another error so I keep this here
          events: FootballApiMappings.mapFixtureEvents(events),
        }
      );
      context.log('The game record successfully updated.');

      const response = JSON.stringify({
        returnCode: ReturnCodes.FINISHED_AND_UPDATED,
        groupId: group._id,
        game: gameRecord.toJSON(),
      });
      context.log(`Response object: ${response}`);
      return response;

      // In the future, when the new date for the game is decided, the game
      // id from the API will stay the same, and only the date will change.
    } else if (hasBeenCancelled(fixture) || hasBeenPostponed(fixture)) {
      context.log('Updating the game record.');
      await Game.findByIdAndUpdate(upcomingGame._id, {
        status: GameStatus[fixture.status.short],
        awayTeamScore: goals.away,
        homeTeamScore: goals.home,
        venue: fixture.venue.name,
        date: new Date(fixture.date),
      });
      context.log('The game record successfully updated.');

      const response = JSON.stringify({
        returnCode: ReturnCodes.POSTPONED_AND_UPDATED,
        groupId: group._id,
        game: undefined,
      });
      context.log(`Response object: ${response}`);
      return response;

      // If a game hasn't yet finished, there's nothing to do
    } else {
      context.log('Updating the game record.');
      await Game.findByIdAndUpdate(upcomingGame._id, {
        venue: fixture.venue.name,
        date: new Date(fixture.date),
      });
      context.log('The game record successfully updated.');

      const response = JSON.stringify({
        returnCode: ReturnCodes.NOT_FINISHED,
        groupId: undefined,
        game: undefined,
      });
      context.log(`Response object: ${response}`);
      return response;
    }
  } catch (error) {
    context.log.error('The function has failed with the following error:', error);
    throw error;
  }
};

export default activityFunction;
