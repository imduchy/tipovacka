import mongoose, { Schema, Document } from 'mongoose'
import { IBet } from './Bet'
import { Season } from './Enums'

export interface IUser extends Document {
  version?: number
  username: String
  email: String
  passwordHash: String
  totalScore: TotalScore[]
  bet: IBet | mongoose.Types.ObjectId
}

interface TotalScore {
  competitionId: number
  season: Season
  score: number
}

const UserSchema = new Schema({
  version: { type: Number, required: true, default: 1 },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  totalScore: {
    type: {
      competitionId: { type: Number, required: true },
      season: { type: Season, required: true },
      score: { type: Number, required: true },
    },
    required: true,
    unique: true,
  },
  bets: { type: [mongoose.Types.ObjectId], ref: 'bet' },
})

export default mongoose.model<IUser>('user', UserSchema)
