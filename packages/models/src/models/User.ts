import { Document, Model, Schema, Types, model } from 'mongoose';
import { BetSchema, IBet, IBetDocument } from './Bet';
import { IGroupDocument, IGroupModel } from './Group';

export interface ICompetitionScore {
  competitionApiId: number;
  season: number;
  score: number;
}

export interface ICompetitionScoreDocument extends ICompetitionScore, Types.Subdocument {
  _version: number;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  // TODO: Create an input interface where bets and competitionScore
  // won't be needed
  competitionScore?: Array<ICompetitionScore>;
  // TODO: Does it make sense to put bets and competitionScore into
  // a season object, in order to separate reduce number of objects
  // that needs to be fetched
  bets: Array<IBet>;
  groupId: Types.ObjectId;
  scope: Array<string>;
}

export interface IUserDocument extends IUser, Document<Types.ObjectId> {
  _version: number;
  groupId: Types.ObjectId;
  competitionScore: Types.Array<ICompetitionScoreDocument>;
  bets: Types.Array<IBetDocument>;
}

export type IUserModel = Model<IUserDocument>;

const CompetitionScoreSchema = new Schema<ICompetitionScoreDocument>(
  {
    _version: { type: Number, default: 1, required: true },
    competitionApiId: { type: Number, required: true },
    season: { type: Number, required: true },
    score: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const UserSchema = new Schema<IUserDocument, IUserModel>(
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
UserSchema.pre<IUserDocument>('save', function (next) {
  if (!this.isNew) next();
  else {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // A dirty workaround to pass isNew property to the post script
    // https://stackoverflow.com/a/18305924/8475178
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).wasNew = this.isNew;

    const Group = model<IGroupDocument, IGroupModel>('group');
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
 * After a user is deleted, also delete its id from the group
 * he's a part of.
 */
UserSchema.post<IUserDocument>(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // because findOneAndDelete seems to be missing as an option and gives an error
  'findOneAndDelete',
  function (doc: IUserDocument) {
    const Group = model<IGroupDocument, IGroupModel>('group');
    Group.findByIdAndUpdate(doc.groupId, { $pull: { users: doc._id } }, { new: true }, (err) => {
      if (err) {
        console.error(
          `<User.post middleware> An error occured while removing the user ` +
            `${doc._id} from the group ${doc.groupId}.`
        );
      } else {
        console.info(
          `<User.post middleware> Successfully removed the user ${doc._id} from ` +
            `the group ${doc.groupId}.`
        );
      }
    });
  }
);

/**
 * After a user is saved, push the user's _id
 * to its group's users array.
 */
UserSchema.post<IUserDocument>('save', function (doc, next) {
  // A dirty workaround to pass isNew property to the post script
  // https://stackoverflow.com/a/18305924/8475178
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(doc as any).wasNew) next();
  else {
    const Group = model<IGroupDocument, IGroupModel>('group');
    Group.findOneAndUpdate(
      { _id: doc.groupId },
      { $push: { users: doc._id } },
      {},
      (err, group) => {
        if (err) {
          console.error(
            `<User.post middleware> An error occured while pushing the user id ` +
              `${doc._id} to the group ${doc.groupId}.`
          );
        } else if (group) {
          console.info(
            `<User.post middleware> Successfully pushed the user id ${doc._id} to ` +
              `the group ${group._id}.`
          );
        }
        // Not checking if the group is null, as we perform a validation on the groupId
        // field before saving the document.
        next();
      }
    );
  }
});

UserSchema.path('groupId').validate(function (value: Types.ObjectId) {
  const Group = model<IGroupDocument, IGroupModel>('group');
  return new Promise(function (resolve, _reject) {
    Group.findById(value, (_: unknown, group: IGroupDocument) => resolve(!!group));
  });
}, 'A group with id `{VALUE}` was not found');
