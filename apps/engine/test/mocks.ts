import {
  BetStatus,
  GameStatus,
  IBet,
  ICompetition,
  IFollowedTeam,
  IGame,
  IGameEvent,
  IGroup,
  ITeam,
  IUser,
  ISeason,
} from '@tipovacka/models';
import faker from 'faker';
import { Types } from 'mongoose';

export function mockGroup(followedTeams?: IFollowedTeam[]): IGroup {
  const groupName = faker.address.city();
  return {
    name: 'Hala ' + groupName,
    email: groupName + '@email.com',
    website: groupName + '.com',
    users: [],
    upcomingGame: new Types.ObjectId(),
    followedTeams: followedTeams ? followedTeams : [],
  };
}

export function mockSeason(year: number, competitions?: ICompetition[]): ISeason {
  return {
    season: year,
    competitions: competitions ? competitions : [],
  };
}

export function mockCompetition(): ICompetition {
  return {
    apiId: faker.random.number(500),
    name: faker.company.companyName() + ' Liga',
    logo: 'logo.png',
    players: [],
    standings: [],
    teamStatistics: {
      cleanSheet: { away: 0, home: 0, total: 0 },
      draws: { away: 0, home: 0, total: 0 },
      loses: { away: 0, home: 0, total: 0 },
      wins: { away: 0, home: 0, total: 0 },
      goals: {
        against: {
          average: { away: 0, home: 0, total: 0 },
          total: { away: 0, home: 0, total: 0 },
        },
        for: {
          average: { away: 0, home: 0, total: 0 },
          total: { away: 0, home: 0, total: 0 },
        },
      },
      played: { away: 0, home: 0, total: 0 },
      form: 'WDL',
      failedToScore: { away: 0, home: 0, total: 0 },
    },
  };
}

export function mockFollowedTeam(seasons?: ISeason[]): IFollowedTeam {
  return {
    apiId: faker.random.number(),
    name: 'FC ' + faker.address.city(),
    logo: 'logo.png',
    seasons: seasons ? seasons : [],
    rivals: [],
  };
}

export function mockGame(
  homeTeamScore: number,
  awayTeamScore: number,
  gameStatus: GameStatus,
  competition: ICompetition,
  season: number,
  events?: IGameEvent[],
  homeTeam?: ITeam,
  awayTeam?: ITeam
): IGame {
  homeTeam = homeTeam
    ? homeTeam
    : {
        name: generateTeamName(),
        logo: faker.image.imageUrl(50, 50, 'sport', true),
        teamId: faker.random.number({ min: 0, max: 2000 }),
      };

  awayTeam = awayTeam
    ? awayTeam
    : {
        name: generateTeamName(),
        logo: faker.image.imageUrl(50, 50, 'sport', true),
        teamId: faker.random.number({ min: 0, max: 2000 }),
      };

  return {
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    competitionId: competition.apiId,
    competitionName: competition.name,
    season: season,
    date: gameStatus === GameStatus.FT ? faker.date.past() : faker.date.future(),
    gameId: faker.random.number({ min: 1000, max: 50000 }),
    status: gameStatus,
    venue: faker.company.companyName() + ' Arena',
    awayTeamScore: awayTeamScore,
    homeTeamScore: homeTeamScore,
    events: events ? events : [],
  };
}

/**
 * Creates a mock user
 *
 * @param group _id of the group
 * @param competitions list of competitions and seasons, where each item in the
 * tuple follows the format [competitionId, seasons]
 * @returns mocked user object
 */
export function mockUser(group?: Types.ObjectId, competitions?: [number, number][]): IUser {
  const username = faker.internet.userName();

  return {
    username: username,
    email: username + '@email.com',
    password: 'password',
    groupId: group ? group : new Types.ObjectId(),
    bets: [],
    scope: ['user'],
    competitionScore: competitions
      ? competitions.map((comp) => ({
          competitionApiId: comp[0],
          score: 0,
          season: comp[1],
        }))
      : [],
  };
}

export function mockBet(
  user: Types.ObjectId,
  game: Types.ObjectId,
  betStatus: BetStatus,
  homeTeamScore?: number,
  awayTeamScore?: number,
  scorer?: number
): IBet {
  return {
    game: game ? game : new Types.ObjectId(),
    user: user ? user : new Types.ObjectId(),
    status: betStatus ? betStatus : BetStatus.PENDING,
    points: 0,
    homeTeamScore:
      homeTeamScore !== undefined ? homeTeamScore : faker.random.number({ min: 0, max: 10 }),
    awayTeamScore:
      awayTeamScore != undefined ? awayTeamScore : faker.random.number({ min: 0, max: 10 }),
    scorer: scorer ? scorer : 99999,
  };
}

function generateTeamName(): string {
  const clubNamePrefixes = ['AC', 'Real', 'FC', 'Atletico', 'Inter', 'Bayern'];
  const clubNameSuffixes = ['City', 'United', 'Town', 'Country', 'Athletic'];
  const decorators = [clubNamePrefixes, clubNameSuffixes];
  const index = faker.random.number({ min: 0, max: 1 });
  const decorator = faker.random.arrayElement(decorators[index]);
  const city = faker.address.city();
  return index === 0 ? decorator + ' ' + city : city + ' ' + decorator;
}
