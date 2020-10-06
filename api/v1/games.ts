import express from 'express'
import logger from '../../utils/logger'
import Game from '../../models/Game'

const router = express.Router()

/**
 * Get game by id
 * Access: Private
 */
router.get('/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId)
    if (!game) {
      logger.warning(`Game with _id ${req.params.gameId} doesn't exist.`)
      res.status(404).json("We couldn't find this game")
    }

    return game
  } catch (error) {
    logger.error(`Couldn't fetch a game ${req.params.gameId}. Error: ${error}`)
    res.status(500).json('Internal server error')
  }
})

/**
 * Create game
 * Access: ADMIN
 */

router.post('/', async ({ body }, res) => {
  try {
    const game = await Game.create({
      gameId: body.gameId,
      date: body.date,
      venue: body.venue,
      awayTeam: body.awayTeam,
      homeTeam: body.homeTeam,
      competition: body.competition,
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

export default router
