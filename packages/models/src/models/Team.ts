/**
 * API Documentation:
 * https://www.api-football.com/documentation-beta#operation/get-standings
 */

import { Schema, Types } from 'mongoose';
import { IPlayer, IPlayerDocument, PlayerSchema } from './Player';

// mongoose doesn't accept empty string ('') as a value and raises
// an error. This modifies the check to accept empty strings if a
// value is required.
// Details: https://github.com/Automattic/mongoose/issues/7150#issuecomment-451227354
Schema.Types.String.checkRequired((v) => v != null);

/**
 * Model for representing teams and their statistics in a
 * competition table. A record is a team in a competition table.
 */
export interface ICompetitionStandingRecord {
  rank: number;
  description: string;
  teamApiId: number;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string;
}

export interface ICompetitionStandingRecordDocument
  extends ICompetitionStandingRecord,
    Types.Subdocument {
  _version: number;
}

const CompetitionStandingRecordSchema = new Schema<ICompetitionStandingRecordDocument>({
  _version: { type: Number, required: true, default: 2 },
  rank: { type: Number, required: true },
  description: { type: String, required: true, default: '' },
  teamApiId: { type: Number, required: true },
  teamName: { type: String, required: true },
  teamLogo: { type: String, required: true },
  points: { type: Number, required: true },
  played: { type: Number, required: true },
  won: { type: Number, required: true },
  draw: { type: Number, required: true },
  lost: { type: Number, required: true },
  goalsFor: { type: Number, required: true },
  goalsAgainst: { type: Number, required: true },
  form: { type: String, required: true, default: '' },
});

export interface IHomeAwayTotal {
  home: number;
  away: number;
  total: number;
}

export type IHomeAwayTotalDocument = IHomeAwayTotal & Types.Subdocument;

const HomeAwayTotalSchema = new Schema<IHomeAwayTotalDocument>({
  home: { type: Number, required: true, default: 0 },
  away: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
});

export interface ITotalAverageGoals {
  total: IHomeAwayTotal;
  average: IHomeAwayTotal;
}

export type ITotalAverageGoalsDocument = ITotalAverageGoals & Types.Subdocument;

const TotalAverageGoalsSchema = new Schema<ITotalAverageGoalsDocument>({
  total: { type: HomeAwayTotalSchema },
  average: { type: HomeAwayTotalSchema },
});

export interface ITeamStatisticsGoals {
  for: ITotalAverageGoals;
  against: ITotalAverageGoals;
}

export type ITeamStatisticsGoalsDocument = ITeamStatisticsGoals & Types.Subdocument;

const TeamStatisticsGoalsSchema = new Schema<ITeamStatisticsGoalsDocument>({
  for: {
    type: TotalAverageGoalsSchema,
    required: true,
  },
  against: {
    type: TotalAverageGoalsSchema,
    required: true,
  },
});

export interface ITeamStatistics {
  form: string;
  played: IHomeAwayTotal;
  wins: IHomeAwayTotal;
  draws: IHomeAwayTotal;
  loses: IHomeAwayTotal;
  goals: ITeamStatisticsGoals;
  cleanSheet: IHomeAwayTotal;
  failedToScore: IHomeAwayTotal;
}

export interface ITeamStatisticsDocument extends ITeamStatistics, Types.Subdocument {
  _version: number;
}

const TeamStatisticsSchema = new Schema<ITeamStatisticsDocument>({
  _version: { type: Number, required: true, default: 2 },
  form: { type: String, required: true },
  played: { type: HomeAwayTotalSchema, required: true },
  wins: { type: HomeAwayTotalSchema, required: true },
  draws: { type: HomeAwayTotalSchema, required: true },
  loses: { type: HomeAwayTotalSchema, required: true },
  goals: { type: TeamStatisticsGoalsSchema, required: true },
  cleanSheet: { type: HomeAwayTotalSchema, required: true },
  failedToScore: { type: HomeAwayTotalSchema, required: true },
});

export interface ICompetition {
  apiId: number;
  name: string;
  logo: string;
  standings: Array<ICompetitionStandingRecord>;
  teamStatistics: ITeamStatistics;
  players: Array<IPlayer>;
}

export interface ICompetitionDocument extends ICompetition, Types.Subdocument {
  _version: number;
  standings: Types.Array<ICompetitionStandingRecordDocument>;
  players: Types.Array<IPlayerDocument>;
}

const CompetitionSchema = new Schema<ICompetitionDocument>({
  _version: { type: Number, required: true, default: 2 },
  apiId: { type: Number, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  standings: [{ type: CompetitionStandingRecordSchema, required: true }],
  teamStatistics: { type: TeamStatisticsSchema, required: false },
  players: [{ type: PlayerSchema, required: true, default: [] }],
});

export interface ISeason {
  season: number;
  competitions: Array<ICompetition>;
}

export interface ISeasonDocument extends ISeason, Types.Subdocument {
  _version: number;
  competitions: Types.Array<ICompetitionDocument>;
}

const SeasonSchema = new Schema<ISeasonDocument>({
  _version: { type: Number, required: true, default: 2 },
  season: { type: Number, required: true },
  competitions: [{ type: CompetitionSchema, required: true }],
});

export interface IFollowedTeam {
  apiId: number;
  name: string;
  logo: string;
  seasons: Array<ISeason>;
}

export interface IFollowedTeamDocument extends IFollowedTeam, Types.Subdocument {
  _version: number;
  seasons: Types.Array<ISeasonDocument>;
}

export const FollowedTeamSchema = new Schema<IFollowedTeamDocument>({
  _version: { type: Number, required: true, default: 2 },
  apiId: { type: Number, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  seasons: [{ type: SeasonSchema, required: true }],
});
