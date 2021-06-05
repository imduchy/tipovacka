import { FixtureResponse, GameStatus, IGame } from '@duchynko/tipovacka-models';
import { Types } from 'mongoose';
import logger from './logger';
import { getFixture } from './footballApi';

/**
 * Fetches an upcoming game for each of specified leagues from an API
 * and returns the closest one based on a date.
 *
 * @param teamId teamId (id returned from API) of a team
 * @param leagueIds list of leagueIds (ids returned from API)
 * @param amountOfGames number of upcoming games to fetch from the API
 * @returns an upcoming game for a specified team
 */
export const findUpcomingGame = async (teamId: number, leagueIds: number[]) => {
  const upcomingGames: IGame[] = [];

  try {
    for (const league of leagueIds) {
      const response = await getUpcomingGame(teamId, league);

      if (!response) {
        // getUpcomingGame logs a warn message
        break;
      }

      upcomingGames.push(response);
    }
  } catch (error) {
    logger.error(
      `Error while getting upcoming games for team ${teamId} & leagues ${leagueIds}`
    );
    throw error;
  }

  if (upcomingGames.length === 0) {
    return undefined;
  }

  upcomingGames.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  logger.info(`Sorted upcoming games in the selected leagues for team ${teamId}.`);
  logger.info(`The upcoming game is ${upcomingGames[0].gameId}.`);

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
    const { data } = await getFixture({
      team: teamId,
      league: leagueId,
      next: 1,
    });

    if (data.results === 0) {
      logger.warn(
        `There are no results for upcoming games of a team ${teamId} in league ${leagueId}.` +
          ` Make sure you specified the right IDs.`
      );
      return;
    }

    return responseMapping(data.response[0]);
  } catch (error) {
    logger.error(
      `Error while getting upcoming games for team ${teamId} & leagues ${leagueId}`
    );
    throw error;
  }
};

/**
 * Maps response from the API's fixture endpoint
 * to an IGame object.
 *
 * @param response fixture response from the API
 */
const responseMapping = (response: FixtureResponse.Response): IGame => {
  const { fixture, teams, league, score } = response;

  return {
    date: new Date(fixture.date),
    gameId: fixture.id,
    groupId: Types.ObjectId(), // This is just a placeholder
    competitionId: league.id,
    competitionName: league.name,
    awayTeam: {
      teamId: teams.away.id,
      name: teams.away.name,
      logo: teams.away.logo,
    },
    homeTeam: {
      teamId: teams.home.id,
      name: teams.home.name,
      logo: teams.home.logo,
    },
    season: league.season,
    status: GameStatus[fixture.status.short],
    venue: fixture.venue.name,
    awayTeamScore: score.fulltime.away ? score.fulltime.away : 0,
    homeTeamScore: score.fulltime.home ? score.fulltime.away : 0,
  };
};
