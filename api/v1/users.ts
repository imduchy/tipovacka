import express from 'express'
import logger from '../../utils/logger'
import Group from '../../models/Group'
import User from '../../models/User'

const router = express.Router()

/**
 * Get a user
 * Access: Private (owner)
 */
router.get('/:userId', async (req, res) => {
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

/**
 * Create a user
 * Access: ADMIN
 */
router.post('/', async ({ body }, res) => {
  try {
    const group = await Group.findById(body.groupId)
    if (!group) {
      logger.warning(`Group with _id ${body.groupId} doesn't exist.`)
      res.status(404).json("We couldn't find this group")
      return
    }

    const user = await User.create({
      username: body.username,
      email: body.email,
      password: body.password,
      groupId: body.groupId,
      totalScore: Array.from(group.competitions, (competition) => ({
        competitionId: competition.competitionId,
        season: competition.season,
        score: 0,
      })),
    })
    logger.info(`User ${user._id} created.`)

    group.users.addToSet(user._id)
    await group.save()
    logger.info(`User ${user._id} added to the group ${group.name} (${group._id}).`)

    res.status(200).json(user)
  } catch (error) {
    logger.error(`Couldn't create a user in a group ${body.groupId}. Error: ${error}.`)
    res.status(500).json('Internal server error')
  }
})

export default router
