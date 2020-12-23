import express from 'express'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import User from '../../models/User'
import logger from '../../utils/logger'
import { PropertyRequiredError, ValidationError } from '../../utils/exceptions'
import { validateInput } from '../../services/auth'

const router = express.Router()

router.get('/users', (req, res) => {
  res.status(200).send(req.user)
})

router.get('/logout', (req, res) => {
  req.session?.destroy((err) => {
    logger.info(
      `Couldn't destory session ${req.sessionID} for ` + `user ${req.user}. Error: ${err}`
    )
  })
  req.logout()
  res.status(200).send()
})

router.post('/login', passport.authenticate('local'), function (req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.status(200).send(req.user)
})

router.post('/register', async (req, res) => {
  const { username, email, password, groupId } = req.body

  try {
    validateInput(req.body)

    const user = await User.findOne({ email })
    if (user) {
      res.status(400).send('User with this email already exists')
      return
    }

    const salt = await bcrypt.genSalt()
    const encryptedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      email,
      username,
      groupId,
      password: encryptedPassword,
    })
    logger.info(
      `A new user ${newUser.email} (${newUser._id}) has been created in group ${newUser.groupId}`
    )

    res.status(200).send(newUser)
  } catch (error) {
    if (error instanceof (ValidationError || PropertyRequiredError)) {
      // Logging handled in validateInput
      res.status(400).send(error.message)
    } else {
      logger.error(`Error while registering a user.`)
      logger.error(`Error: ${error}.`)
      res.status(500).send('Internal error')
    }
  }
})

export default router
