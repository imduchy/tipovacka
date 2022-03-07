import { Schema, Types } from 'mongoose';
import { IGame } from './Game';
import { IUser } from './User';

export enum BetStatus {
  EVALUATED = 'EVALUATED',
  PENDING = 'PENDING',
}

export interface IBet {
  _version?: number;
  homeTeamScore: number;
  awayTeamScore: number;
  scorer: number;
  game: IGame | Types.ObjectId;
  user: IUser | Types.ObjectId;
  status?: BetStatus;
}

export type IBetWithID = IBet & { _id: Types.ObjectId };

export const BetSchema = new Schema<IBet>(
  {
    _version: { type: Number, required: true, default: 1 },
    homeTeamScore: { type: Number, required: true, default: 1 },
    awayTeamScore: { type: Number, required: true, default: 1 },
    scorer: { type: Number, required: false },
    game: { type: Schema.Types.ObjectId, ref: 'game' },
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    status: {
      type: String,
      default: BetStatus.PENDING,
      enum: Object.values(BetStatus),
    },
  },
  { timestamps: true }
);
