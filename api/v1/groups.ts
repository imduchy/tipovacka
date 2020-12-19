import { Router } from 'express'
import Game from '../../models/Game'
import Group, { IGroupCompetition } from '../../models/Group'
import { findUpcommingGame } from '../../services/games'
import logger from '../../utils/logger'

const router = Router()

/**
 * Get users of a group by group's _id
 * Access: External function
 */
router.get('/:groupId/users', async (req, res) => {
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
router.get('/:groupId', async (req, res) => {
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

/**
 * Create a group
 * Access: ADMIN
 */
router.post('/', async ({ body }, res) => {
  try {
    const group = await Group.create({
      name: body.name,
      email: body.email,
      users: [],
      website: body.website,
      teamId: body.teamId,
      competitions: body.competitions,
      games: [],
    })

    const competitionIds = body.competitions.map(
      (c: IGroupCompetition) => c.competitionId
    )
    const upcommingGame = await findUpcommingGame(body.teamId, competitionIds)
    upcommingGame.groupId = group._id
    const game = await Game.create(upcommingGame)

    group.upcommingGame = game._id
    await group.save()

    logger.info(`A new group ${group.name} (${group._id}) was created.`)
    res.status(200).json(group)
  } catch (error) {
    logger.error(`Couldn't create a new group. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

export default router
