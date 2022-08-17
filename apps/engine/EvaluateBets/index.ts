import { AzureFunction, Context } from '@azure/functions';
import { BetStatus, Game, Group, IBetWithID, IUser, User } from '@tipovacka/models';
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
    context.log.verbose(game)

    context.log(`Fetching the group with ID ${groupId}.`);
    const group = await Group.findById(groupId).populate('users');
    context.log.verbose(group)
    context.log(`The group has ${group.users.length} users.`)
    const users = group.users;

    // Check if the game was a derby
    const rivals = group.followedTeams[0].rivals;
    const isRivalHomeTeam = rivals.find((teamId) => teamId === game.homeTeam.teamId);
    const isRivalAwayTeam = rivals.find((teamId) => teamId === game.awayTeam.teamId);
    const isDerby = !!(isRivalAwayTeam || isRivalHomeTeam);
    context.log.verbose(`The game ${isDerby ? "is" : "is not"} a derby.`)

    context.log('Starting to loop over users and evaluate their bets.');
    for (const user of users as HydratedDocument<IUser>[]) {
      if (placedBetOnGame(user, game)) {
        context.log(`The user ${user.username} (${user._id}) has placed a bet on the game.`);
        const bet = user.bets.find((b) => (b.game as Types.ObjectId).equals(game._id)) as IBetWithID;
        context.log.verbose(bet)

        // If the bet was already evaluated, don't process it again.
        if (bet.status === BetStatus.EVALUATED) {
          context.log.warn('The bet has been already evaluated.');
          continue;
        }

        context.log(`Starting to evaluate the bet ${bet._id}.`);
        const points = evaluatePoints(bet, game, isDerby);

        context.log(`The user ${user.username} (${user._id}) has earned ${points} points.`);
        if (points > 0) {
          await assignPoints(user, points, game.competitionId, game.season);
          context.log('Points have been successfully assigned to the user.');
        }

        // TODO: Updating BetStatus and assigning points should probably be part
        // of a transaction. If one of the operations fails, any writes should be
        // rolled back to ensure idempotency.

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
    context.log('Finished iterating over all users in the group.');
    context.log('Publishing the group id to the queue.');
    context.bindings.evaluatedGamesOutput = groupId;
  } catch (error) {
    context.log.error('An error occured while evaluating user bets. Error:', error);
    throw error;
  }
};

export default queueTrigger;
