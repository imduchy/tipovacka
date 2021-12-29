import { Document, Model, Schema, Types } from 'mongoose';
import { IGame, IGameDocument } from './Game';
import { FollowedTeamSchema, IFollowedTeam, IFollowedTeamDocument } from './Team';
import { IUser, IUserDocument } from './User';

export interface IGroup {
  name: string;
  email: string;
  website: string;
  followedTeams: Array<IFollowedTeam>;
  upcomingGame: IGame | Types.ObjectId;
  users: Array<IUser> | Array<Types.ObjectId>;
}

export interface IGroupDocument extends IGroup, Document<Types.ObjectId> {
  _version: number;
  followedTeams: Types.Array<IFollowedTeamDocument>;
  upcomingGame: Types.ObjectId | IGameDocument;
  users: Types.Array<IUserDocument> | Types.Array<Types.ObjectId>;
}

export type IGroupModel = Model<IGroupDocument>;

export const GroupSchema = new Schema<IGroupDocument, IGroupModel>(
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
