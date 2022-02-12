import { Document, model, Schema, Types } from 'mongoose';
import { IGroup } from '..';
import { BetSchema, IBet } from './Bet';

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
  password: string;
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
    password: { type: String, required: true },
    competitionScore: [
      {
        type: CompetitionScoreSchema,
        required: true,
        default: [],
      },
    ],
    bets: [{ type: BetSchema, default: [], required: true }],
    groupId: { type: Schema.Types.ObjectId, ref: 'group' },
    scope: [{ type: String, required: false, default: 'user' }],
  },
  { timestamps: true }
);

/**
 * Before a user is saved, create an empty competitionScore
 * objects for each of the group's competitions in the latest
 * season.
 */
UserSchema.pre<IUser & Document>('save', function (next) {
  if (!this.isNew) next();
  else {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // A dirty workaround to pass isNew property to the post script
    // https://stackoverflow.com/a/18305924/8475178
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).wasNew = this.isNew;

    const Group = model<IGroup>('group');
    Group.findById(this.groupId, {}, {}, (err, group) => {
      if (err) {
        console.error(
          `<User.pre middleware> An error occured while fetching a group ` +
            `with _id ${self.groupId} (groupId).`
        );
        next(err);
      } else if (group) {
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

        console.info(
          `<User.pre middleware> Successfully created competitionScore object(s) ` +
            `for the user ${self.email} (${self._id}).`
        );
        next();
      } else {
        console.error(
          `<User.pre middleware> A group with groupId ${self.groupId} doesn't ` +
            `exist. Creation of the competitionScore objects for the user ${self.email}` +
            `(${self._id}) was skipped.`
        );
        next();
      }
    });
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
    const Group = model<IGroup>('group');

    try {
      const group = await Group.findOneAndUpdate(
        { _id: doc.groupId },
        { $push: { users: doc._id } }
      );
      // Not checking if the group is null, as we perform a validation on the groupId
      // field before saving the document.
      console.info(
        `<User.post middleware> Successfully pushed the user id ${doc._id} to ` +
          `the group ${group?._id}.`
      );
      next();
    } catch {
      console.error(
        `<User.post middleware> An error occured while pushing the user id ` +
          `${doc._id} to the group ${doc.groupId}.`
      );
      next();
    }
  }
});

UserSchema.path('groupId').validate(function (value: Types.ObjectId) {
  const Group = model<IGroup>('group');
  return new Promise(function (resolve, _reject) {
    Group.findById(value, (_: unknown, group: IGroup) => resolve(!!group));
  });
}, 'A group with id `{VALUE}` was not found');
