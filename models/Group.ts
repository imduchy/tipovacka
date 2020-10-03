import mongoose, { Document, Schema, Types } from 'mongoose'
import { IGame } from './Game'
import { IUserDocument } from './User'

export interface IGroupCompetition {
  competitionId: number
  season: number
}

export interface IGroup {
  name: String
  email: String
  website: String
  teamId: number
  competitions: IGroupCompetition[]
  upcommingGame: IGame
  users: Types.Array<IUserDocument> | Types.Array<mongoose.Types.ObjectId>
}

export type IGroupDocument = IGroup & Document

const GroupCompetitionSchema = new Schema({
  _version: { type: Number, required: true, default: 1 },
  competitionId: { type: Number, required: true },
  season: { type: Number, required: true, validate: { validator: /^20\d{2}/ } },
})

const GroupSchema = new Schema({
  _version: { type: Number, required: true, default: 1 },
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  website: { type: String, required: false },
  teamId: { type: Number, required: true },
  competitions: [{ type: GroupCompetitionSchema, required: true, default: [] }],
  upcommingGame: { type: Schema.Types.ObjectId, ref: 'game' },
  users: [{ type: Schema.Types.ObjectId, ref: 'user' }],
})

export default mongoose.model<IGroupDocument>('group', GroupSchema)
