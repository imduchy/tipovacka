import axios from 'axios'
import dotenv from 'dotenv'
import { FixtureResponse } from '../models/responses/FixtureResponse'
import { IGame } from '../models/Game'
import { GameStatus } from '../models/Enums'
import logger from '../utils/logger'

dotenv.config()

const URL = `${process.env.API_FOOTBALL_URL}/fixtures`

/**
 * Fetches an upcoming game for each of specified leagues from an API
 * and returns the closest one based on a date.
 *
 * @param teamId teamId (id returned from API) of a team
 * @param leagueIds list of leagueIds (ids returned from API)
 * @returns an upcoming game for a specified team
 */
export const findUpcommingGame = async (
  teamId: number,
  leagueIds: number[]
) => {
  const upcomingGames: IGame[] = []

  try {
    for (const league of leagueIds) {
      const response = await getUpcommingGame(teamId, league)

      if (!response) {
        // getUpcommingGame logs a warn message
        break
      }

      upcomingGames.push(response)
    }
  } catch (error) {
    logger.error(
      `Error while getting upcoming games for team ${teamId} & leagues ${leagueIds}`
    )
    throw error
  }

  upcomingGames.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  logger.info(`
    Sorted upcoming games in selected leagues for team ${teamId}.\n
    The upcoming game is ${upcomingGames[0].gameId}.
  `)

  return upcomingGames[0]
}

/**
 * Fetches an upcoming league game of the specified team
 * from an API and returns it as IGame object.
 *
 * @param teamId teamId (id returned from API) of a team
 * @param leagueId leagueId (id returned from API)
 * @returns an upcoming league game for the specified team
 */
export const getUpcommingGame = async (teamId: number, leagueId: number) => {
  try {
    const { data }: { data: FixtureResponse.RootObject } = await axios.get(
      URL,
      {
        params: {
          team: teamId,
          league: leagueId,
          next: 1,
        },
        headers: {
          'x-rapidapi-host': process.env.API_FOOTBALLHOST,
          'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        },
      }
    )

    if (data.results === 0) {
      logger.warn(
        `There are no results for upcoming games of a team ${teamId} in league ${leagueId}.` +
          ` Make sure you specified the right IDs.`
      )
      return
    }

    return responseMapping(data.response[0])
  } catch (error) {
    logger.error(
      `Error while getting upcoming games for team ${teamId} & leagues ${leagueId}`
    )
    throw error
  }
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
    awayTeamScore: score.fulltime.away ? score.fulltime.away : 0,
    homeTeamScore: score.fulltime.home ? score.fulltime.away : 0,
  }
}
