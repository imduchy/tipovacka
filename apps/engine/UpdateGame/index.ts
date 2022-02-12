import { AzureFunction, Context } from '@azure/functions';
import { Game, GameStatus, Group, IGame } from '@tipovacka/models';
import { HydratedDocument } from 'mongoose';
import { getDatabase } from '../src/database';
import * as FootballApi from '../src/footballApi';
import { hasBeenCancelled, hasBeenPostponed, hasFinished, mapFixtureEvents } from './utils';

/**
 * A CRON job executed every 2 hours. The function fetches latest fixture
 * information for the upcomingGame of all groups from the Football API.
 * If a game has already finished, it will update the record in the master
 * database and publish the record with the updated game to a queue.
 */
const timerTrigger: AzureFunction = async function (context: Context): Promise<void> {
  try {
    await getDatabase();

    const groups = await Group.find().populate('upcomingGame');

    context.log('Starting to update upcoming games of all groups.');
    for (const group of groups) {
      context.log(`Retrieved the group ${group.name} (${group._id}).`);

      const upcomingGame = group.upcomingGame as HydratedDocument<IGame>;
      // If the group doesn't have any upcoming game, the group's id will be
      // published to the "evaluated-games" queue so that it triggers the
      // "GetUpcomingGame" function to check for the upcoming game.
      if (!upcomingGame) {
        context.log(
          'Group has no upcoming game specified. Publishing its _id to the ' +
            '"evaluated-games" queue.'
        );
        context.bindings.evaluatedGamesOutput = group._id;
        continue;
      }

      context.log(
        `The upcomingGame for the group is the game (${upcomingGame.gameId})` +
          `between ${upcomingGame.homeTeam.name} and ${upcomingGame.awayTeam.name}.`
      );

      context.log('Fetching the fixture for the game from the Football API.');
      const fixtureResponse = await FootballApi.getFixture(context.log, {
        id: upcomingGame.gameId,
      });

      // If the response for some reason contains no data, log a warn message and
      // continue iterating over next groups.
      if (!fixtureResponse.data.response[0]) {
        // TODO: Log a specific message and use the equivalent of Metric Filters
        // in Azure, to trigger an alarm if this occurs.
        context.log.warn('Fixture response from the Football API contains no data.');
        continue;
      }
      const { goals, fixture } = fixtureResponse.data.response[0];

      if (hasFinished(fixture)) {
        context.log(`The game has finished with the status ${fixture.status.long}.`);

        context.log('Fetching the fixture events from the Football API.');
        const eventsResponse = await FootballApi.getEvents(context.log, {
          fixture: upcomingGame.gameId,
        });

        // If the response for some reason contains no data, log a warn message and
        // continue iterating over next groups.
        const events = eventsResponse.data.response;
        if (!events) {
          // TODO: Log a specific message and use the equivalent of Metric Filters
          // in Azure, to trigger an alarm if this occurs.
          context.log.warn('Fixture events response from the Football API contains no data.');
          continue;
        }

        context.log(`Updating the game record with ${events.length} game events.`);
        const updatedRecord = await Game.findOneAndUpdate(
          { _id: upcomingGame._id },
          {
            status: GameStatus[fixture.status.short],
            awayTeamScore: goals.away,
            homeTeamScore: goals.home,
            venue: fixture.venue.name,
            date: new Date(fixture.date),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            events: mapFixtureEvents(events),
          },
          { new: true }
        );
        context.log('The game record successfully updated.');

        context.log("Publishing the groupId and game record to the 'updated-games' queue.");
        context.bindings.updatedGamesOutput = {
          groupId: group._id,
          game: updatedRecord,
        };
        context.log('The updated game record was successfully published to the queue.');

        // If the fixture has been cancelled or postponed, we will update the
        // game status (and other fields). In the future, when the new date for
        // the game is decided, the game ID from the API will stay the same, and
        // only the date will change.
      } else if (hasBeenCancelled(fixture) || hasBeenPostponed(fixture)) {
        context.log(
          `The game has been cancelled or postponed with the status ${fixture.status.long}.`
        );

        context.log('Updating the game record with the new status.');
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

        context.log("Publishing the game's _id to the 'evaluated-games' queue");
        context.bindings.evaluatedGamesOutput = group._id;
        context.log("The game's _id was successfully published to the queue.");

        // Otherwise, if the game hasn't finished yet, no action is required.
      } else {
        context.log(`The game has not finished yet. The status is ${fixture.status.long}.`);
      }
    }
  } catch (error) {
    context.log.error('The function has failed with the following error:', error);
    throw error;
  }
};

export default timerTrigger;
