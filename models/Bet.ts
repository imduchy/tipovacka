import mongoose, { Schema, Types } from 'mongoose'
import { IGame } from './Game'
import { IUser } from './User'

export enum BetStatus {
  EVALUATED = 'EVALUATED',
  PENDING = 'PENDING',
}

export interface IBet {
  homeTeamScore: number
  awayTeamScore: number
  game: IGame | mongoose.Types.ObjectId
  user: IUser | mongoose.Types.ObjectId
  status?: BetStatus
}

export type IBetDocument = IBet & Types.Subdocument

export const BetSchema = new Schema<IBetDocument>(
  {
    _version: { type: Number, required: true, default: 1 },
    homeTeamScore: { type: Number, required: true, default: 1 },
    awayTeamScore: { type: Number, required: true, default: 1 },
    game: { type: Schema.Types.ObjectId, ref: 'game' },
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, default: BetStatus.PENDING, enum: Object.values(BetStatus) },
  },
  {
    timestamps: true,
  }
)
