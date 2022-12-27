import { AzureFunction, Context } from '@azure/functions';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { BetStatus, Game, Group, IBetWithID, IGameWithID, IUser, User } from '@tipovacka/models';
import { getDatabase } from '../utils/database';
import { ReturnCodes, ReturnObject } from '../utils/returnCodes';
import { assignPoints, evaluatePoints, placedBetOnGame } from './utils';
import { HydratedDocument, Types } from 'mongoose';

const activityFunction: AzureFunction = async function (
  context: Context,
  data: Array<string | IGameWithID>
): Promise<ReturnObject> {
  context.log(`Received the array ${data}`);
  const groupId = data[0] as string;
  const game = Game.hydrate(data[1]);

  const keyVaultUrl = process.env.KEY_VAULT_URL;
  const credentials = new DefaultAzureCredential();
  const secretClient = new SecretClient(keyVaultUrl, credentials);

  context.log('Fetching secrets from the Key Vault.');
  const connectionStringSecret = await secretClient.getSecret('DB-CONNECTION-STRING');

  context.log('Getting the database object.');
  await getDatabase(connectionStringSecret.value);

  context.log('Retrieving the group object from the database.');
  const group = await Group.findById(groupId).populate('users');
  const users = group.users as Array<HydratedDocument<IUser>>;

  context.log('Checking if the game is a derby.');
  const rivals = group.followedTeams[0].rivals;
  const isRivalHomeTeam = rivals.find((teamId) => teamId === game.homeTeam.teamId);
  const isRivalAwayTeam = rivals.find((teamId) => teamId === game.awayTeam.teamId);
  const isDerby = !!(isRivalAwayTeam || isRivalHomeTeam);
  context.log(`Is derby: ${isDerby}`);

  context.log('Starting to loop over users and evaluate bets.');
  for (const user of users) {
    if (!placedBetOnGame(user, game)) continue;

    context.log(`Evaluating a bet of the user ${user.username}.`);
    const bet = user.bets.find((b) => (b.game as Types.ObjectId).equals(game._id)) as IBetWithID;

    if (bet.status === BetStatus.EVALUATED) {
      context.log('The bet has been evaluated already.');
      continue;
    }

    const points = evaluatePoints(bet, game, isDerby);
    context.log(`The user ${user.username} has earned ${points} points.`);

    if (points === 0) {
      continue;
    }

    context.log('Assigning points to the user.');
    await assignPoints(user, points, game.competitionId, game.season);

    context.log("Updating the user's bet.");
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

  context.log('Finished iterating over all users in the group.');

  return {
    code: ReturnCodes.BETS_EVALUATED,
    data: undefined,
  };
};

export default activityFunction;
