import mongoose, { Schema, Document } from 'mongoose'
import { GameStatus } from './Enums'

export interface ITeam {
  teamId: number
  name: String
  logo: String
}

export interface IGame {
  gameId: number
  date: Date
  homeTeam: ITeam
  awayTeam: ITeam
  homeTeamScore?: number
  awayTeamScore?: number
  status: GameStatus
  competition: number
  season: number
  venue: String
}

export type IGameDocument = IGame & Document

const TeamSchema = new Schema({
  _version: { type: Number, default: 1, required: true },
  teamId: { type: Number, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
})

const GameSchema = new Schema({
  _version: { type: Number, default: 1, required: true },
  gameId: { type: Number, required: true },
  date: { type: Date, required: true },
  homeTeam: {
    type: TeamSchema,
    required: true,
  },
  awayTeam: {
    type: TeamSchema,
    required: true,
  },
  homeTeamScore: { type: Number, required: true, default: 0 },
  awayTeamScore: { type: Number, required: true, default: 0 },
  status: { type: GameStatus, required: true },
  competition: { type: Number, required: true },
  season: { type: Number, required: true },
  venue: { type: String, required: true },
})

export default mongoose.model<IGameDocument>('game', GameSchema)
