import { AzureFunction, Context } from '@azure/functions';
import { Game, GameStatus, Group, IGameDocument } from '@duchynko/tipovacka-models';
import { FootballApi, FootballApiMappings } from '@duchynko/tipovacka-utilities';
import { getDatabase } from '../utils/database';
import { ReturnCodes } from '../utils/returnCodes';
import { hasBeenCancelled, hasBeenPostponed, hasFinished } from './utils';

const activityFunction: AzureFunction = async function (
  context: Context
): Promise<string> {
  try {
    await getDatabase();

    const groups = await Group.find().populate('upcomingGames');
    context.log(`Starting to update upcoming games of all ${groups.length} groups.`);

    for (const group of groups) {
      /**
       * TODO: Instead of processing all groups in one function, return the list
       * of all groups to the orchestrator, and concurrently invoke another function
       * for each group to update games.
       */
      context.log(`Retrieved the group ${group.name} (${group._id}).`);
      const upcomingGame = group.upcomingGames[0] as IGameDocument;
      context.log(
        `The upcoming game for the group is the game ${upcomingGame.gameId} between ` +
          `${upcomingGame.homeTeam.name} and ${upcomingGame.awayTeam.name}.`
      );

      context.log('Fetching a fixture for the game from the Football API.');
      const fixtureResponse = await FootballApi.getFixture({
        id: upcomingGame.gameId,
      });

      if (!fixtureResponse.data.response[0]) {
        /**
         * TODO: Log a specific message and use an equivalent of AWS Metric Filters
         * to trigger an alarm if this happens.
         */
        context.log.warn('Fixture response contains no data.');
        context.log.warn('Response: ' + JSON.stringify(fixtureResponse.data));
        continue;
      }
      const { goals, fixture } = fixtureResponse.data.response[0];

      context.log(`The status of the game is: ${fixture.status.long}.`);
      if (hasFinished(fixture)) {
        context.log('Fetching the fixture events from the Football API.');
        const eventsResponse = await FootballApi.getEvents({
          fixture: upcomingGame.gameId,
        });

        const events = eventsResponse.data.response;
        if (!events) {
          /**
           * TODO: Log a specific message and use an equivalent of AWS Metric Filters
           * to trigger an alarm if this happens.
           */
          context.log.warn('Fixture events response contains no data.');
          context.log.warn('Response: ' + JSON.stringify(eventsResponse.data));
          continue;
        }

        context.log(`Updating the game record with ${events.length} game events.`);
        const gameRecord = await Game.findByIdAndUpdate(upcomingGame._id, {
          status: GameStatus[fixture.status.short],
          awayTeamScore: goals.away,
          homeTeamScore: goals.home,
          venue: fixture.venue.name,
          date: new Date(fixture.date),
          //@ts-ignore should be fixed in mongoose 6.0.8
          // https://github.com/Automattic/mongoose/issues/10597
          events: FootballApiMappings.mapFixtureEvents(events),
        });

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
        context.log('Updating the game record with the new status.');
        await Game.findByIdAndUpdate(upcomingGame._id, {
          status: GameStatus[fixture.status.short],
          awayTeamScore: goals.away,
          homeTeamScore: goals.home,
          venue: fixture.venue.name,
          date: new Date(fixture.date),
        });
        context.log('The game record was successfully updated.');

        const response = JSON.stringify({
          returnCode: ReturnCodes.POSTPONED_AND_UPDATED,
          groupId: group._id,
          game: undefined,
        });
        context.log(`Response object: ${response}`);
        return response;

        // If a game hasn't yet finished, there's nothing to do
      } else {
        context.log('Returning as there is nothing else to do.');

        const response = JSON.stringify({
          returnCode: ReturnCodes.NOT_FINISHED,
          groupId: undefined,
          game: undefined,
        });
        context.log(`Response object: ${response}`);
        return response;
      }
    }
  } catch (error) {
    context.log.error('The function has failed with the following error:', error);
    throw error;
  }
};

export default activityFunction;
