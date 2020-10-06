import { Types } from 'mongoose'
import { IUser } from '../models/User'

export const alreadyBet = (
  user: IUser,
  gameId: string | Types.ObjectId
): boolean => {
  const castedGameId =
    typeof gameId === 'string' ? Types.ObjectId(gameId) : gameId

  return user.bets!.some((bet) =>
    (bet.game as Types.ObjectId).equals(castedGameId)
  )
}
