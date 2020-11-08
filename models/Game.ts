import mongoose, { Schema, Document, Types } from 'mongoose'
import logger from '../utils/logger'
import { GameStatus } from './Enums'
import Group from './Group'

export interface ITeam {
  teamId: number
  name: string
  logo: string
}

export interface IGame {
  gameId: number
  groupId: string
  date: Date
  homeTeam: ITeam
  awayTeam: ITeam
  homeTeamScore?: number
  awayTeamScore?: number
  status: GameStatus
  competition: number
  season: number
  venue: string
}

export type IGameDocument = IGame & Document

const TeamSchema = new Schema({
  _version: { type: Number, default: 1, required: true },
  teamId: { type: Number, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
})

const GameSchema = new Schema({
  _version: { type: Number, default: 1, required: true },
  gameId: { type: Number, required: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'group', required: true },
  date: { type: Date, required: true },
  homeTeam: {
    type: TeamSchema,
    required: true,
  },
  awayTeam: {
    type: TeamSchema,
    required: true,
  },
  homeTeamScore: { type: Number, required: true, default: 0 },
  awayTeamScore: { type: Number, required: true, default: 0 },
  status: { type: GameStatus, required: true },
  competition: { type: Number, required: true },
  season: { type: Number, required: true },
  venue: { type: String, required: true },
})

/**
 * After a game is saved, push the game _id
 * to the group's games array.
 */
GameSchema.post<IGameDocument>('save', function (doc) {
  Group.findOneAndUpdate(
    { _id: doc.groupId },
    { $push: { games: doc._id } },
    function (err, group) {
      if (err) {
        logger.error(
          `<Game.post> Error while pushing a game id ${doc._id} to the group ${doc.groupId}.`
        )
      } else if (group) {
        logger.info(
          `<Game.post> Pushed game's id ${doc._id} to the group ${group._id}.`
        )
      } else {
        logger.error(
          `<Game.post> Pushing game's id ${doc._id} to the group ${doc.groupId} was skipped.`
        )
      }
    }
  )
})

GameSchema.path('groupId').validate(function (value: Types.ObjectId) {
  return Group.findById(value, (err, res) => {
    if (err) {
      logger.error(
        `<Game.validate> Fetching provided group ${value} has failed with error. ${err}.`
      )
      return false
    } else if (!res) {
      logger.error(`<Game.validate> Group with _id ${value} was not found.`)
      return false
    } else {
      return true
    }
  })
}, 'A group with id `{VALUE}` was not found')

export default mongoose.model<IGameDocument>('game', GameSchema)
