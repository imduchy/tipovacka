import bodyParser from 'body-parser'
import connectMongo from 'connect-mongo'
import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose'
import passport from 'passport'
import strategy from '../../services/passport'
import logger from '../../utils/logger'
import admin from './admin'
import auth from './auth'
import bets from './bets'
import games from './games'
import groups from './groups'
import users from './users'

export const app = express()
const MongoStore = connectMongo(session)

const { DB_CONNECTION_STRING } = process.env

try {
  if (!DB_CONNECTION_STRING) {
    throw new Error('Database connection string is undefined')
  }
  mongoose
    .connect(DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then((_) => {
      logger.info('Successfully connected to the database.')
    })
} catch (error) {
  logger.error('Error while connecting to the database. Error: ' + error)
  throw error
}

strategy(passport)

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    cookie: {
      maxAge: 172800000, // 2 days,
    },
    resave: true,
    saveUninitialized: true,
    store:
      process.env.NODE_ENV === 'production'
        ? new MongoStore({ mongooseConnection: mongoose.connection })
        : new session.MemoryStore(),
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', auth)
app.use('/admin', admin)
app.use('/users', users)
app.use('/groups', groups)
app.use('/games', games)
app.use('/bets', bets)

export default {
  path: '/api/',
  handler: app,
}
