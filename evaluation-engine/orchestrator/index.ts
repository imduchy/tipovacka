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
  // groups = yield JSON.parse(context.df.callActivity(get-groups))
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

    const upcomingGameResult = JSON.parse(
      yield context.df.callActivity('get-uppcoming-game', {
        groupId: evaluateBetsResult.groupId,
      })
    );
  } else if (updateGameResult.returnCode === ReturnCodes.POSTPONED_AND_UPDATED) {
    const upcomingGameResult = JSON.parse(
      yield context.df.callActivity('get-uppcoming-game', {
        groupId: updateGameResult.groupId,
      })
    );
  }

  return updateGameResult;
});

export default orchestrator;
