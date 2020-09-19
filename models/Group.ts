import mongoose, { Document, Schema, Types } from 'mongoose'
import User, { IUserDocument } from './User'

export interface IGroup {
  version?: number
  name: String
  email: String
  website: String
  teamId: number
  competitionsIds: number[]
  users: Types.Array<IUserDocument>
}

export type IGroupDocument = IGroup & Document

const GroupSchema = new Schema({
  version: { type: Number, required: true, default: 1 },
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  website: { type: String, required: false },
  teamId: { type: Number, required: true },
  competitionsIds: [{ type: Number, required: true }],
  users: [{ type: User.schema }],
})

export default mongoose.model<IGroupDocument>('group', GroupSchema)
