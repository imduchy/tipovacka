import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import mockResponse from '../../mocks/lastFixture.json'

const app = express()

dotenv.config()
const { DB_NAME, DB_USER, DB_PASSWORD, DB_URL } = process.env

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
)

app.get('/', (_, res) => {
  res.send(mockResponse.response[0])
})

export default {
  path: '/api/',
  handler: app,
}
