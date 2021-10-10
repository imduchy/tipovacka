import { AzureFunction, Context } from '@azure/functions';
import { BetStatus, Game, Group, IUserDocument, User } from '@duchynko/tipovacka-models';
import { Types } from 'mongoose';
import { getDatabase } from '../utils/database';
import { assignPoints, evaluatePoints, placedBetOnGame } from '../utils/evaluation';
import { ReturnCodes } from '../utils/returnCodes';

const activityFunction: AzureFunction = async function (
  context: Context
): Promise<string> {
  context.log('Starting to process the item', context.bindingData);

  try {
    await getDatabase();

    const groupId = context.bindingData.groupId;
    const game = Game.hydrate(context.bindingData.game);

    context.log(`Fetching the group ${groupId}.`);
    const group = await Group.findById(groupId).populate('users');
    context.log(`The group ${group.name} successfully fetched.`);
    const users = group.users;

    context.log('Starting to loop over bets and evaluate them.');
    for (const user of users as IUserDocument[]) {
      if (placedBetOnGame(user, game)) {
        context.log(`User ${user.username} (${user._id}) has placed a bet on the game.`);

        // Find the matching bet
        const bet = user.bets.find((b) => (b.game as Types.ObjectId).equals(game._id));

        // If the bet was already evaluated, don't process it again.
        if (bet.status === BetStatus.EVALUATED) {
          context.log.warn('The bet was already evaluated. Skipping to the next user.');
          continue;
        }

        context.log(`Evaluating the bet (${bet._id}) and calculating earned points.`);
        const points = evaluatePoints(bet, game);

        // If the user earned some points, assign them and update the user record
        // in the database, otherwise no action is needed.
        if (points > 0) {
          context.log(`The user ${user.username} has earned ${points} points.`);
          await assignPoints(user, points, game.competitionId, game.season);
          context.log('Points successfully assigned to the user.');
        } else {
          context.log(
            `The user ${user.username} earned 0 points. Moving on to the next ` + `user.`
          );
        }

        // TODO: Updating BetStatus and assigning points should probably be part
        // of a transaction. If one of the operations fails, any writes should be
        // rolled back to ensure idempotency.

        // After points were successfully assigned, the bet's status should
        // be updated too.
        await User.findOneAndUpdate(
          { _id: user._id, bets: { $elemMatch: { _id: bet._id } } },
          { $set: { 'bets.$.status': BetStatus.EVALUATED } }
        );
      }
    }
    context.log('Finished iterating over all users in the group.');

    const response = JSON.stringify({
      returnCode: ReturnCodes.BETS_EVALUATED,
      groupId: groupId,
    });
    context.log(`Response object: ${response}`);
    return response;
  } catch (error) {
    context.log.error('An error occured while evaluating user bets. Error:', error);
    throw error;
  }
};

export default activityFunction;
