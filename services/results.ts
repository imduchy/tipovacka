import dotenv from 'dotenv'
import { Types } from 'mongoose'
import Game, { IGame, IGameDocument } from '../models/Game'
import User, { IUser } from '../models/User'
import { IBet } from '../models/Bet'
import { GameStatus } from '../models/Enums'
import * as FootballApi from './footballApi'

dotenv.config()

/**
 * Fetches a given fixture from the API and updates the matching
 * game record in the database.
 *
 * @param game game record to update
 * @throws Error if a game object returned from the database is undefined
 */
export async function updateGame(game: IGame): Promise<IGameDocument> {
  const { data } = await FootballApi.getFixture({ id: game.gameId })
  const gameRecord = await Game.findOneAndUpdate(
    { _id: game._id },
    {
      status: GameStatus[data.response[0].fixture.status.short],
      awayTeamScore: data.response[0].goals.away,
      homeTeamScore: data.response[0].goals.home,
      venue: data.response[0].fixture.venue.name,
      date: new Date(data.response[0].fixture.date),
    },
    { new: true }
  )

  if (!gameRecord) throw new Error(`Couldn't update game ${game._id}.`)
  return gameRecord
}

/**
 * Fetches the latest updates for the fixture and updates the game record
 * in the database. Then it checks if the game has finished (GameStatus is
 * FT or PEN). If it has finished, it loops through all users, evaluates
 * their bets, and assigns points appropriately.
 *
 * @param game game for which bets will be evaluated
 * @param users users of a group whose bets will be evaluated
 */
export const evaluateBetsForGame = async (game: IGame, users: IUser[]) => {
  // Update the game first
  game = await updateGame(game)

  // If game hasn't finished yet, there's no reason to continue
  if (!hasFinished(game)) return

  for (const user of users) {
    if (hasPlacedBet(user, game)) {
      const bet = getUsersBetForGame(user, game)
      const points = calculatePoints(bet!, game)
      if (points < 0) return

      await assignPoints(user, points, game.competition)
    }
  }
}

function hasFinished(game: IGame): boolean {
  return game.status === GameStatus.FT || game.status === GameStatus.PEN
}

function hasPlacedBet(user: IUser, game: IGame): boolean {
  if (user.bets) {
    return user.bets.some((bet) => (bet.game as Types.ObjectId).equals(game._id!))
  }
  return false
}

function getUsersBetForGame(user: IUser, game: IGame): IBet | undefined {
  if (!user.bets) {
    return undefined
  }
  return user.bets.filter((b: IBet) => (b.game as Types.ObjectId).equals(game._id!))[0]
}

function calculatePoints(bet: IBet, game: IGame): number {
  function __evaluate1X2(homeTeamScore: number, awayTeamScore: number) {
    if (homeTeamScore > awayTeamScore) {
      return 1
    } else if (homeTeamScore < awayTeamScore) {
      return 2
    } else {
      return 0
    }
  }

  const isExactScore =
    bet.homeTeamScore === game.homeTeamScore && bet.awayTeamScore === game.awayTeamScore
  const gameResult = __evaluate1X2(game.homeTeamScore!, game.awayTeamScore!)
  const betResult = __evaluate1X2(bet.homeTeamScore, bet.awayTeamScore)

  if (isExactScore) return 3
  else if (gameResult === betResult) return 1
  else return 0
}

/**
 * Loops through all totalScore records in the user record, and finds one
 * whose competition id matche the competitionId parameter. If it finds one,
 * it adds value of points parameter to the actual number of points in that
 * totalScore object. If it doesn't find matching competition, it throws an
 * error.
 *
 * @param user a user to whom points should be assigned
 * @param points number of points to assign
 * @param competitionId id of the competition (from the API)
 * @returns an updated user object
 * @throws Error if competition with competitionId doesn't exist in the user object
 */
async function assignPoints(user: IUser, points: number, competitionId: number) {
  for (const competition of user.totalScore!) {
    if (competition.competitionId === competitionId) {
      competition.score += points
      return await User.findOneAndUpdate(
        { _id: user._id },
        { totalScore: user.totalScore },
        { new: true }
      )
    } else {
      throw new Error(
        `User ${user._id} (${user.username}) has no totalScore record for the competition ${competition}`
      )
    }
  }
}
