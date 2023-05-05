import { beforeEach, describe, expect, test } from '@jest/globals';
import {
  BetStatus,
  exportModels,
  GameStatus,
  IBetWithID,
  IGameWithID,
  IUserWithID,
  User,
} from '@tipovacka/models';
import mongoose from 'mongoose';
import { assignPoints, evaluatePoints } from '../utils';

describe('assignPoints', () => {
  // Initialize the mongoose models.
  exportModels(mongoose);

  let user: IUserWithID;

  beforeEach(async () => {
    user = {
      _id: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
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

    // Stub the User model and its findOneAndUpdate method.
    User.findOneAndUpdate = jest.fn().mockImplementation(() => user);
  });

  test('should create a new competitionScore object, if no matching object was found', async () => {
    await assignPoints(user, 3, 2, 2020);

    expect(user.competitionScore).toHaveLength(2);
  });

  test('should update the score of the existing competitionScore object', async () => {
    await assignPoints(user, 3, 1, 2020);

    expect(user.competitionScore[0].score).toBe(3);
  });

  test('should create a new competitionScore object and update its score', async () => {
    await assignPoints(user, 3, 2, 2020);

    expect(user.competitionScore[1].score).toBe(3);
  });
});

describe('evaluatePoints', () => {
  let user: IUserWithID;
  let game: IGameWithID;
  let bet: IBetWithID;

  beforeEach(async () => {
    user = {
      _id: new mongoose.Types.ObjectId(),
      groupId: new mongoose.Types.ObjectId(),
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

    game = {
      _id: new mongoose.Types.ObjectId(),
      season: 2020,
      homeTeam: {
        teamId: 1,
        name: 'Arsenal',
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

    bet = {
      _id: new mongoose.Types.ObjectId(),
      game: game._id,
      homeTeamScore: 1,
      awayTeamScore: 2,
      points: 0,
      scorer: 1,
      user: user._id,
      status: BetStatus.PENDING,
    };
  });

  test('should return 0 points, if the bet was incorrect', async () => {
    bet.homeTeamScore = 1;
    bet.awayTeamScore = 2;

    const points = evaluatePoints(bet, game, false);

    expect(points).toBe(0);
  });

  test('should return 1 point, if the bet contains correct winner', async () => {
    bet.homeTeamScore = 3;
    bet.awayTeamScore = 0;

    const points = evaluatePoints(bet, game, false);

    expect(points).toBe(1);
  });

  test('should return 3 points, if the bet contains correct score', async () => {
    bet.homeTeamScore = 2;
    bet.awayTeamScore = 1;

    const points = evaluatePoints(bet, game, false);

    expect(points).toBe(3);
  });
});
