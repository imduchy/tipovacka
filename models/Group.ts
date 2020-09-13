import mongoose, { Schema, Document } from 'mongoose'
import User, { IUser } from './User'

interface IGroup extends Document {
  version?: number
  name: String
  email: String
  website: String
  teamId: number
  competitionsIds: number[]
  users: IUser[]
}

const GroupSchema = new Schema({
  version: { type: Number, required: true, default: 1 },
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  website: { type: String, required: false },
  teamId: { type: Number, required: true },
  competitionsIds: { type: [Number], required: true },
  users: { type: [User], required: true },
})

export default mongoose.model<IGroup>('group', GroupSchema)
