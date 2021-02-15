import { NextFunction, Request, Response, Router } from 'express'
import { IBet, Game, User, IUser } from '@duchynko/tipovacka-models'
import { Types } from 'mongoose'
import { isAdmin, isLoggedIn } from '../utils/authMiddleware'
import { alreadyBet } from '../utils/bets'
import logger from '../utils/logger'

const router = Router()

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    next()
    return
  }

  if (isLoggedIn(req)) {
    const user = req.user as IUser & { _id: Types.ObjectId }
    // Only allow user to create bet if user ids match
    if (user._id!.equals(req.body.userId)) {
      next()
      return
    }
  }

  logger.warn(
    `[${req.method} ${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser & { _id: Types.ObjectId })._id
    } from IP: ${req.ip}.`
  )
  res.status(401).send('Unauthorized request')
}

/**
 * Create a bet
 * Access: Authenticated
 */
router.post('/', authMiddleware, async ({ body }, res) => {
  try {
    const user = await User.findById(body.userId)
    if (!user) {
      logger.warn(`User with _id ${body.userId} doesn't exist.`)
      res.status(404).json('Something went wrong.')
      return
    }

    if (alreadyBet(user, body.gameId)) {
      logger.warn(
        `User ${body.userId} has already placed a bet on the game ${body.gameId}`
      )
      res.status(400).json('You already placed a bet on this game')
      return
    }

    const game = await Game.findById(body.gameId)
    if (!game) {
      res.status(404).json('Game not found')
      return
    }

    if (new Date().getTime() > game.date.getTime()) {
      res.status(400).json('Game already started')
      return
    }

    user.bets!.addToSet({
      game: body.gameId,
      homeTeamScore: body.homeTeamScore,
      awayTeamScore: body.awayTeamScore,
    } as IBet)
    await user.save()
    logger.info(`A user ${user._id} submitted a bet on a game ${body.gameId}.`)

    res.status(200).json(user.bets)
  } catch (error) {
    logger.error(`Couldn't create a bet. Error: ${error}.`)
    res.status(500).json('An internal error occured')
  }
})

export default router
