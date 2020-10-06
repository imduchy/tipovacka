import { Router } from 'express'
import User from '../../models/User'
import logger from '../../utils/logger'
import { IBet } from '../../models/Bet'
import { alreadyBet } from '../../services/bets'

const router = Router()

/**
 * Create a bet
 * Access: Private
 */
router.post('/', async ({ body }, res) => {
  try {
    const user = await User.findById(body.userId)
    if (!user) {
      logger.warning(`User with _id ${body.userId} doesn't exist.`)
      res.status(404).json('Something went wrong.')
      return
    }

    if (alreadyBet(user, body.gameId)) {
      logger.warn(
        `User ${body.userId} has already placed a bet on the game ${body.gameId}`
      )
      res.status(400).json('You already placed a bet on this game')
      return
    }

    user.bets!.addToSet({
      game: body.gameId,
      homeTeamScore: body.homeTeamScore,
      awayTeamScore: body.awayTeamScore,
    } as IBet)
    await user.save()
    logger.info(`A user ${user._id} submitted a bet on a game ${body.gameId}.`)

    res.status(200).json(user.bets)
  } catch (error) {
    logger.error(`Couldn't create a bet. Error: ${error}.`)
    res.status(500).json('An internal error occured')
  }
})

export default router
