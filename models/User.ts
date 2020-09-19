import mongoose, { Schema, Document, Types } from 'mongoose'
import { IBet } from './Bet'

export interface IUser {
  _version?: number
  username: String
  email: String
  passwordHash: String
  totalScore: ITotalScore[]
  bets?: IBet[] | Types.ObjectId[]
}

export interface IUserDocument extends IUser, Document {}

interface ITotalScore {
  _version?: number
  competitionId: number
  season: number
  score: number
}

const TotalScoreSchema = new Schema({
  _version: { type: Number, default: 1, required: true },
  competitionId: { type: Number, required: true },
  season: { type: Number, required: true },
  score: { type: Number, required: true, default: 0 },
})

const UserSchema = new Schema({
  _version: { type: Number, required: true, default: 1 },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  totalScore: [
    {
      type: TotalScoreSchema,
      required: true,
    },
  ],
  bets: [{ type: Schema.Types.ObjectId, ref: 'bet', default: [] }],
})

export default mongoose.model<IUserDocument>('user', UserSchema)
