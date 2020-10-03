import axios from 'axios'
import dotenv from 'dotenv'
import { FixtureResponse } from '../models/responses/FixtureResponse'
import { IGame } from '~/models/Game'
import { GameStatus } from '~/models/Enums'

dotenv.config()

const URL = `${process.env.API_URL}/fixtures`

/**
 * Fetches an upcoming game for each of specified leagues from an API
 * and returns the closest one based on a date.
 *
 * @param teamId teamId (id returned from API) of a team
 * @param leagueIds list of leagueIds (ids returned from API)
 * @returns an upcoming game for a specified team
 */
export const getUpcomingGame = async (teamId: number, leagueIds: number[]) => {
  const upcomingGameResponses: FixtureResponse.Response[] = []

  for (const league of leagueIds) {
    const { response }: FixtureResponse.RootObject = await axios.get(URL, {
      params: {
        teamId,
        league,
      },
      headers: {
        'x-rapidapi-host': process.env.API_HOST,
        'x-rapidapi-key': process.env.API_KEY,
      },
    })

    upcomingGameResponses.push(response[0])
  }

  upcomingGameResponses.sort((a, b) => {
    return (
      new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
    )
  })

  return responseMapping(upcomingGameResponses[0])
}

/**
 * Maps response from the API's fixture endpoint
 * to an IGame object.
 *
 * @param response fixture response from the API
 */
const responseMapping = (response: FixtureResponse.Response): IGame => {
  const { fixture, teams, league, score } = response

  return {
    date: new Date(fixture.date),
    gameId: fixture.id,
    competition: league.id,
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
    awayTeamScore: score.fulltime.away,
    homeTeamScore: score.fulltime.home,
  }
}
