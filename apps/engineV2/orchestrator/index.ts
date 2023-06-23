import { IGroup } from '@tipovacka/models';
import { HydratedDocument } from 'mongoose';
import * as df from 'durable-functions';
import { ReturnCodes, ReturnObject } from '../utils/returnCodes';

const orchestrator = df.orchestrator(function* (context) {
  context.log('The orchestrator has started.');

  context.log('Executing the get groups activity function.');
  const groupsResponse: ReturnObject = yield context.df.callActivity('getGroups', null);
  const groups: Array<HydratedDocument<IGroup>> = groupsResponse.data;
  context.log(`The get groups activity returned ${groups.length} groups.`);

  for (const group of groups) {
    // To avoid throttling by the Football API, wait 1 minute between each group.
    context.log('Waiting 1 minute before processing the next group.');
    const oneMinuteDelay = new Date(context.df.currentUtcDateTime.valueOf() + 60000);
    yield context.df.createTimer(oneMinuteDelay);

    context.log(`Starting to process group ${group.name} with id ${group._id}.`);
    const groupId = group._id;

    context.log('Executing the update game activity function.');
    const updateGameResponse: ReturnObject = yield context.df.callActivity('updateGame', groupId);

    context.log(`The update game activity returned with ${JSON.stringify(updateGameResponse)}`);

    if (updateGameResponse.code === ReturnCodes.GAME_FINISHED) {
      context.log('Executing the evaluate bets activity function.');
      const evaluateBetsResponse = yield context.df.callActivity('evaluateBets', [
        groupId,
        updateGameResponse.data,
      ]);

      context.log(
        `The evaluate bets activity returned with ${JSON.stringify(evaluateBetsResponse)}`
      );
    }

    if (updateGameResponse.code !== ReturnCodes.GAME_NOT_FINISHED) {
      context.log('Executing the get upcoming game activity function.');
      const upcomingGameResponse = yield context.df.callActivity('getUpcomingGame', groupId);

      context.log(`The update game activity returned with ${JSON.stringify(upcomingGameResponse)}`);
    }

    context.log('Executing the update competition activity function.');
    const updateCompetitionResponse = yield context.df.callActivity('updateCompetition', groupId);

    context.log(
      `The update competition activity returned with ${JSON.stringify(updateCompetitionResponse)}`
    );
  }

  context.log('The orchestrator has finished successfully.');
  return;
});

export default orchestrator;
