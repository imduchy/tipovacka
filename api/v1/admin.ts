import { Router } from 'express'
import logger from '../../utils/logger'
import Game from '../../models/Game'
import Group from '../../models/Group'
import { findUpcommingGame } from '../../services/games'

const router = Router()

/**
 * Get upcoming game
 * Access: ADMIN
 */
router.get('/:groupId/upcomingGame', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('upcommingGame')

    if (!group) {
      throw new Error(`Group with id ${req.params.groupId} doesn't exist.`)
    }

    const competitions = group.competitions.map((c) => c.competitionId)
    const newUpcomingGame = await findUpcommingGame(group.teamId, competitions)

    if (!newUpcomingGame) {
      logger.warn(
        `Didn't find an upcoming game for the team ${group.teamId} ` +
          `in the following competitions ${competitions}.`
      )
      return res.status(200).json("Didn't find any upcoming games.")
    }

    if (newUpcomingGame.gameId === group.upcommingGame?.gameId) {
      res.status(304).json('The current upcoming game is correct. No changes needed.')
      return
    }
    newUpcomingGame.groupId = group._id
    const game = await Game.create(newUpcomingGame)

    const response = await Group.findByIdAndUpdate(
      group._id,
      {
        upcommingGame: game._id,
      },
      { new: true }
    )
    res.status(200).json(response)
  } catch (error) {
    res.status(400).json(error.message)
  }
})
