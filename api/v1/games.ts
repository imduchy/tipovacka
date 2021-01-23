import express, { NextFunction, Request, Response } from 'express'
import Game from '../../models/Game'
import { IUser } from '../../models/User'
import { isAdmin, isLoggedIn } from '../../utils/auth'
import logger from '../../utils/logger'

const router = express.Router()

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (isAdmin(req) || isLoggedIn(req)) {
    next()
    return
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser)._id
    } from IP: ${req.ip}.`
  )
  res.status(401).send('Unauthorized request')
}

/**
 * Get game by id
 * Access: Private
 */
router.get('/:gameId', authMiddleware, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId)
    if (!game) {
      logger.warn(`Game with _id ${req.params.gameId} doesn't exist.`)
      res.status(404).json("We couldn't find this game")
      return
    }

    res.status(200).json(game)
  } catch (error) {
    logger.error(`Couldn't fetch a game ${req.params.gameId}. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

export default router
