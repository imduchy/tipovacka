import { describe, expect, test, beforeEach } from '@jest/globals';
import { Context } from '@azure/functions';
import { Types, HydratedDocument } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import activityFunction from '../index';
import { SecretClient } from '@azure/keyvault-secrets';
import { FootballApi } from '../../utils/footballApi';
import { getDatabase } from '../../utils/database';
import {
  exportModels,
  FixtureEventDetail,
  FixtureEventType,
  Game,
  GameStatus,
  Group,
  IGroup,
} from '@tipovacka/models';
import {
  createMockFixtureEventResponse,
  createMockFixtureResponse,
  createMockGame,
  createMockGameEvent,
  createMockGroup,
} from '../../utils/testUtils';

describe('updateGame', () => {
  let context: Context;
  let groupId: Types.ObjectId;
  let goose: typeof import('mongoose');
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start the in-memory MongoDB server, initialize the database and export the models
    mongoServer = await MongoMemoryServer.create();
    goose = await getDatabase(mongoServer.getUri());
    exportModels(goose);
  });

  afterAll(async () => {
    if (goose.connection) {
      await goose.connection.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    context = { log: jest.fn() } as unknown as Context;
    groupId = new Types.ObjectId();

    // Clear the database before each test.
    await goose.connection.dropDatabase();

    // Populate the database with a group
    await Group.create(createMockGroup(groupId));

    // Stub SecretClient and its getSecret method.
    SecretClient.prototype.getSecret = jest.fn().mockResolvedValue({ value: '' });
  });

  test('should return NO_UPCOMING_GAME if the group does not have an upcoming game', async () => {
    // Mock the Football API responses.
    FootballApi.prototype.getFixture = jest.fn().mockResolvedValue({
      data: {
        response: [createMockFixtureResponse()],
      },
    });

    const { code, data } = await activityFunction(context, groupId);

    expect(code).toEqual('NO_UPCOMING_GAME');
    expect(data).toBeUndefined();
  });

  test('should return GAME_FINISHED if the game has finished', async () => {
    // Mock the Football API responses.
    FootballApi.prototype.getFixture = jest.fn().mockResolvedValue({
      data: {
        response: [createMockFixtureResponse()],
      },
    });

    FootballApi.prototype.getEvents = jest.fn().mockResolvedValue({
      data: { response: [] },
    });

    // Create and update documents in the database.
    const mockGame = createMockGame();
    const game = await Game.create(mockGame);
    await Group.findByIdAndUpdate(groupId, { upcomingGame: game });

    const { code, data } = await activityFunction(context, groupId);

    expect(code).toEqual('GAME_FINISHED');
    expect(data.status).toEqual('Match Finished');
  });

  test('should return GAME_NOT_FINISHED if the game is in progress', async () => {
    // Mock the Football API responses.
    FootballApi.prototype.getFixture = jest.fn().mockResolvedValue({
      data: {
        response: [createMockFixtureResponse('Match In Progress')],
      },
    });

    FootballApi.prototype.getEvents = jest.fn().mockResolvedValue({
      data: { response: [] },
    });

    // Create and update documents in the database.
    const mockGame = createMockGame();
    const game = await Game.create(mockGame);
    await Group.findByIdAndUpdate(groupId, { upcomingGame: game });

    const { code, data } = await activityFunction(context, groupId);

    expect(code).toEqual('GAME_NOT_FINISHED');
    expect(data).toBeUndefined();
  });

  test('should return GAME_POSTPONED if the game is postponed', async () => {
    // Mock the Football API responses.
    FootballApi.prototype.getFixture = jest.fn().mockResolvedValue({
      data: {
        response: [createMockFixtureResponse('Match Postponed')],
      },
    });

    FootballApi.prototype.getEvents = jest.fn().mockResolvedValue({
      data: { response: [] },
    });

    // Create and update documents in the database.
    const mockGame = createMockGame();
    const game = await Game.create(mockGame);
    await Group.findByIdAndUpdate(groupId, { upcomingGame: game });

    const { code, data } = await activityFunction(context, groupId);

    expect(code).toEqual('GAME_POSTPONED');
    expect(data).toBeUndefined();
  });
});
