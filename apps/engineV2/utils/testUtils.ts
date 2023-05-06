import {
  BetStatus,
  FixtureEventDetail,
  FixtureEventType,
  GameStatus,
  IBetWithID,
  IGameEvent,
  IGameWithID,
  IGroupWithID,
  IUserWithID,
} from '@tipovacka/models';
import { IHomeAwayTotal } from '@tipovacka/models/dist/models/Team';
import { Types } from 'mongoose';

export function createMockGroup(groupId = new Types.ObjectId()): IGroupWithID {
  const homeAwayTotalObject = (): IHomeAwayTotal => ({ home: 0, away: 0, total: 0 });

  return {
    _id: groupId,
    name: 'Test group',
    email: 'testgroup@email.com',
    website: 'https://www.testgroup.com',
    upcomingGame: undefined,
    users: [],
    followedTeams: [
      {
        apiId: 1,
        name: 'Chelsea',
        logo: 'https://media.api-sports.io/football/teams/49.png',
        rivals: [2],
        seasons: [
          {
            season: 2020,
            competitions: [
              {
                apiId: 1,
                logo: 'https://media.api-sports.io/football/leagues/39.png',
                name: 'Premier League',
                players: [],
                standings: [],
                teamStatistics: {
                  goals: {
                    for: { total: homeAwayTotalObject(), average: homeAwayTotalObject() },
                    against: { total: homeAwayTotalObject(), average: homeAwayTotalObject() },
                  },
                  cleanSheet: homeAwayTotalObject(),
                  draws: homeAwayTotalObject(),
                  failedToScore: homeAwayTotalObject(),
                  form: '',
                  loses: homeAwayTotalObject(),
                  wins: homeAwayTotalObject(),
                  played: homeAwayTotalObject(),
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

export function createMockUser(group = new Types.ObjectId()): IUserWithID {
  return {
    _id: new Types.ObjectId(),
    groupId: group ? group : new Types.ObjectId(),
    email: 'mockuser@email.com',
    username: 'mockuser',
    password: 'monkey123',
    competitionScore: [
      {
        competitionApiId: 1,
        season: 2020,
        score: 0,
      },
    ],
    bets: [],
    scope: ['user'],
  };
}

export function createMockBet(
  user = new Types.ObjectId(),
  game = new Types.ObjectId()
): IBetWithID {
  return {
    _id: new Types.ObjectId(),
    game: game,
    user: user,
    homeTeamScore: 0,
    awayTeamScore: 0,
    points: 0,
    scorer: 1,
    status: BetStatus.PENDING,
  };
}

export function createMockGame(): IGameWithID {
  return {
    _id: new Types.ObjectId(),
    season: 2020,
    homeTeam: {
      teamId: 1,
      name: 'Real Madrid',
      logo: 'https://media.api-sports.io/football/teams/1.png',
    },
    awayTeam: {
      teamId: 2,
      name: 'Chelsea',
      logo: 'https://media.api-sports.io/football/teams/2.png',
    },
    homeTeamScore: 2,
    awayTeamScore: 1,
    competitionId: 1,
    competitionName: 'Premier League',
    gameId: 1,
    venue: 'Emirates Stadium',
    date: new Date(),
    status: GameStatus.FT,
    events: [],
  };
}

export function createMockGameEvent(
  type: FixtureEventType,
  detail: FixtureEventDetail
): IGameEvent {
  return {
    type: type,
    detail: detail,
    assistPlayerName: 'Modric',
    assistPlayerId: 2,
    playerName: 'Benzema',
    playerId: 1,
    time: 45,
    teamId: 1,
    teamName: 'Real Madrid',
  };
}

export function createMockFixtureEventResponse(type: FixtureEventType, detail: FixtureEventDetail) {
  return {
    time: { elapsed: 0 },
    team: { id: 1, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/1.png' },
    player: { id: 1, name: 'Benzema' },
    assist: { id: 2, name: 'Modric' },
    type: type,
    detail: detail,
    comments: '',
  };
}

export function createMockFixtureResponse(statusLong = 'Match Finished', statusShort = 'FT') {
  return {
    fixture: {
      id: 1,
      status: {
        long: statusLong,
        short: statusShort,
      },
      venue: {
        id: 1,
        name: 'Santiago Bernabéu',
        city: 'Madrid',
      },
      date: '2023-05-01T19:00:00+00:00',
    },
    goals: {
      home: 2,
      away: 1,
    },
  };
}
