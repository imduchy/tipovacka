import { Logger } from '@azure/functions';
import { FixtureResponse, GameStatus, IGame } from '@duchynko/tipovacka-models';
import { FootballApi } from '@duchynko/tipovacka-utilities';

/**
 * Fetches an upcoming game for each of the specified leagues from the
 * Football API and returns the closest one based on a date.
 *
 * @param logger logger object
 * @param teamId API id of the team
 * @param season season
 * @param leagueIds list of API ids of the leagues
 * @returns an upcoming game for a specified team
 */
export async function findUpcomingGame(
  logger: Logger,
  teamId: number,
  season: number,
  leagueIds: number[]
): Promise<IGame> {
  const upcomingGames: IGame[] = [];

  try {
    for (const league of leagueIds) {
      logger.info(`Fetching the upcoming game for the league ${league}.`);
      const response = await getUpcomingGameForLeague(logger, teamId, season, league);

      if (!response) {
        logger.warn(`There are no upcoming games in the league ${league}.`);
        continue;
      }

      upcomingGames.push(response);
    }
  } catch (error) {
    logger.error(
      `Error while getting upcoming games for team ${teamId} ` + `& leagues ${leagueIds}.`
    );
    throw error;
  }

  if (upcomingGames.length === 0) {
    logger.warn('No upcoming games found for the provided parameters.');
    return undefined;
  }

  logger.info(
    `Sorting ${upcomingGames.length} upcoming game(s) from all leagues ` +
      'by date to find the next game.'
  );
  upcomingGames.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return upcomingGames[0];
}

/**
 * Fetches an upcoming game for the specified league of the specified
 * team from an API and returns it as IGame object.
 *
 * @param logger logger object
 * @param teamId API id of the team
 * @param season season
 * @param leagueId API id of the league
 * @returns an upcoming league game for the specified team
 */
async function getUpcomingGameForLeague(
  logger: Logger,
  teamId: number,
  season: number,
  leagueId: number
): Promise<IGame> {
  try {
    const { data } = await FootballApi.getFixture({
      team: teamId,
      league: leagueId,
      season: season,
      next: 1,
    });

    if (data.results === 0) {
      return undefined;
    }

    return mapFixtureResponse(data.response[0]);
  } catch (error) {
    logger.error(
      `Error while getting upcoming games for team ${teamId} & leagues ${leagueId}`
    );
    throw error;
  }
}

/**
 * Maps a response from the API Fixture endpoint to the IGame object.
 *
 * @param response fixture response from the API
 * @returns game object
 */
const mapFixtureResponse = (response: FixtureResponse.Response): IGame => {
  const { fixture, teams, league, score } = response;

  return {
    date: new Date(fixture.date),
    gameId: fixture.id,
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
