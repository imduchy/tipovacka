import { Schema, Types } from 'mongoose';

export interface IPlayerGoalStatistics {
  total: number | undefined;
  assists: number | undefined;
  conceded: number | undefined;
  saves: number | undefined;
}

export type IPlayerGoalStatisticsDocument = IPlayerGoalStatistics & Types.Subdocument;

const PlayerGoalStatistics = new Schema<IPlayerGoalStatisticsDocument>({
  total: { type: Number, required: true, default: 0 },
  assists: { type: Number, required: true, default: 0 },
  conceded: { type: Number, required: false, default: 0 },
  saves: { type: Number, required: false, default: 0 },
});

export interface IPlayerGameStatistics {
  appearences: number | undefined;
  lineups: number | undefined;
  minutes: number | undefined;
  number: number | undefined;
  position: string;
  rating: number | undefined;
  captain: boolean;
}

export type IPlayerGameStatisticsDocument = IPlayerGameStatistics & Types.Subdocument;

const PlayerGameStatistics = new Schema<IPlayerGameStatisticsDocument>({
  appearences: { type: Number, required: true, default: 0 },
  lineups: { type: Number, required: true, default: 0 },
  minutes: { type: Number, required: true, default: 0 },
  number: { type: Number, required: false },
  position: { type: String, required: true, default: 'N/A' },
  rating: { type: Number, required: true, default: 0 },
  captain: { type: Boolean, required: true, default: false },
});

export interface IPlayerStatistics {
  games: IPlayerGameStatistics;
  goals: IPlayerGoalStatistics;
}

export type IPlayerStatisticsDocument = IPlayerStatistics & Types.Subdocument;

const PlayerStatisticsSchema = new Schema<IPlayerStatisticsDocument>({
  games: { type: PlayerGameStatistics, required: true },
  goals: { type: PlayerGoalStatistics, required: true },
});

export interface IPlayer {
  apiId: number;
  name: string;
  firstName: string;
  lastName: string;
  statistics: IPlayerStatistics;
  photo: string;
  injured: boolean;
  age: number;
}

export interface IPlayerDocument extends IPlayer, Types.Subdocument {
  _version: number;
}

export const PlayerSchema = new Schema<IPlayerDocument>({
  _version: { type: Number, default: 1, required: true },
  apiId: { type: Number, required: true },
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  photo: { type: String, required: true },
  statistics: { type: PlayerStatisticsSchema, required: true },
  injured: { type: Boolean, required: true, default: false },
  age: { type: Number, required: true },
});
