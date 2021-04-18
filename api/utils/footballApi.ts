import {
  FixtureResponse,
  TeamResponse,
  StandingsResponse,
  TeamStatisticsResponse,
} from '@duchynko/tipovacka-models';
import axios, { AxiosResponse } from 'axios';
import { FootballApiResponseError } from './exceptions';
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
