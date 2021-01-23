import express, { NextFunction, Request, Response } from 'express'
import User from '../../models/User'
import { isAdmin, isLoggedIn } from '../../utils/auth'
import logger from '../../utils/logger'

const router = express.Router()

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    next()
    return
  }

  if (isLoggedIn(req)) {
    const user = req.user
    // Only allow user to access his own User object
    if (user && user._id!.equals(req.params.userId)) {
      next()
      return
    }
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && req.user._id
    } from IP: ${req.ip}.`
  )
  res.status(401).send('Unauthorized request')
}

/**
 * Get a user
 * Access: Protected
 */
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'bets',
      model: 'bet',
      populate: { path: 'game', model: 'game' },
    })
    if (!user) {
      logger.warn(`User with _id ${req.params.userId} doesn't exist.`)
      res.status(404).json("We couldn't find this user")
      return
    }

    res.status(200).json(user)
  } catch (error) {
    logger.error(`Couldn't fetch a user ${req.params.userId}. Error: ${error}.`)
    res.status(500).json('Internal server error')
  }
})

export default router
