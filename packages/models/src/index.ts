import { Model, Mongoose } from 'mongoose';
import { GameSchema, IGame } from './models/Game';
import { GroupSchema, IGroup } from './models/Group';
import { IUser, UserSchema } from './models/User';

export { BetStatus, IBet } from './models/Bet';
export { FixtureEventDetail, FixtureEventType, GameStatus } from './models/Enums';
export { IGame, IGameEvent, ITeam } from './models/Game';
export { IGroup } from './models/Group';
export {
  IPlayer,
  IPlayerGameStatistics,
  IPlayerGoalStatistics,
  IPlayerStatistics,
} from './models/Player';
export { FixtureEventsResponse } from './models/responses/FixtureEventsResponse';
export { FixtureResponse } from './models/responses/FixtureResponse';
export { PlayersResponse } from './models/responses/PlayersResponse';
export { StandingsResponse } from './models/responses/StandingsResponse';
export { TeamResponse } from './models/responses/TeamResponse';
export { TeamStatisticsResponse } from './models/responses/TeamStatisticsResponse';
export {
  ICompetition,
  ICompetitionStandingRecord,
  IFollowedTeam,
  ITeamStatistics,
  ITeamStatisticsGoals,
  ITotalAverageGoals,
  ISeason,
} from './models/Team';
export { ICompetitionScore, IUser } from './models/User';

export let Group: Model<IGroup>;
export let User: Model<IUser>;
export let Game: Model<IGame>;

export function exportModels(mongoose: Mongoose): void {
  Group = mongoose.model<IGroup>('group', GroupSchema);
  User = mongoose.model<IUser>('user', UserSchema);
  Game = mongoose.model<IGame>('game', GameSchema);
}
