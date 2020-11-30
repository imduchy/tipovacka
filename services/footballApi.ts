import axios, { AxiosResponse } from 'axios'
import dotenv from 'dotenv'
import logger from '../utils/logger'
import { FixtureResponse } from '~/models/responses/FixtureResponse'

dotenv.config()

export function getFixture(
  params: any
): Promise<AxiosResponse<FixtureResponse.RootObject>> {
  try {
    return axios.get(process.env.API_FOOTBALL_URL + '/fixtures', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    })
  } catch (error) {
    logger.error(`Error while fetching fixtures from the API. Error: ${error}`)
    throw error
  }
}
