import {
  BetStatus,
  Game,
  Group,
  IBet,
  IGame,
  User,
  FixtureEventDetail,
  FixtureEventType,
  GameStatus,
} from '@tipovacka/models';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongoose } from 'mongoose';
import queueTrigger from '../EvaluateBets';
import { assignPoints, evaluatePoints } from '../EvaluateBets/utils';
import { getDatabase } from '../src/database';
import { queueTriggerContext } from './defaultContext';
import {
  mockBet,
  mockCompetition,
  mockFollowedTeam,
  mockGame,
  mockGroup,
  mockSeason,
  mockUser,
} from './mocks';

// Global variables shared between test suites
let db: Mongoose;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Setup a local Mongo database before starting to execute tests
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  db = await getDatabase(mongoUri);
});

afterAll(async () => {
  // Stop and teardown the local database after all tests have completed
  if (db) {
    await db.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('evaluatePoints function', () => {
  it('should return 4 points if exact score and scorer were guessed', () => {
    const mockBet = {
      homeTeamScore: 3,
      awayTeamScore: 2,
      scorer: 123,
    } as IBet;
    const mockGame = {
      homeTeamScore: 3,
      awayTeamScore: 2,
      events: [
        {
          playerName: 'Benzema',
          playerId: 123,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
        {
          playerName: 'Bale',
          playerId: 235,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
      ],
    } as IGame;

    expect(evaluatePoints(mockBet, mockGame)).toBe(4);
  });

  it('should return 3 points if exact score was guessed', () => {
    const mockBet = {
      homeTeamScore: 1,
      awayTeamScore: 4,
      scorer: 123,
    } as IBet;
    const mockGame = {
      homeTeamScore: 1,
      awayTeamScore: 4,
      events: [
        {
          playerName: 'Rodrygo',
          playerId: 234,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
        {
          playerName: 'Bale',
          playerId: 235,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
      ],
    } as IGame;

    expect(evaluatePoints(mockBet, mockGame)).toBe(3);
  });

  it('should return 2 points if correct end result and scorer were guessed', () => {
    const mockBet = {
      homeTeamScore: 3,
      awayTeamScore: 2,
      scorer: 123,
    } as IBet;
    const mockGame = {
      homeTeamScore: 3,
      awayTeamScore: 1,
      events: [
        {
          playerName: 'Benzema',
          playerId: 123,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
        {
          playerName: 'Bale',
          playerId: 235,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
      ],
    } as IGame;

    expect(evaluatePoints(mockBet, mockGame)).toBe(2);
  });

  it('should return 1 point if correct end result was guessed', () => {
    const mockBet = {
      homeTeamScore: 1,
      awayTeamScore: 3,
      scorer: 123,
    } as IBet;
    const mockGame = {
      homeTeamScore: 1,
      awayTeamScore: 2,
      events: [
        {
          playerName: 'Rodrygo',
          playerId: 234,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
        {
          playerName: 'Bale',
          playerId: 235,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
      ],
    } as IGame;

    expect(evaluatePoints(mockBet, mockGame)).toBe(1);
  });

  it('should return 1 point if scorer was guessed', () => {
    const mockBet = {
      homeTeamScore: 2,
      awayTeamScore: 3,
      scorer: 123,
    } as IBet;
    const mockGame = {
      homeTeamScore: 1,
      awayTeamScore: 1,
      events: [
        {
          playerName: 'Benzema',
          playerId: 123,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
        {
          playerName: 'Bale',
          playerId: 235,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
      ],
    } as IGame;

    expect(evaluatePoints(mockBet, mockGame)).toBe(1);
  });

  it('should return 0 points if nothing was guessed correctly', () => {
    const mockBet = {
      homeTeamScore: 1,
      awayTeamScore: 2,
      scorer: 123,
    } as IBet;
    const mockGame = {
      homeTeamScore: 2,
      awayTeamScore: 1,
      events: [
        {
          playerName: 'Rodrygo',
          playerId: 234,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
        {
          playerName: 'Bale',
          playerId: 235,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
        },
      ],
    } as IGame;

    expect(evaluatePoints(mockBet, mockGame)).toBe(0);
  });

  it('should return 0 points if scorer scored own goal', () => {
    const mockBet = {
      homeTeamScore: 1,
      awayTeamScore: 2,
      scorer: 236,
    } as IBet;
    const mockGame = {
      homeTeamScore: 2,
      awayTeamScore: 1,
      events: [
        {
          playerName: 'Škrtel',
          playerId: 236,
          detail: FixtureEventDetail.OWN_GOAL,
          type: FixtureEventType.GOAL,
        },
      ],
    } as IGame;

    expect(evaluatePoints(mockBet, mockGame)).toBe(0);
  });
});

describe('assignPoints', () => {
  afterEach(async () => {
    // Drop all collections after each test
    const collections = await db.connection.db.collections();

    for (const col of collections) {
      await col.drop();
    }
  });

  it('should correctly assign points to a user', async () => {
    const season = 2021;
    const group = await Group.create(
      mockGroup([mockFollowedTeam([mockSeason(season, [mockCompetition()])])])
    );
    const competition = group.followedTeams[0].seasons[0].competitions[0];
    console.log('Creat user');
    const user = await User.create(mockUser(group._id, [[competition.apiId, season]]));
    console.log('User created');
    const competitionScoreObj = user.competitionScore[0];

    const initialScore = competitionScoreObj.score;
    await assignPoints(user, 3, competitionScoreObj.competitionApiId, season);
    const newScore = competitionScoreObj.score;

    expect(newScore).toBe(initialScore + 3);
  });

  it("should create a new competitionScore object if it doesn't exist and assign points", async () => {
    const season = 2021;
    const group = await Group.create(mockGroup([mockFollowedTeam([mockSeason(season)])]));
    const user = await User.create(mockUser(group._id));
    const competitionId = 99;

    assignPoints(user, 3, competitionId, season);

    expect(user.competitionScore[0].score).toBe(3);
  });
});

describe('queueTrigger', () => {
  afterEach(async () => {
    const collections = await db.connection.db.collections();

    for (const col of collections) {
      await col.drop();
    }
  });

  it('should evaluate bet of a user and correctly assign 3 points', async () => {
    const season = 2021;
    const group = await Group.create(
      mockGroup([mockFollowedTeam([mockSeason(season, [mockCompetition()])])])
    );
    const seasonObj = group.followedTeams[0].seasons[0];
    const competition = seasonObj.competitions[0];
    const game = await Game.create(mockGame(1, 0, GameStatus.FT, competition, season));
    const user = new User(mockUser(group._id, [[competition.apiId, season]]));
    user.bets.push(mockBet(user._id, game._id, BetStatus.PENDING, 1, 0));
    await user.save();

    const initialScore = user.competitionScore[0].score;
    const context = queueTriggerContext({
      game: game.toObject(),
      groupId: group._id,
    });
    await queueTrigger(context);
    const updatedUser = await User.findById(user._id);

    expect(updatedUser.competitionScore[0].score).toEqual(initialScore + 3);
    expect(updatedUser.bets[0].status).toEqual(BetStatus.EVALUATED);
  });

  it('should evaluate bet of a user and correctly assign 2 points', async () => {
    const season = 2021;
    const group = await Group.create(
      mockGroup([mockFollowedTeam([mockSeason(2021, [mockCompetition()])])])
    );
    const seasonObj = group.followedTeams[0].seasons[0];
    const competition = seasonObj.competitions[0];
    const game = await Game.create(
      mockGame(2, 0, GameStatus.FT, competition, season, [
        {
          playerName: 'Benzema',
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
          assistPlayerId: 1,
          assistPlayerName: 'Modric',
          playerId: 123,
          teamId: 123,
          teamName: 'Real Madrid',
          time: Date.now(),
        },
      ])
    );
    const user = new User(mockUser(group._id, [[competition.apiId, season]]));
    user.bets.push(mockBet(user._id, game._id, BetStatus.PENDING, 1, 0, 123));
    await user.save();

    const context = queueTriggerContext({
      game: game.toObject(),
      groupId: group._id,
    });
    await queueTrigger(context);
    const updatedUser = await User.findById(user._id);

    expect(updatedUser.competitionScore[0].score).toEqual(2);
    expect(updatedUser.bets[0].status).toEqual(BetStatus.EVALUATED);
  });

  it('should evaluate bet of multiple users and correctly assign points', async () => {
    const season = 2021;
    const group = await Group.create(
      mockGroup([mockFollowedTeam([mockSeason(season, [mockCompetition()])])])
    );
    const seasonObj = group.followedTeams[0].seasons[0];
    const competition = seasonObj.competitions[0];
    const game = await Game.create(
      mockGame(3, 2, GameStatus.FT, competition, season, [
        {
          playerName: 'Benzema',
          playerId: 123,
          detail: FixtureEventDetail.NORMAL_GOAL,
          type: FixtureEventType.GOAL,
          assistPlayerId: 1,
          assistPlayerName: 'Modric',
          teamId: 123,
          teamName: 'Real Madrid',
          time: Date.now(),
        },
      ])
    );
    const user1 = new User(mockUser(group._id, [[competition.apiId, season]]));
    const user2 = new User(mockUser(group._id, [[competition.apiId, season]]));
    // Guessed exact score
    user1.bets.push(mockBet(user1._id, game._id, BetStatus.PENDING, 3, 2, 123));
    // Guessed correct result
    user2.bets.push(mockBet(user2._id, game._id, BetStatus.PENDING, 2, 0));
    await user1.save();
    await user2.save();

    const context = queueTriggerContext({
      game: game.toObject(),
      groupId: group._id,
    });
    await queueTrigger(context);

    const updatedUser1 = await User.findById(user1._id);
    const updatedUser2 = await User.findById(user2._id);
    expect(updatedUser1.competitionScore[0].score).toEqual(4);
    expect(updatedUser2.competitionScore[0].score).toEqual(1);
  });
});
