import { IUserWithID } from '@tipovacka/models';
import { Types } from 'mongoose';

export const hasPlacedBet = (user: IUserWithID, gameId: string | Types.ObjectId): boolean => {
  const castedGameId = typeof gameId === 'string' ? new Types.ObjectId(gameId) : gameId;

  return user.bets.some((bet) => (bet.game as Types.ObjectId).equals(castedGameId));
};
