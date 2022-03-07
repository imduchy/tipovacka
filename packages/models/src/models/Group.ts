import { Schema, Types } from 'mongoose';
import { IGame } from './Game';
import { FollowedTeamSchema, IFollowedTeam } from './Team';
import { IUser } from './User';

export interface IGroup {
  _version?: number;
  name: string;
  email: string;
  website: string;
  followedTeams: Array<IFollowedTeam>;
  upcomingGame: IGame | Types.ObjectId;
  users: Array<IUser> | Array<Types.ObjectId>;
}

export type IGroupWithID = IGroup & { _id: Types.ObjectId };

export const GroupSchema = new Schema<IGroup>(
  {
    _version: { type: Number, required: true, default: 2 },
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    website: { type: String, required: false },
    followedTeams: [
      {
        type: FollowedTeamSchema,
        required: true,
      },
    ],
    upcomingGame: { type: Schema.Types.ObjectId, ref: 'game', required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'user', required: true, default: [] }],
  },
  { timestamps: true }
);
