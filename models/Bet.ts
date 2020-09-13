import mongoose, { Schema, Document } from 'mongoose'
import { IGame } from './Game'
import { IUser } from './User'

export interface IBet extends Document {
  version?: number
  homeTeamScore: number
  awayTeamScore: number
  game: IGame | mongoose.Types.ObjectId
  user: IUser | mongoose.Types.ObjectId
}

const BetSchema = new Schema({
  version: { type: Number, required: true, default: 1 },
  homeTeamScore: { type: Number, required: true, default: 1 },
  awayTeamScore: { type: Number, required: true, default: 1 },
  game: { type: Schema.Types.ObjectId, ref: 'game' },
  user: { types: Schema.Types.ObjectId, ref: 'user' },
})

export default mongoose.model<IBet>('bet', BetSchema)
