import { Document, model, Schema, Types } from 'mongoose';
import { IGroup } from './Group';
import { BetSchema, IBet } from './Bet';
import { UserSchemaPostHookError, UserSchemaPreHookError } from './exceptions';

export interface ICompetitionScore {
  _version?: number;
  competitionApiId: number;
  season: number;
  score: number;
}

export interface IUser {
  _version?: number;
  username: string;
  email: string;
  password?: string;
  // TODO: Create an input interface where bets and competitionScore
  // won't be needed
  competitionScore: Array<ICompetitionScore>;
  // TODO: Does it make sense to put bets and competitionScore into
  // a season object, in order to separate reduce number of objects
  // that needs to be fetched
  bets: Array<IBet>;
  groupId: Types.ObjectId;
  scope: Array<string>;
}

export type IUserWithID = IUser & { _id: Types.ObjectId };

const CompetitionScoreSchema = new Schema<ICompetitionScore>(
  {
    _version: { type: Number, default: 1, required: true },
    competitionApiId: { type: Number, required: true },
    season: { type: Number, required: true },
    score: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const UserSchema = new Schema<IUser>(
  {
    _version: { type: Number, required: true, default: 1 },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    competitionScore: [
      {
        type: new Schema(CompetitionScoreSchema),
        required: true,
        default: [],
      },
    ],
    bets: [{ type: new Schema(BetSchema), default: [], required: true }],
    groupId: { type: Schema.Types.ObjectId, ref: 'group' },
    scope: [{ type: String, required: false, default: 'user' }],
  },
  { timestamps: true }
);

/**
 * Before a new user is saved, create an empty competitionScore objects
 * for each of the group's competitions in the latest season.
 */
UserSchema.pre<IUser & Document>('save', async function (next) {
  if (!this.isNew) next();
  else {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this as IUser & Document & { wasNew: boolean };

    // A dirty workaround to pass isNew property to the post script
    // https://stackoverflow.com/a/18305924/8475178
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    self.wasNew = this.isNew;

    const GroupModel = model<IGroup>('group');

    try {
      const group = await GroupModel.findById(this.groupId);

      if (!group) {
        return next(
          new UserSchemaPreHookError(
            "A pre save hook of the UserSchema wasn't executed successfully " +
              `for the document with _id ${this._id}. The group with _id ` +
              `${this.groupId} doesn't exist.`
          )
        );
      }

      for (const team of group.followedTeams) {
        const seasons = [...team.seasons];
        const latestSeason = seasons.sort((a, b) => b.season - a.season)[0];

        for (const comp of latestSeason.competitions) {
          self.competitionScore.push({
            competitionApiId: comp.apiId,
            score: 0,
            season: latestSeason.season,
          });
        }
      }
    } catch (error) {
      next(
        new UserSchemaPreHookError(
          'An exception occurred while executing a pre save hook of the UserSchema ' +
            `for the document with _id ${this._id}. The error is: ${error}.`
        )
      );
    }
  }
});

/**
 * After a user is saved, push the user's _id to its group's users array.
 */
UserSchema.post('save', async function (doc: IUser & Document & { wasNew: boolean }, next) {
  // A dirty workaround to pass isNew property to the post script
  // https://stackoverflow.com/a/18305924/8475178
  if (!doc.wasNew) next();
  else {
    const GroupModel = model<IGroup>('group');

    try {
      await GroupModel.findOneAndUpdate({ _id: doc.groupId }, { $push: { users: doc._id } });
      // Not checking if the group is null, as we perform a validation on the groupId
      // field before saving the document.
      next();
    } catch (error) {
      next(
        new UserSchemaPostHookError(
          'An exception occurred while executing a post save hook of the UserSchema ' +
            `for the document with _id ${this._id}. The error is: ${error}.`
        )
      );
    }
  }
});

/**
 * After a user is deleted, delete the user from a group.
 */
UserSchema.post(
  'deleteOne',
  { document: true, query: false },
  async function (doc: IUser & Document, next) {
    const GroupModel = model<IGroup>('group');

    try {
      await GroupModel.findOneAndUpdate({ _id: doc.groupId }, { $pop: { users: doc._id } });
      next();
    } catch (error) {
      next(
        new UserSchemaPostHookError(
          'An exception occurred while executing a post deleteOne hook of the UserSchema ' +
            `for the document with _id ${doc._id}. The error is: ${error}.`
        )
      );
    }
  }
);

UserSchema.path('groupId').validate(function (value: Types.ObjectId) {
  const GroupModel = model<IGroup>('group');

  return new Promise(function (resolve) {
    GroupModel.findById(value, (_: unknown, group: IGroup) => resolve(!!group));
  });
}, 'A group with _id `{VALUE}` was not found');
