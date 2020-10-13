import { Router } from 'express'
import Group, { IGroupCompetition } from '../../models/Group'
import logger from '../../utils/logger'
import { findUpcommingGame } from '../../services/games'
import Game from '../../models/Game'

const router = Router()

/**
 * Get a group by ID
 * Access: Private
 */
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate(
      'upcommingGame'
    )
    if (!group) {
      logger.warn(`Group with _id ${req.params.groupId} doesn't exist.`)
      res.status(404).json("We couldn't find this group")
      return
    }

    res.status(200).json(group)
  } catch (error) {
    logger.error(
      `Couldn't fetch a group ${req.params.groupId}. Error: ${error}`
    )
    res.status(500).json('Internal server error')
  }
})

/**
 * Create a group
 * Access: ADMIN
 */
router.post('/', async ({ body }, res) => {
  try {
    const competitionIds = body.competitions.map(
      (c: IGroupCompetition) => c.competitionId
    )

    const upcommingGame = await findUpcommingGame(body.teamId, competitionIds)
    const game = await Game.create(upcommingGame)

    const group = await Group.create({
      name: body.name,
      email: body.email,
      users: [],
      website: body.website,
      teamId: body.teamId,
      competitions: body.competitions,
      upcommingGame: game._id,
    })

    logger.info(`A new group ${group.name} (${group._id}) was created.`)
    res.status(200).json(group)
  } catch (error) {
    logger.error(`Couldn't create a new group. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

export default router
