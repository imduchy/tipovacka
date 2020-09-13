import mongoose, { Schema, Document } from 'mongoose'
import { GameStatus, Season } from './Enums'

interface ITeam {
  id: number
  name: String
  logo: String
}

export interface IGame extends Document {
  version?: number
  date: Date
  homeTeam: ITeam
  awayTeam: ITeam
  homeTeamScore: number
  awayTeamScore: number
  status: GameStatus
  competition: String
  season: Season
  venue: String
}

const GameSchema = new Schema({
  version: { type: Number, default: 1, required: true },
  date: { type: Date, required: true },
  homeTeam: {
    type: {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      logo: { type: String, required: true },
    },
    required: true,
  },
  awayTeam: {
    type: {
      id: { type: Number, required: true },
      name: { type: String, required: true },
      logo: { type: String, required: true },
    },
    required: true,
  },
  homeTeamScore: { type: Number, required: true },
  awayTeamScore: { type: Number, required: true },
  status: { type: GameStatus, required: true },
  competition: { type: String, required: true },
  season: { type: Season, required: true },
  venue: { type: String, required: true },
})

export default mongoose.model<IGame>('game', GameSchema)
