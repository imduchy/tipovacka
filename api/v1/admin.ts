import { NextFunction, Request, Response, Router } from 'express'
import Game from '../../models/Game'
import Group, { IGroupCompetition } from '../../models/Group'
import User from '../../models/User'
import { findUpcomingGame } from '../../services/games'
import { isAdmin } from '../../utils/auth'
import logger from '../../utils/logger'

const router = Router()

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    next()
    return
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && req.user._id
    } from IP: ${req.ip}. The provided ADMIN_API_TOKEN was ${JSON.stringify(
      req.header('tipovacka-auth-token')
    )}`
  )
  res.status(401).send('Unauthorized request')
}

/**
 * Intended for testing the adminAuth middleware
 */
router.get('/test', (req, res) => {
  res.status(200).send(req.originalUrl)
})

/**
 * Get upcoming game
 * Access: ADMIN
 */
router.get('/:groupId/upcomingGame', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('upcomingGame')

    if (!group) {
      throw new Error(`Group with id ${req.params.groupId} doesn't exist.`)
    }

    const competitions = group.competitions.map((c) => c.competitionId)
    const newUpcomingGame = await findUpcomingGame(group.teamId, competitions)

    if (!newUpcomingGame) {
      logger.warn(
        `Didn't find an upcoming game for the team ${group.teamId} ` +
          `in the following competitions ${competitions}.`
      )
      return res.status(200).json("Didn't find any upcoming games.")
    }

    if (newUpcomingGame.gameId === group.upcomingGame?.gameId) {
      res.status(304).json('The current upcoming game is correct. No changes needed.')
      return
    }
    newUpcomingGame.groupId = group._id
    const game = await Game.create(newUpcomingGame)

    const response = await Group.findByIdAndUpdate(
      group._id,
      {
        upcomingGame: game._id,
      },
      { new: true }
    )
    res.status(200).json(response)
  } catch (error) {
    res.status(400).json(error.message)
  }
})

/**
 * Create a user
 * Access: ADMIN
 */
router.post('/users', authMiddleware, async ({ body }, res) => {
  try {
    const group = await Group.findById(body.groupId)
    if (!group) {
      logger.warn(`Group with _id ${body.groupId} doesn't exist.`)
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

/**
 * Create game
 * Access: ADMIN
 */
router.post('/games', authMiddleware, async ({ body }, res) => {
  try {
    const game = await Game.create({
      gameId: body.gameId,
      groupId: body.groupId,
      date: body.date,
      venue: body.venue,
      awayTeam: body.awayTeam,
      homeTeam: body.homeTeam,
      competitionId: body.competition,
      competitionName: body.competitionName,
      season: body.season,
      status: body.status,
    })
    logger.info(`Game ${game.gameId} (${game._id}) created.`)

    res.status(200).json(game)
  } catch (error) {
    logger.error(`Couldn't create a new game. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

/**
 * Create a group
 * Access: ADMIN
 */
router.post('/groups', authMiddleware, async ({ body }, res) => {
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

    const competitionIds: number[] = body.competitions.map(
      (c: IGroupCompetition) => c.competitionId
    )
    const upcomingGame = await findUpcomingGame(body.teamId, competitionIds)
    upcomingGame.groupId = group._id
    const game = await Game.create(upcomingGame)

    group.upcomingGame = game._id
    await group.save()

    logger.info(`A new group ${group.name} (${group._id}) was created.`)
    res.status(200).json(group)
  } catch (error) {
    logger.error(`Couldn't create a new group. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

router.delete('/users', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.body.userId })
    logger.info(`A user with id ${req.body.userId} successfully removed.`)
    res.status(200).json(user)
  } catch (error) {
    logger.error(`Couldn't remove a user with id ${req.body.userId}. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

export default router
