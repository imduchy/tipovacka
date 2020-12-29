import { NextFunction, Request, Response, Router } from 'express'
import { isAdmin, isLoggedIn } from '../../utils/auth'
import Group from '../../models/Group'
import { IUser } from '../../models/User'
import logger from '../../utils/logger'

const router = Router()

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    next()
    return
  }

  if (isLoggedIn(req)) {
    const user = req.user as IUser
    // Only allow user to access his own User object
    if (user.groupId!.equals(req.params.groupId)) {
      next()
      return
    }
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser)._id
    } from IP: ${req.ip}.`
  )
  res.status(401).send('Unauthorized request')
}

/**
 * Get users of a group by group's _id
 * Access: External function
 */
router.get('/:groupId/users', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('users')
    if (group) {
      res.status(200).json(group.users)
    } else {
      res.status(404)
    }
  } catch (error) {
    logger.error(error) // TODO: Update this
    res.status(404)
  }
})

/**
 * Get a group by _id
 * Access: Private
 */
router.get('/:groupId', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('upcommingGame')
    if (!group) {
      logger.warn(`Group with _id ${req.params.groupId} doesn't exist.`)
      res.status(404).json("Group doesn't exist")
      return
    }
    res.status(200).json(group)
  } catch (error) {
    logger.error(`Couldn't fetch a group ${req.params.groupId}. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

export default router
