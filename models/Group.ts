import mongoose, { Document, Schema, Types } from 'mongoose'
import { IGame } from './Game'
import { IUserDocument } from './User'

export interface IGroupCompetition {
  competitionName: string
  competitionId: number
  season: number
}

export interface IGroup {
  name: string
  email: string
  website: string
  teamId: number
  competitions: IGroupCompetition[]
  games: Types.Array<IGame> | Types.Array<mongoose.Types.ObjectId>
  upcomingGame?: IGame
  users: Types.Array<IUserDocument> | Types.Array<mongoose.Types.ObjectId>
}

export type IGroupDocument = IGroup & Document

const GroupCompetitionSchema = new Schema({
  _version: { type: Number, required: true, default: 1 },
  competitionName: { type: String, required: true },
  competitionId: { type: Number, required: true },
  season: { type: Number, required: true, validate: { validator: /^20\d{2}/ } },
})

const GroupSchema = new Schema(
  {
    _version: { type: Number, required: true, default: 1 },
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    website: { type: String, required: false },
    teamId: { type: Number, required: true },
    competitions: [{ type: GroupCompetitionSchema, required: true, default: [] }],
    games: [{ type: Schema.Types.ObjectId, ref: 'game', required: true, default: [] }],
    upcomingGame: { type: Schema.Types.ObjectId, ref: 'game' },
    users: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IGroupDocument>('group', GroupSchema)
