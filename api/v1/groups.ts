import { Router } from 'express'
import Group, { IGroupCompetition } from '../../models/Group'
import logger from '../../utils/logger'
import { findUpcommingGame } from '../../services/games'
import Game, { IGame } from '../../models/Game'
import { evaluateBetsForGame, updateGame } from '../../services/results'
import { IUser } from '../../models/User'

const router = Router()

router.get('/:groupId/latestFixture', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('games')
      .populate('users')
    const latestGame = group?.games.slice(-1).pop() as IGame
    const users = group?.users as IUser[]
    console.log('Users length', users.length)
    console.log('Latest game', latestGame.awayTeam, 'vs', latestGame.homeTeam)
    await evaluateBetsForGame(latestGame, users)
    res.status(200).json(latestGame)
  } catch (error) {
    console.error(error)
  }
})

router.get('/:groupId/latestFixtureUpdate', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('games')
    const game = group!.games.slice(-1)[0] as IGame
    console.log('Game:', game)
    const latestGame = await updateGame(game)
    res.status(200).json(latestGame)
  } catch (error) {
    console.error(error)
  }
})

/**
 * Get all users from a specific group
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
  }
})

/**
 * Get a group by ID
 * Access: Private
 */
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('upcommingGame')
    if (!group) {
      logger.warn(`Group with _id ${req.params.groupId} doesn't exist.`)
      res.status(404).json("We couldn't find this group")
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
      games: [],
      upcommingGame: game._id,
    })

    logger.info(`A new group ${group.name} (${group._id}) was created.`)
    res.status(200).json(group)
  } catch (error) {
    logger.error(`Couldn't create a new group. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

/**
 * Get upcoming game
 * Access: ADMIN
 */
router.get('/:groupId/upcomingGame', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)

    if (!group) {
      throw new Error(`Group with id ${req.params.groupId} doesn't exist.`)
    }

    const competitions = group.competitions.map((c) => c.competitionId)
    const newUpcomingGame = await findUpcommingGame(group.teamId, competitions)

    if (!newUpcomingGame) {
      console.warn(
        `Didn't find an upcoming game for the team ${group.teamId} in the following competitions ${competitions}.`
      )
      return res.status(200).json("Didn't find any upcoming games.")
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

export default router
