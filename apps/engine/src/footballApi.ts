import { Logger } from '@azure/functions';
import axios, { AxiosResponse } from 'axios';
import {
  FixtureEventsResponse,
  FixtureResponse,
  PlayersResponse,
  StandingsResponse,
} from '@tipovacka/models';
import { FootballApiResponseError } from './exceptions';

export function getFixture(
  logger: Logger,
  params: unknown
): Promise<AxiosResponse<FixtureResponse.RootObject>> {
  try {
    return axios.get(process.env.API_FOOTBALL_URL + '/fixtures', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });
  } catch (error) {
    logger.error(`Error while fetching fixtures from the API. Error: ${error}`);
    throw error;
  }
}

export function getEvents(
  logger: Logger,
  params: unknown
): Promise<AxiosResponse<FixtureEventsResponse.RootObject>> {
  try {
    return axios.get(process.env.API_FOOTBALL_URL + '/fixtures/events', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });
  } catch (error) {
    logger.error(`Error while fetching fixture events from the API. Error: ${error}`);
    throw error;
  }
}

export async function getPlayers(
  logger: Logger,
  params: PlayersResponse.Parameters
): Promise<AxiosResponse<PlayersResponse.RootObject>> {
  /**
   * Wrapper around the HTTP request to the /players endpoint
   * @param params request parameters
   * @returns StandingResponse object
   */
  async function request(
    params: PlayersResponse.Parameters
  ): Promise<AxiosResponse<PlayersResponse.RootObject>> {
    const response = await axios.get<PlayersResponse.RootObject>(
      process.env.API_FOOTBALL_URL + '/players',
      {
        params,
        headers: {
          'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
          'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        },
      }
    );

    if (response.status != 200) {
      throw new FootballApiResponseError(
        "Response of the '/players' call returned with status " +
          `${response.status}. The response error object is ` +
          `${response.data.errors}.`
      );
    }

    return response;
  }

  // Set the default value for the page parameter, if no value was provided.
  if (!params.page) params.page = 1;

  try {
    const response = await request(params);
    const pages = response.data.paging.total;
    logger.info(`The response contains ${pages} pages of results.`);

    if (pages > 1) {
      logger.info('Looping through all remaining pages to get results.');
      for (let i = 2; i <= pages; i++) {
        params.page = i;
        const nextResponse = await request(params);
        logger.info(`The page number ${i} contains ${nextResponse.data.results} results.`);
        response.data.response.push(...nextResponse.data.response);
      }
    }

    return response;
  } catch (error) {
    logger.error(`Error while fetching players information from the API. Error: ${error}`);
    throw error;
  }
}

export async function getStandings(
  logger: Logger,
  params: unknown
): Promise<AxiosResponse<StandingsResponse.RootObject>> {
  try {
    const response = await axios.get<StandingsResponse.RootObject>(
      process.env.API_FOOTBALL_URL + '/standings',
      {
        params,
        headers: {
          'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
          'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        },
      }
    );

    if (response.status != 200) {
      throw new FootballApiResponseError(
        "Response of the '/standings' call returned with status " +
          `${response.status}. The response error object is ` +
          `${response.data.errors}.`
      );
    }

    return response;
  } catch (error) {
    logger.error(`Error while fetching standings from the API. Error: ${error}`);
    throw error;
  }
}
