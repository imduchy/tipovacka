import bodyParser from 'body-parser'
import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'
import session from 'express-session'
import strategy from '../../services/passport'
import bets from './bets'
import games from './games'
import groups from './groups'
import users from './users'
import auth from './auth'

export const app = express()

const { DB_NAME, DB_USER, DB_PASSWORD, DB_URL } = process.env

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
)

strategy(passport)

app.use(
  session({
    secret: 'QWgdjkqwrDSGasdwe',
    cookie: {
      maxAge: 432000, // 5 days,
    },
    resave: true,
    saveUninitialized: true,
  })
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', auth)
app.use('/users', users)
app.use('/groups', groups)
app.use('/games', games)
app.use('/bets', bets)

app.get('/', (_, res) => {
  res.send('Hello world')
})

export default {
  path: '/api/',
  handler: app,
}
