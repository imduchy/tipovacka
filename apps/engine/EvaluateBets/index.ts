import { AzureFunction, Context } from '@azure/functions';
import { BetStatus, Game, Group, IBet, IUser, User } from '@tipovacka/models';
import { HydratedDocument, Types } from 'mongoose';
import { getDatabase } from '../src/database';
import { assignPoints, evaluatePoints, placedBetOnGame } from './utils';

export const queueTrigger: AzureFunction = async function (context: Context): Promise<void> {
  context.log('Starting to process the item', context.bindings.queueItem);

  try {
    await getDatabase();

    const queueItem = context.bindings.queueItem;
    const groupId = queueItem.groupId;
    const game = Game.hydrate(queueItem.game);

    context.log(`Fetching the group ${groupId}.`);
    const group = await Group.findById(groupId).populate('users');
    context.log(`The group ${group.name} successfully fetched.`);
    const users = group.users;

    // Check if the game was a derby
    const rivals = group.followedTeams[0].rivals;
    const isRivalHomeTeam = rivals.find((teamId) => teamId === game.homeTeam.teamId);
    const isRivalAwayTeam = rivals.find((teamId) => teamId === game.awayTeam.teamId);
    const isDerby = !!(isRivalAwayTeam || isRivalHomeTeam);

    context.log('Starting to loop over bets and evaluate them.');
    for (const user of users as HydratedDocument<IUser>[]) {
      if (placedBetOnGame(user, game)) {
        context.log(`User ${user.username} (${user._id}) has placed a bet on the game.`);

        // Find the matching bet
        const bet = user.bets.find((b) => (b.game as Types.ObjectId).equals(game._id)) as IBet & {
          _id: string;
        };

        // If the bet was already evaluated, don't process it again.
        if (bet.status === BetStatus.EVALUATED) {
          context.log.warn('The bet was already evaluated. Skipping to the next user.');
          continue;
        }

        context.log(`Evaluating the bet (${bet._id}) and calculating earned points.`);
        const points = evaluatePoints(bet, game, isDerby);

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
          {
            $set: {
              'bets.$.status': BetStatus.EVALUATED,
              'bets.$.points': points,
            },
          }
        );
      }
    }
    context.log(
      'Finished iterating over all users in the group. Publishing the group id to the queue.'
    );
    context.bindings.evaluatedGamesOutput = groupId;
  } catch (error) {
    context.log.error('An error occured while evaluating user bets. Error:', error);
    throw error;
  }
};

export default queueTrigger;
