import mongoose, { Schema, Document, Types } from 'mongoose'
import logger from '../utils/logger'
import { BetSchema, IBet } from './Bet'
import Group from './Group'

export interface IUser {
  _id?: Types.ObjectId
  username: string
  email: string
  password: string
  totalScore?: ITotalScore[]
  bets?: Types.Array<IBet>
  groupId: Types.ObjectId
}

export type IUserDocument = IUser & Document

interface ITotalScore {
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

const UserSchema = new Schema<IUser>(
  {
    _version: { type: Number, required: true, default: 1 },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalScore: [
      {
        type: TotalScoreSchema,
        required: true,
        default: [],
      },
    ],
    bets: [{ type: BetSchema, default: [] }],
    groupId: { type: Schema.Types.ObjectId, ref: 'group' },
  },
  {
    timestamps: true,
  }
)

/**
 * Before a user is saved, create an empty totalScore
 * objects for each of the group's competitions.
 */
UserSchema.pre<IUserDocument>('save', function (next) {
  if (!this.isNew) next()
  else {
    const self = this

    // A dirty workaround to pass isNew property to the post script
    // https://stackoverflow.com/a/18305924/8475178
    ;(this as any).wasNew = this.isNew

    Group.findById(this.groupId, function (err, res) {
      if (err) {
        logger.error(`<User.pre> Error while fetching a group by id ${self.groupId}.`)
        next(err)
      } else if (res) {
        for (const comp of res.competitions) {
          self.totalScore!.push({
            competitionId: comp.competitionId,
            season: comp.season,
            score: 0,
          })
        }
        logger.info(
          `<User.pre> Created totalScore objects for a user ${self.email} (${self._id}).`
        )
        next()
      } else {
        logger.error(
          `<User.pre> Creation of totalScore objects for a user ` +
            `${self.email} (${self._id}) was skipped.`
        )
        next()
      }
    })
  }
})

/**
 * After a user is saved, push the user _id
 * to its group's users array.
 */
UserSchema.post<IUserDocument>('save', function (doc, next) {
  if (!(doc as any).wasNew) next()
  else {
    Group.findOneAndUpdate({ _id: doc.groupId }, { $push: { users: doc._id } }, function (
      err,
      group
    ) {
      if (err) {
        logger.error(
          `<User.post> Error while pushing a user id ${doc._id} to the group ${doc.groupId}.`
        )
      } else if (group) {
        logger.info(`<User.post> Pushed user's id ${doc._id} to the group ${group._id}.`)
      } else {
        logger.error(
          `<User.post> Pushing user's id ${doc._id} to the group ${doc.groupId} was skipped.`
        )
      }
      next()
    })
  }
})

UserSchema.path('groupId').validate(function (value: Types.ObjectId) {
  return Group.findById(value, (err, res) => {
    if (err) {
      logger.error(
        `<User.validate> Fetching provided group ${value} has failed with error. ${err}.`
      )
      return false
    } else if (!res) {
      logger.error(`<User.validate> Group with _id ${value} was not found.`)
      return false
    } else {
      return true
    }
  })
}, 'A group with id `{VALUE}` was not found')

export default mongoose.model<IUserDocument>('user', UserSchema)
