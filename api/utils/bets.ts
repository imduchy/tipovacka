import { IUserDocument } from '@duchynko/tipovacka-models';
import { Types } from 'mongoose';

// TODO: Rename this method to hasPlacedBet() and use it in services/results.ts
export const alreadyBet = (
  user: IUserDocument,
  gameId: string | Types.ObjectId
): boolean => {
  const castedGameId = typeof gameId === 'string' ? new Types.ObjectId(gameId) : gameId;

  return user.bets!.some((bet) => (bet.game as Types.ObjectId).equals(castedGameId));
};
