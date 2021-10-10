import { Group, IGame } from '@duchynko/tipovacka-models';
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
  const groups = JSON.parse(yield context.df.callActivity('update-game'));

  for (let group of groups) {
    const updateResult: UpdateGameResult = JSON.parse(
      yield context.df.callActivity('update-game', { groupId: group })
    );

    if (updateResult.returnCode === ReturnCodes.FINISHED_AND_UPDATED) {
      const evaluateResult: EvaluateBetsResult = JSON.parse(
        yield context.df.callActivity('evaluate-bets', {
          groupId: updateResult.groupId,
          game: updateResult.game,
        })
      );

      const upcomingGameResult = JSON.parse(
        yield context.df.callActivity('get-uppcoming-game', {
          groupId: evaluateResult.groupId,
        })
      );
    } else if (updateResult.returnCode === ReturnCodes.POSTPONED_AND_UPDATED) {
      const upcomingGameResult = JSON.parse(
        yield context.df.callActivity('get-uppcoming-game', {
          groupId: updateResult.groupId,
        })
      );
    }

    return updateResult;
  }
});

export default orchestrator;
