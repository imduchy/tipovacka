import { IBet, IGame, IUser, User, FixtureEventDetail, FixtureEventType } from '@tipovacka/models';
import { HydratedDocument, Types } from 'mongoose';

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
 * @param db wrapper class for database
 * @param user a user to whom points should be assigned
 * @param points number of points to assign
 * @param season competition season
 * @param competitionApiId id of the competition (from the API)
 * @returns an updated user object
 */
export async function assignPoints(
  user: HydratedDocument<IUser>,
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
    competition.score += points;
  }

  return await User.findOneAndUpdate(
    { _id: user._id },
    { competitionScore: user.competitionScore },
    { new: true }
  );
}

/**
 * TODO
 *
 * @param bet bet record to evaluate
 * @param game game record against which the bet will be evaluated
 * @param isDerby a flag indicating if a game was played against a rival team
 */
export function evaluatePoints(bet: IBet, game: IGame, isDerby: boolean): number {
  let points = 0;

  // In the future, a config file can be used to control what
  // bets should be evaluated. E.g., some groups might want
  // to only evaluate bets on results, while others might want
  // to evaluate all bets.
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
 * TODO
 *
 * @param bet
 * @param game
 * @returns
 */
function evaluateResultBet(bet: IBet, game: IGame): number {
  /**
   * TODO
   *
   * @param homeTeamScore
   * @param awayTeamScore
   * @returns
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
