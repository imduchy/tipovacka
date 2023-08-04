import { Game, Group, IBet, IBetWithID, IUserWithID, User } from '@tipovacka/models';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { ApiError } from '../errors/customErrors';
import { getLatestSeason } from '../groups/utils';
import { ResponseErrorCodes, ResponseMessages, ResponseStatusCodes } from '../utils/httpResponses';
import logger from '../utils/logger';
import { GetTopBetsParams, PostBetParams, PutBetParams } from './schemas';
import { hasPlacedBet } from './utils';

export const postBet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { game: gameId, homeTeamScore, awayTeamScore, scorer }: PostBetParams = req.body;
  const userId = new Types.ObjectId((req.user as IUserWithID)._id);

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a user ID '${userId}' in the request body. A user object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    if (hasPlacedBet(user, gameId)) {
      res.status(400).json({
        message: ResponseMessages.USER_ALREADY_PLACED_BET,
        code: ResponseErrorCodes.RESOURCE_ALREADY_EXISTS,
      });

      return next(
        new ApiError(
          `A user has already placed a bet for the game ${gameId}.`,
          `${req.method} /bets`,
          ResponseStatusCodes.ALREADY_EXISTS
        )
      );
    }

    const game = await Game.findById(gameId);
    if (!game) {
      res.status(404).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a game ID '${gameId}' in the request body. A game object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    // Don't submit the bet if the game already started.
    if (new Date().getTime() > game.date.getTime()) {
      res.status(400).json({
        message: ResponseMessages.GAME_ALREADY_STARTED,
        code: ResponseErrorCodes.BAD_REQUEST,
      });

      return next(
        new ApiError(
          `The specified game has already started.`,
          `${req.method} /bets`,
          ResponseStatusCodes.BAD_REQUEST
        )
      );
    }

    const bet: IBet = {
      game: new Types.ObjectId(gameId),
      user: userId,
      homeTeamScore: homeTeamScore,
      awayTeamScore: awayTeamScore,
      scorer: scorer,
      points: 0,
    };

    user.bets.push(bet);
    await user.save();
    logger.info(`A user ${user._id} submitted a bet on a game ${gameId}.`);

    res.status(200).json(user.bets);
  } catch (error) {
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
};

export const putBet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { bet: betId, homeTeamScore, awayTeamScore, scorer }: PutBetParams = req.body;
  const userId = new Types.ObjectId((req.user as IUserWithID)._id);

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a user ID '${userId}' in the request body. A user object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    const bet = user.bets.find((b) => (b as IBetWithID)._id.equals(betId));
    if (!bet) {
      res.status(404).json({
        message: ResponseMessages.BET_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a bet ID '${betId}' in the request body. A bet object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    const game = await Game.findById(bet.game);
    if (!game) {
      res.status(404).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a game ID '${bet.game}' in the request body. A game object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    // Don't update the bet if the game has already started.
    if (new Date().getTime() > game.date.getTime()) {
      res.status(400).json({
        message: ResponseMessages.GAME_ALREADY_STARTED,
        code: ResponseErrorCodes.UNAUTHORIZED_REQUEST,
      });

      return next(
        new ApiError(
          `The specified game has already started.`,
          `${req.method} /bets`,
          ResponseStatusCodes.BAD_REQUEST
        )
      );
    }

    bet.awayTeamScore = awayTeamScore;
    bet.homeTeamScore = homeTeamScore;
    bet.scorer = scorer;
    user.markModified('bets');
    await user.save();
    logger.info(`The user ${user.username} (${userId}) updated a bet on the game ${game._id}.`);

    res.status(200).json(bet);
  } catch (error) {
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
};

export const getTopBets = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as IUserWithID)._id;
  const { team, season, round }: GetTopBetsParams = req.body;
  let competition: number | undefined = req.body.competition;

  try {
    logger.info('Fetching the user by user ID.');
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a user ID '${userId}' in the query parameter. A user object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets/top`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    // If no competition is specified in the request, pick the first competition
    // TODO: Should the competition object be mandatory?
    if (!competition) {
      logger.info('Fetching the group by group ID.');
      const group = await Group.findById(user.groupId);

      if (!group) {
        res.status(404).json({
          message: ResponseMessages.GROUP_ID_DOESNT_EXIST,
          code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
        });

        return next(
          new ApiError(
            `A user has specified a group ID '${user.groupId}' in the query parameter. A group object with the provided ID doesn't exist in the database.`,
            `${req.method} /bets/top`,
            ResponseStatusCodes.NOT_FOUND
          )
        );
      }

      logger.info('Getting the latest season object from the group.');
      const latestSeason = getLatestSeason(group.followedTeams[0]);
      if (!latestSeason) {
        return next(
          new ApiError(
            `The group object of the user doesn't contain any seasons objects.`,
            `${req.method} /groups/competition`,
            ResponseStatusCodes.NOT_FOUND
          )
        );
      }

      competition = latestSeason.competitions[0].apiId;
    }

    // const gamesAggregate = await Game.aggregate([
    //   {
    //     $match: {
    //       season: season,
    //       competitionId: competition,
    //       $or: [{ 'homeTeam.teamId': team }, { 'awayTeam.teamId': team }],
    //     },
    //   },
    // ]);

    const games = await Game.find({
      season: season,
      competitionId: competition,
      $eq: { $or: [{ 'homeTeam.teamId': team }, { 'awayTeam.teamId': team }] },
    });

    // const games = gamesAggregate.flat() as IGameWithID[];
    const game = round >= 0 ? games[round] : games[games.length + round];

    if (!game) {
      logger.info('No games found. Returning an empty list back.');
      return res.status(200).json([]);
    }

    const users = await User.aggregate([
      { $match: { groupId: user.groupId, 'bets.game': game._id } },
      { $unwind: '$bets' },
      { $match: { groupId: user.groupId, 'bets.game': game._id, 'bets.points': { $gt: 0 } } },
      {
        $lookup: {
          from: 'games',
          localField: 'bets.game',
          foreignField: '_id',
          as: 'bets.game',
        },
      },
      { $sort: { 'bets.points': -1 } },
      {
        $group: {
          _id: '$_id',
          groupId: { $first: '$groupId ' },
          username: { $first: '$username' },
          email: { $first: '$email' },
          competitionScore: { $first: '$competitionScore' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          scope: { $first: '$scope' },
          bets: { $push: '$bets' },
        },
      },
      {
        $project: {
          groupId: 1,
          username: 1,
          email: 1,
          competitionScore: 1,
          createdAt: 1,
          updatedAt: 1,
          scope: 1,
          bets: {
            $map: {
              input: '$bets',
              as: 'bet',
              in: {
                $mergeObjects: [
                  '$$bet',
                  {
                    game: { $arrayElemAt: ['$$bet.game', 0] },
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    console.debug(users);

    // Returns
    // [{ username, ..., bets: [{}] }, { username, ..., bets: [{}] }, { username, ..., bets: [{}] }]
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Couldn't find bets. Error: ${error}.`);
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
};
