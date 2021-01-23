import express, { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import mongoose from 'mongoose'
import User, { IUser, IUserDocument } from '../../models/User'
import logger from '../../utils/logger'
import { PropertyRequiredError, ValidationError } from '../../utils/exceptions'
import { validateInput } from '../../services/auth'
import { isLoggedIn } from '../../utils/auth'

const router = express.Router()

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (isLoggedIn(req)) {
    next()
  } else {
    logger.warn(
      `[${req.originalUrl}] Unauthorized request was made by user ${
        req.user && req.user._id
      } from IP: ${req.ip}.`
    )
    res.status(401).send('Unauthorized request')
  }
}

router.get('/users', (req, res) => {
  res.status(200).send(req.user)
})

/**
 * Logout a user
 * Access: Logged-in user
 */
router.get('/logout', (req, res) => {
  req.session?.destroy(async (err) => {
    if (err) {
      logger.info(
        `Couldn't destory session ${req.sessionID} for a user ${req.user}. Error: ${err}`
      )
    }

    const Sessions = mongoose.connection.collection('sessions')
    await Sessions.findOneAndDelete({ _id: req.sessionID }).catch((err) => {
      logger.warn(
        `Couldn't delete sessions ${req.sessionID} from the database. Error: ${err}`
      )
    })
  })
  req.logout()
  res.status(200).send()
})

/**
 * Log-in
 * Access: Guest
 */
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

/**
 * Change password
 * Access: Logged-in user
 */
router.post('/password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword, confirmedPassword } = req.body

  if (!oldPassword || !newPassword || !confirmedPassword) {
    res.status(400).send('Not all values were provided.')
    return
  }

  if (newPassword !== confirmedPassword) {
    res.status(400).send("New passwords doesn't match.")
    return
  }

  try {
    const user = (await User.findOne({ _id: (req.user as any)._id })) as IUserDocument

    const passwordsMatch = await bcrypt.compare(oldPassword, user.password)
    if (!passwordsMatch) {
      res.status(400).send('Wrong password')
      return
    }

    const salt = await bcrypt.genSalt()
    const newEncryptedPassword = await bcrypt.hash(newPassword, salt)
    user.password = newEncryptedPassword
    await user.save()

    logger.info(`Password for a user ${user.email} (${user._id}) was changed.`)

    res.status(200).send()
  } catch (error) {
    res.status(500).send('Internal error')
  }
})

export default router
