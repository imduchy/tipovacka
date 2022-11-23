/**
 * API Documentation:
 * https://www.api-football.com/documentation-beta#operation/get-standings
 */

import { Schema } from 'mongoose';
import { IPlayer, PlayerSchema } from './Player';

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
  _version?: number;
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

const CompetitionStandingRecordSchema = new Schema<ICompetitionStandingRecord>({
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

const HomeAwayTotalSchema = new Schema<IHomeAwayTotal>({
  home: { type: Number, required: true, default: 0 },
  away: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
});

export interface ITotalAverageGoals {
  total: IHomeAwayTotal;
  average: IHomeAwayTotal;
}

const TotalAverageGoalsSchema = new Schema<ITotalAverageGoals>({
  total: { type: new Schema(HomeAwayTotalSchema) },
  average: { type: new Schema(HomeAwayTotalSchema) },
});

export interface ITeamStatisticsGoals {
  for: ITotalAverageGoals;
  against: ITotalAverageGoals;
}

const TeamStatisticsGoalsSchema = new Schema<ITeamStatisticsGoals>({
  for: {
    type: new Schema(TotalAverageGoalsSchema),
    required: true,
  },
  against: {
    type: new Schema(TotalAverageGoalsSchema),
    required: true,
  },
});

export interface ITeamStatistics {
  _version?: number;
  form: string;
  played: IHomeAwayTotal;
  wins: IHomeAwayTotal;
  draws: IHomeAwayTotal;
  loses: IHomeAwayTotal;
  goals: ITeamStatisticsGoals;
  cleanSheet: IHomeAwayTotal;
  failedToScore: IHomeAwayTotal;
}

const TeamStatisticsSchema = new Schema<ITeamStatistics>({
  _version: { type: Number, required: true, default: 2 },
  form: { type: String, required: true },
  played: { type: new Schema(HomeAwayTotalSchema), required: true },
  wins: { type: new Schema(HomeAwayTotalSchema), required: true },
  draws: { type: new Schema(HomeAwayTotalSchema), required: true },
  loses: { type: new Schema(HomeAwayTotalSchema), required: true },
  goals: { type: new Schema(TeamStatisticsGoalsSchema), required: true },
  cleanSheet: { type: new Schema(HomeAwayTotalSchema), required: true },
  failedToScore: { type: new Schema(HomeAwayTotalSchema), required: true },
});

export interface ICompetition {
  _version?: number;
  apiId: number;
  name: string;
  logo: string;
  standings: Array<ICompetitionStandingRecord>;
  teamStatistics: ITeamStatistics;
  players: Array<IPlayer>;
}

const CompetitionSchema = new Schema<ICompetition>({
  _version: { type: Number, required: true, default: 2 },
  apiId: { type: Number, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  standings: [{ type: new Schema(CompetitionStandingRecordSchema), required: true }],
  teamStatistics: { type: new Schema(TeamStatisticsSchema), required: false },
  players: [{ type: new Schema(PlayerSchema), required: true, default: [] }],
});

export interface ISeason {
  _version?: number;
  season: number;
  competitions: Array<ICompetition>;
}

const SeasonSchema = new Schema<ISeason>({
  _version: { type: Number, required: true, default: 2 },
  season: { type: Number, required: true },
  competitions: [{ type: new Schema(CompetitionSchema), required: true }],
});

export interface IFollowedTeam {
  _version?: number;
  apiId: number;
  name: string;
  logo: string;
  seasons: Array<ISeason>;
  rivals: Array<number>;
}

export const FollowedTeamSchema = new Schema<IFollowedTeam>({
  _version: { type: Number, required: true, default: 2 },
  apiId: { type: Number, required: true },
  name: { type: String, required: true },
  logo: { type: String, required: true },
  seasons: [{ type: new Schema(SeasonSchema), required: true }],
  rivals: [{ type: Number, required: true, default: [] }],
});
