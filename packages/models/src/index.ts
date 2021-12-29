import { Model, Mongoose } from 'mongoose';
import { IBetDocument } from './models/Bet';
import { GameSchema, IGameDocument, IGameModel } from './models/Game';
import { GroupSchema, IGroupDocument, IGroupModel } from './models/Group';
import { IUserDocument, IUserModel, UserSchema } from './models/User';

export { BetStatus, IBet, IBetDocument } from './models/Bet';
export { GameStatus, FixtureEventDetail, FixtureEventType } from './models/Enums';
export {
  IGame,
  IGameDocument,
  IGameEvent,
  ITeam,
  IGameEventDocument,
  ITeamDocument,
} from './models/Game';
export { IGroup, IGroupDocument } from './models/Group';
export {
  IPlayer,
  IPlayerGoalStatistics,
  IPlayerGameStatistics,
  IPlayerStatistics,
  IPlayerGoalStatisticsDocument,
  IPlayerGameStatisticsDocument,
  IPlayerStatisticsDocument,
} from './models/Player';
export { FixtureEventsResponse } from './models/responses/FixtureEventsResponse';
export { FixtureResponse } from './models/responses/FixtureResponse';
export { PlayersResponse } from './models/responses/PlayersResponse';
export { StandingsResponse } from './models/responses/StandingsResponse';
export { TeamResponse } from './models/responses/TeamResponse';
export { TeamStatisticsResponse } from './models/responses/TeamStatisticsResponse';
export {
  ICompetition,
  ICompetitionDocument,
  ICompetitionStandingRecord,
  ICompetitionStandingRecordDocument,
  IFollowedTeam,
  IFollowedTeamDocument,
  IHomeAwayTotalDocument,
  ISeasonDocument,
  ITeamStatistics,
  ITeamStatisticsDocument,
  ITeamStatisticsGoals,
  ITeamStatisticsGoalsDocument,
  ITotalAverageGoals,
  ITotalAverageGoalsDocument,
} from './models/Team';
export { ICompetitionScore, ICompetitionScoreDocument, IUser, IUserDocument } from './models/User';

export let Group: Model<IGroupDocument>;
export let User: Model<IUserDocument>;
export let Game: Model<IGameDocument>;
export let Bet: Model<IBetDocument>;

export function exportModels(mongoose: Mongoose): void {
  Group = mongoose.model<IGroupDocument, IGroupModel>('group', GroupSchema);
  User = mongoose.model<IUserDocument, IUserModel>('user', UserSchema);
  Game = mongoose.model<IGameDocument, IGameModel>('game', GameSchema);
}
