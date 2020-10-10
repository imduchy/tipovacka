import express from 'express'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import User from '../../models/User'
import logger from '../../utils/logger'
import { PropertyRequiredError, ValidationError } from '../../utils/exceptions'
import { validateInput } from '../../services/auth'

const router = express.Router()

router.get('/users', (req: any, res) => {
  res.status(200).send(req.user)
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(401).send(info)
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err)
      }
      console.log('INFO', info)
      return res.status(200).send(user)
    })
  })(req, res, next)
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
