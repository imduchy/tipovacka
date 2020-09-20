import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import bets from './bets'
import games from './games'
import groups from './groups'
import users from './users'

export const app = express()

dotenv.config()
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

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
