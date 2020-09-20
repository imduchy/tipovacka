import mongoose, { Schema } from 'mongoose'
import { IGame } from './Game'

export interface IBet {
  homeTeamScore: number
  awayTeamScore: number
  game: IGame | mongoose.Types.ObjectId
}

// export type IBetDocument = IBet & Document

export const BetSchema = new Schema({
  _version: { type: Number, required: true, default: 1 },
  homeTeamScore: { type: Number, required: true, default: 1 },
  awayTeamScore: { type: Number, required: true, default: 1 },
  game: { type: Schema.Types.ObjectId, ref: 'game' },
})
