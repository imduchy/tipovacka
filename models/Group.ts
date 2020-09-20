import mongoose, { Document, Schema, Types } from 'mongoose'
import { IUserDocument } from './User'

export interface IGroup {
  name: String
  email: String
  website: String
  teamId: number
  competitionsIds: number[]
  users: Types.Array<IUserDocument> | Types.Array<mongoose.Types.ObjectId>
}

export type IGroupDocument = IGroup & Document

const GroupSchema = new Schema({
  _version: { type: Number, required: true, default: 1 },
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  website: { type: String, required: false },
  teamId: { type: Number, required: true },
  competitionsIds: [{ type: Number, required: true }],
  users: [{ type: Schema.Types.ObjectId, ref: 'user' }],
})

export default mongoose.model<IGroupDocument>('group', GroupSchema)
