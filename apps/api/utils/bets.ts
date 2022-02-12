import { IUser } from '@tipovacka/models';
import { HydratedDocument, Types } from 'mongoose';

// TODO: Rename this method to hasPlacedBet() and use it in services/results.ts
export const alreadyBet = (
  user: HydratedDocument<IUser>,
  gameId: string | Types.ObjectId
): boolean => {
  const castedGameId = typeof gameId === 'string' ? new Types.ObjectId(gameId) : gameId;

  return user.bets.some((bet) => (bet.game as Types.ObjectId).equals(castedGameId));
};
