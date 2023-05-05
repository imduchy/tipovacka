import {
  FixtureEventDetail,
  FixtureEventType,
  IBet,
  IGame,
  IUser,
  IUserWithID,
  User,
} from '@tipovacka/models';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Checks if the specified user placed a bet on the specified game
 *
 * @param user A user that placed a bet on a game
 * @param game A game to which a bet was placed on
 * @returns true if the user has placed a bet on the game
 */
export function placedBetOnGame(user: IUser, game: HydratedDocument<IGame>): boolean {
  if (user.bets) {
    return user.bets.some((bet) => (bet.game as Types.ObjectId).equals(game._id));
  }
  return false;
}

/**
 * Finds the correct competitionScore object in the user record, filtering by
 * competition's API ID and season, and adds the number of points passed in the
 * parameter to the number of points in the competitionScore object.
 *
 * If there isn't a matching competitionScore record, it creates one and saves
 * the points.
 *
 * @param user a user to whom points should be assigned
 * @param points number of points to assign
 * @param season competition season
 * @param competitionApiId id of the competition (from the API)
 * @returns an updated user object
 */
export async function assignPoints(
  user: IUserWithID,
  points: number,
  competitionApiId: number,
  season: number
): Promise<HydratedDocument<IUser>> {
  const competition = user.competitionScore.find(
    (c) => c.competitionApiId === competitionApiId && c.season === season
  );

  // Create a new competitionScore object, if no matching object was found.
  if (!competition) {
    user.competitionScore.push({
      competitionApiId,
      season,
      score: points,
    });
  } else {
    competition.score = competition.score + points;
  }

  return await User.findOneAndUpdate(
    { _id: user._id },
    { competitionScore: user.competitionScore },
    { new: true }
  );
}

/**
 * Evaluates a bet on a game based on the game result and the bet as follows:
 * - If the bet contains the exact score, it returns 3 points
 * - If the bet contains the correct winner, it returns 1 point
 * - Otherwise, it returns 0 points.
 * - If the bet contains the correct scorer, it adds an extra 1 point
 * - If the game was a derby, the points are doubled
 *
 * The final number of points is returned.
 *
 * @param bet A bet record to evaluate
 * @param game A game record against which the bet will be evaluated
 * @param isDerby A flag indicating if a game was played against a rival team
 * @returns number of points
 */
export function evaluatePoints(bet: IBet, game: IGame, isDerby: boolean): number {
  let points = 0;

  // TODO: In the future, a config file can be used to control what
  // bets should be evaluated. E.g., some groups might want
  // to only evaluate bets on results, while others might want
  // to evaluate all bets
  points += evaluateResultBet(bet, game);

  if (bet.scorer) {
    points += evaluateScorerBet(bet, game);
  }

  if (isDerby && points > 0) {
    points = points * 2;
  }

  return points;
}

/**
 * Checks if the bet was correct, based on the game result and the bet as follows:
 * - If the bet contains the exact score, it returns 3 points
 * - If the bet contains the correct winner, it returns 1 point
 * - Otherwise, it returns 0 points.
 *
 * @param bet A bet record to evaluate
 * @param game A game record against which the bet will be evaluated
 * @returns number of points
 */
function evaluateResultBet(bet: IBet, game: IGame): number {
  /**
   * Evalutes the result of a game based on the home team score and away team score,
   * and returns 1 if home team won, 2 if away team won, 0 if it was a draw.
   *
   * @param homeTeamScore Home team score
   * @param awayTeamScore Away team score
   * @returns 1 if home team won, 2 if away team won, 0 if it was a draw
   */
  function __evaluate1X2(homeTeamScore: number, awayTeamScore: number) {
    if (homeTeamScore > awayTeamScore) return 1;
    else if (homeTeamScore < awayTeamScore) return 2;
    else return 0;
  }

  const gameResult = __evaluate1X2(game.homeTeamScore, game.awayTeamScore);
  const betResult = __evaluate1X2(bet.homeTeamScore, bet.awayTeamScore);
  const guessedWinner = gameResult === betResult;
  const guessedExactScore =
    bet.homeTeamScore === game.homeTeamScore && bet.awayTeamScore === game.awayTeamScore;

  let points = 0;

  if (guessedExactScore) points = 3;
  else if (guessedWinner) points = 1;

  return points;
}

/**
 * Checks if the scorer specified in the bet has scored a goal in the game.
 * If so, it returns 1, otherwise it returns 0.
 *
 * @param bet A bet record to evaluate
 * @param game A game record against which the bet will be evaluated
 * @returns 1 if the scorer has scored a goal, 0 otherwise
 *
 */
function evaluateScorerBet(bet: IBet, game: IGame): number {
  const scorer = bet.scorer;
  const hasScored = game.events.some(
    (event) =>
      event.type === FixtureEventType.GOAL &&
      (event.detail === FixtureEventDetail.NORMAL_GOAL ||
        event.detail === FixtureEventDetail.PENALTY) &&
      event.playerId === scorer
  );

  return hasScored ? 1 : 0;
}
