import {
  exportModels,
  Game,
  Group,
  IBet,
  IBetWithID,
  IGameWithID,
  IUserWithID,
  User,
} from '@tipovacka/models';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../../errors/customErrors';
import { ResponseErrorCodes } from '../../utils/httpResponses';
import { postBet, putBet } from '../controllers';

// import mockingoose from 'mockingoose'; doesn't seem to be working
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('POST /bet', () => {
  let requestMock: Request;
  let responseMock: Response;
  let nextFnMock: NextFunction;
  let userMock: IUserWithID;
  let gameMock: IGameWithID;

  beforeAll(() => {
    exportModels(mongoose);
  });

  beforeEach(() => {
    mockingoose.resetAll();

    userMock = {
      _id: '507f191e810c19729de480eb',
      groupId: '507f191e810c19729de770cd',
      username: 'user1',
      email: 'user@email.com',
      competitionScore: [],
      bets: [],
      scope: ['user'],
    } as unknown as IUserWithID;

    gameMock = {
      _id: '507f191e810c19729de860ea',
      date: new Date(),
    } as unknown as IGameWithID;

    requestMock = {
      body: { game: gameMock._id, homeTeamScore: 2, awayTeamScore: 1, scorer: 123 },
      user: { _id: userMock._id },
    } as unknown as Request;

    responseMock = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    nextFnMock = jest.fn().mockReturnThis();
  });

  it('should return 404 if the user with the provided ID does not exist', async () => {
    mockingoose(User).toReturn(null, 'findOne');

    await postBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(404);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      })
    );
  });

  it('should return 400 if the user has already placed a bet for the game', async () => {
    // Types.ObjectId returns undefined therefore the cast to unkown as IBet
    userMock.bets = [{ game: requestMock.body.game } as unknown as IBet];
    mockingoose(User).toReturn(userMock, 'findOne');

    await postBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(400);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.RESOURCE_ALREADY_EXISTS,
      })
    );
  });

  it('should return 404 if the game with the provided ID does not exist', async () => {
    mockingoose(User).toReturn(userMock, 'findOne');
    mockingoose(Game).toReturn(null, 'findOne');

    await postBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(404);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      })
    );
  });

  it('it should return 400 if the game has already started', async () => {
    mockingoose(User).toReturn(userMock, 'findOne');
    mockingoose(Game).toReturn(gameMock, 'findOne');

    await postBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(400);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.BAD_REQUEST,
      })
    );
  });

  it('should return 200 and save the bet in the database', async () => {
    mockingoose(Group).toReturn({ _id: userMock.groupId }, 'findOne');
    mockingoose(User)
      .toReturn(userMock, 'findOne')
      .toReturn({ ...userMock, bets: [requestMock.body] }, 'save');
    mockingoose(Game).toReturn(
      { ...gameMock, date: new Date('2030-06-11T20:00:00.000Z') },
      'findOne'
    );

    await postBet(requestMock, responseMock, nextFnMock);

    expect(responseMock.status).toBeCalledWith(200);
  });
});

describe('PUT /bet', () => {
  let requestMock: Request;
  let responseMock: Response;
  let nextFnMock: NextFunction;
  let userMock: IUserWithID;
  let betMock: IBetWithID;
  let gameMock: IGameWithID;

  beforeAll(() => {
    exportModels(mongoose);
  });

  beforeEach(() => {
    mockingoose.resetAll();

    userMock = {
      _id: '507f191e810c19729de480eb',
      groupId: '507f191e810c19729de770cd',
      username: 'user1',
      email: 'user@email.com',
      competitionScore: [],
      bets: [],
      scope: ['user'],
    } as unknown as IUserWithID;

    gameMock = {
      _id: '507f191e810c19729de860ea',
      date: new Date(),
    } as unknown as IGameWithID;

    betMock = {
      _id: '507f191e810c19729de492ef',
      game: gameMock._id,
      homeTeamScore: 2,
      awayTeamScore: 1,
      scorer: 123,
    } as unknown as IBetWithID;

    requestMock = {
      body: { bet: betMock._id, homeTeamScore: 2, awayTeamScore: 1, scorer: 123 },
      user: { _id: userMock._id },
    } as unknown as Request;

    responseMock = {
      send: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    nextFnMock = jest.fn().mockReturnThis();
  });

  it("should return 404 if the user object doesn't exist", async () => {
    mockingoose(User).toReturn(null, 'findOne');

    await putBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(404);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      })
    );
  });

  it("should return 404 if the user hasn't placed a bet for the game", async () => {
    mockingoose(User).toReturn(userMock, 'findOne');

    await putBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(404);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      })
    );
  });

  it('should return 404 if the game with the provided ID does not exist', async () => {
    mockingoose(User).toReturn(userMock, 'findOne');
    mockingoose(Game).toReturn(null, 'findOne');

    await putBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(404);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      })
    );
  });

  it('it should return 400 if the game has already started', async () => {
    mockingoose(User).toReturn({ ...userMock, bets: [betMock] }, 'findOne');
    mockingoose(Game).toReturn(gameMock, 'findOne');

    await putBet(requestMock, responseMock, nextFnMock);

    expect(nextFnMock).toBeCalledWith(expect.any(ApiError));
    expect(responseMock.status).toBeCalledWith(400);
    expect(responseMock.json).toBeCalledWith(
      expect.objectContaining({
        code: ResponseErrorCodes.UNAUTHORIZED_REQUEST,
      })
    );
  });

  it('should return 200 and save the bet in the database', async () => {
    mockingoose(Group).toReturn({ _id: userMock.groupId }, 'findOne');
    mockingoose(User)
      .toReturn({ ...userMock, bets: [betMock] }, 'findOne')
      .toReturn({ ...userMock, bets: [betMock] }, 'save');
    mockingoose(Game).toReturn(
      { ...gameMock, date: new Date('2030-06-11T20:00:00.000Z') },
      'findOne'
    );

    await putBet(requestMock, responseMock, nextFnMock);

    expect(responseMock.status).toBeCalledWith(200);
  });
});
