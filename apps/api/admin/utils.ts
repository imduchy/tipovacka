import { FootballApi, MappingUtils } from '@tipovacka/common-utils';
import { IGame } from '@tipovacka/models';
import logger from '../utils/logger';

/**
 * Fetches an upcoming game for each of specified leagues from an API
 * and returns the closest one based on a date.
 *
 * @param teamId teamId (id returned from API) of a team
 * @param leagueIds list of leagueIds (ids returned from API)
 * @returns an upcoming game for a specified team
 */
export const findUpcomingGame = async (teamId: number, leagueIds: number[]) => {
  let upcomingGames: IGame[] = [];

  try {
    const apiCalls = [];

    for (const league of leagueIds) {
      apiCalls.push(getUpcomingGame(teamId, league));
    }

    const responses = await Promise.all(apiCalls);
    upcomingGames = responses.filter((r) => r !== undefined) as IGame[];
  } catch (error) {
    logger.error(`Error while finding upcoming games for team ${teamId} & leagues ${leagueIds}`);
    throw error;
  }

  if (upcomingGames.length === 0) return undefined;

  upcomingGames.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  logger.info(`Sorted ${upcomingGames.length} upcoming games by the date field.`);
  logger.info(
    `The upcoming game is the game ${upcomingGames[0].gameId} between ` +
      `${upcomingGames[0].homeTeam} and ${upcomingGames[0].awayTeam} ` +
      `on the ${upcomingGames[0].date}.`
  );

  return upcomingGames[0];
};

/**
 * Fetches an upcoming league game of the specified team
 * from an API and returns it as IGame object.
 *
 * @param teamId teamId (id returned from API) of a team
 * @param leagueId leagueId (id returned from API)
 * @returns an upcoming league game for the specified team
 */
const getUpcomingGame = async (teamId: number, leagueId: number) => {
  try {
    const params = { team: teamId.toString(), league: leagueId.toString(), next: 1 };

    const { data } = await FootballApi.getFixture(params);

    if (data.results === 0) {
      logger.warn(`No upcoming games for the team ${teamId} in the league ${leagueId} found.`);
      return undefined;
    }

    return MappingUtils.mapFixtureFromApiResponse(data.response[0]);
  } catch (error) {
    logger.error('Error while fetching upcoming games from the Football API.');
    throw error;
  }
};
