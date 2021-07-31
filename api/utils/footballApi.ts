import {
  FixtureResponse,
  TeamResponse,
  StandingsResponse,
  TeamStatisticsResponse,
  PlayersResponse,
} from '@duchynko/tipovacka-models';
import axios, { AxiosResponse } from 'axios';
import { FootballApiResponseError, NoResultsInApiResponseError } from './exceptions';
import logger from './logger';

function logApiCall(endpoint: string, params: any) {
  logger.info(
    `[FootballApi] Get request to ${endpoint} endpoint with parameters %o`,
    params
  );
}

export async function getFixture(
  params: any
): Promise<AxiosResponse<FixtureResponse.RootObject>> {
  try {
    logApiCall('/fixtures', params);

    const response = await axios.get<FixtureResponse.RootObject>(
      process.env.API_FOOTBALL_URL + '/fixtures',
      {
        params,
        headers: {
          'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
          'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        },
      }
    );

    if (response.data.errors.length) {
      throw new FootballApiResponseError(
        'The response contains error objects: ' + response.data.errors
      );
    }

    return response;
  } catch (error) {
    if (error instanceof FootballApiResponseError) {
      logger.error(
        `A ${error.name} error occured while fetching fixtures from the API. Error: %s`,
        error.message
      );
    } else {
      logger.error(
        `A general error occured while fetching fixtures from the API. Error: ${error}`
      );
    }

    throw error;
  }
}

export async function getTeam(
  params: any
): Promise<AxiosResponse<TeamResponse.RootObject>> {
  try {
    logApiCall('/teams', params);

    const response = await axios.get(process.env.API_FOOTBALL_URL + '/teams', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });

    if (response.data.errors.length) {
      throw new FootballApiResponseError(
        'The response contains error objects: ' + response.data.errors
      );
    }

    return response;
  } catch (error) {
    if (error instanceof FootballApiResponseError) {
      logger.error(
        `A ${error.name} error occured while fetching team from the API. Error: %s`,
        error.message
      );
    } else {
      logger.error(
        `A general error occured while fetching team from the API. Error: ${error}`
      );
    }
    throw error;
  }
}

export async function getStandings(
  params: any
): Promise<AxiosResponse<StandingsResponse.RootObject>> {
  try {
    logApiCall('/standings', params);

    const response = await axios.get(process.env.API_FOOTBALL_URL + '/standings', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });

    if (response.data.errors.length) {
      throw new FootballApiResponseError(
        'The response contains error objects: ' + response.data.errors
      );
    }

    return response;
  } catch (error) {
    if (error instanceof FootballApiResponseError) {
      logger.error(
        `A ${error.name} error occured while fetching standings from the API. Error: %s`,
        error.message
      );
    } else {
      logger.error(
        `A general error occured while fetching standings from the API. Error: ${error}`
      );
    }
    throw error;
  }
}

export async function getTeamStatistics(
  params: any
): Promise<AxiosResponse<TeamStatisticsResponse.RootObject>> {
  try {
    logApiCall('/teams/statistics', params);

    const response = await axios.get(process.env.API_FOOTBALL_URL + '/teams/statistics', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });

    if (response.data.errors.length) {
      throw new FootballApiResponseError(
        'The response contains error objects: ' + response.data.errors
      );
    }

    return response;
  } catch (error) {
    if (error instanceof FootballApiResponseError) {
      logger.error(
        `A ${error.name} error occured while fetching team statistics from the API. Error: %s`,
        error.message
      );
    } else {
      logger.error(
        `A general error occured while fetching team statistics from the API. Error: ${error}`
      );
    }
    throw error;
  }
}

export async function getLeagues(params: any): Promise<AxiosResponse> {
  try {
    logApiCall('/leagues', params);

    const response = await axios.get(process.env.API_FOOTBALL_URL + '/leagues', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });

    if (response.data.errors.length) {
      throw new FootballApiResponseError(
        'The response contains error objects: ' + response.data.errors
      );
    }

    return response;
  } catch (error) {
    if (error instanceof FootballApiResponseError) {
      logger.error(
        `A ${error.name} error occured while fetching league information from ` +
          `the API. Error: ${error.message}`
      );
    } else {
      logger.error(
        `A general error occured while fetching league information from the ` +
          `API. Error: ${error}`
      );
    }
    throw error;
  }
}

export async function getPlayers(
  params: PlayersResponse.Parameters
): Promise<AxiosResponse<PlayersResponse.RootObject>> {
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

    if (response.data.results < 1) {
      throw new NoResultsInApiResponseError(
        "The API response from '/players' endpoint doesn't contain any results. " +
          `Provided arguments were ${JSON.stringify(params)}.`
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
        logger.info(
          `The page number ${i} contains ${nextResponse.data.results} results.`
        );
        response.data.response.push(...nextResponse.data.response);
      }
    }

    return response;
  } catch (error) {
    logger.error(
      `Error while fetching players information from the API. Error: ${error}`
    );
    throw error;
  }
}
