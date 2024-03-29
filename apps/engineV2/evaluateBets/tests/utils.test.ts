import { beforeEach, describe, expect, test } from '@jest/globals';
import { exportModels, IBetWithID, IGameWithID, IUserWithID, User } from '@tipovacka/models';
import 'jest';
import mongoose from 'mongoose';
import { createMockBet, createMockGame, createMockUser } from '../../utils/testUtils';
import { assignPoints, evaluatePoints, placedBetOnGame } from '../utils';

describe('assignPoints', () => {
  // Initialize the mongoose models.
  exportModels(mongoose);

  let user: IUserWithID;

  beforeEach(async () => {
    user = createMockUser();

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

describe('placedBetOnGame', () => {
  let game: IGameWithID;
  let user: IUserWithID;
  let bet1: IBetWithID;
  let bet2: IBetWithID;
  let bet3: IBetWithID;

  beforeEach(async () => {
    user = createMockUser();
    game = createMockGame();

    // Don't specify game for any of the bets, so that a random ObjectID is generated.
    bet1 = createMockBet(user._id, undefined);
    bet2 = createMockBet(user._id, undefined);
    bet3 = createMockBet(user._id, undefined);
  });

  test("should return false, if a bet with the game's _id is not found in the user's bet array", async () => {
    user.bets = [bet1, bet2, bet3];

    const result = placedBetOnGame(user, game);

    expect(result).toBe(false);
  });

  test("should return false, if the user's bet array is empty", async () => {
    const result = placedBetOnGame(user, game);

    expect(result).toBe(false);
  });

  test("should return true, if a bet with the game's _id is found in the user's bet array", async () => {
    user.bets = [bet1, bet2, bet3];
    bet2.game = game._id;

    const result = placedBetOnGame(user, game);

    expect(result).toBe(true);
  });
});

describe('evaluatePoints', () => {
  let user: IUserWithID;
  let game: IGameWithID;
  let bet: IBetWithID;

  beforeEach(async () => {
    user = createMockUser();

    game = createMockGame();

    bet = createMockBet(user._id, game._id);
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
