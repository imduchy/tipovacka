import { Router } from 'express'
import Group from '../../models/Group'
import logger from '../../utils/logger'

const router = Router()

/**
 * Get a group by ID
 * Access: Private
 */
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
    if (!group) {
      logger.warning(`Group with _id ${req.params.groupId} doesn't exist.`)
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
    const group = await Group.create({
      name: body.name,
      email: body.email,
      users: [],
      website: body.website,
      teamId: body.teamId,
      competitionsIds: body.competitionsIds,
    })

    logger.info(`A new group ${group.name} (${group._id}) was created.`)
    res.status(200).json(group)
  } catch (error) {
    logger.error(`Couldn't create a new group. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

export default router
