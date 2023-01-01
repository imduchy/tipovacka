import { FixtureResponse, GameStatus, IGame } from '@tipovacka/models';
import { FootballApi } from '../utils/footballApi';

/**
 * Fetches an upcoming game for the specified league of the specified
 * team from an API and returns it as IGame object.
 *
 * @param footballApi FootballApi object
 * @param teamId API ID of the team
 * @param season season (year)
 * @param leagueId API ID of the league
 * @param nextNth nth upcoming game in the league
 * @returns an upcoming league game for the specified team
 */
export async function getUpcomingGameForLeague(
  footballApi: FootballApi,
  teamId: number,
  season: number,
  leagueId: number,
  nextNth = 1
): Promise<IGame> {
  const { data } = await footballApi.getFixture({
    team: teamId,
    league: leagueId,
    season: season,
    next: nextNth,
  });

  if (data.results === 0) {
    return undefined;
  }

  return mapFixtureResponse(data.response[nextNth - 1]);
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
