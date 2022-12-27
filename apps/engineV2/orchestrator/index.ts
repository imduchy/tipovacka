import * as df from 'durable-functions';
import { ReturnCodes, ReturnObject } from '../utils/returnCodes';

const orchestrator = df.orchestrator(function* (context) {
  const groupId = '610e588d781739002fc69fb8';

  context.log('Executing the update game activity function.');
  const updateGameResponse: ReturnObject = yield context.df.callActivity('updateGame', groupId);

  context.log(`The update game activity returned with ${JSON.stringify(updateGameResponse)}`);

  if (updateGameResponse.code === ReturnCodes.GAME_FINISHED) {
    context.log('Executing the evaluate bets activity function.');
    const evaluateBetsResponse = yield context.df.callActivity('evaluateBets', [
      groupId,
      updateGameResponse.data,
    ]);

    context.log(`The evaluate bets activity returned with ${JSON.stringify(evaluateBetsResponse)}`);
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

  context.log('The orchestrator has finished successfully.');
  return;
});

export default orchestrator;
