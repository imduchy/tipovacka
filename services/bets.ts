import { Types } from 'mongoose'
import { IUser } from '../models/User'

// TODO: Rename this method to hasPlacedBet() and use it in services/results.ts
export const alreadyBet = (user: IUser, gameId: string | Types.ObjectId): boolean => {
  const castedGameId = typeof gameId === 'string' ? Types.ObjectId(gameId) : gameId

  return user.bets!.some((bet) => (bet.game as Types.ObjectId).equals(castedGameId))
}
