import { IGame } from '@duchynko/tipovacka-models';
import * as df from 'durable-functions';
import { Types } from 'mongoose';
import { ReturnCodes } from '../utils/returnCodes';

interface UpdateGameResult {
  returnCode: ReturnCodes;
  groupId: Types.ObjectId | undefined;
  game: (IGame & { _id: Types.ObjectId }) | undefined;
}

interface EvaluateBetsResult {
  returnCode: ReturnCodes;
  groupId: Types.ObjectId;
}

const orchestrator = df.orchestrator(function* (context) {
  const updateGameResult: UpdateGameResult = JSON.parse(
    yield context.df.callActivity('update-game')
  );

  if (updateGameResult.returnCode === ReturnCodes.FINISHED_AND_UPDATED) {
    const evaluateBetsResult: EvaluateBetsResult = JSON.parse(
      yield context.df.callActivity('evaluate-bets', {
        groupId: updateGameResult.groupId,
        game: updateGameResult.game,
      })
    );
  } else if (updateGameResult.returnCode === ReturnCodes.POSTPONED_AND_UPDATED) {
    // yield context.df.callActivity('get-uppcoming-game', {
    // })
  }

  return updateGameResult;
});

export default orchestrator;
