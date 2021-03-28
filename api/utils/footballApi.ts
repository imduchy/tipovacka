import {
  FixtureResponse,
  TeamResponse,
  StandingsResponse,
  TeamStatisticsResponse,
} from '@duchynko/tipovacka-models';
import axios, { AxiosResponse } from 'axios';
import logger from './logger';

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
    });
  } catch (error) {
    logger.error(
      `Error while fetching fixtures from the API. ` +
        `Passed in params: ${params}. Error: ${error}`
    );
    throw error;
  }
}

export function getTeam(params: any): Promise<AxiosResponse<TeamResponse.RootObject>> {
  try {
    return axios.get(process.env.API_FOOTBALL_URL + '/teams', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });
  } catch (error) {
    logger.error(
      `Error while fetching team information from the API. ` +
        `Passed in params: ${params}. Error: ${error}`
    );
    throw error;
  }
}

export function getStandings(
  params: any
): Promise<AxiosResponse<StandingsResponse.RootObject>> {
  try {
    return axios.get(process.env.API_FOOTBALL_URL + '/standings', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });
  } catch (error) {
    logger.error(
      `Error while fetching standings information from the API. ` +
        `Passed in params: ${params}. Error: ${error}`
    );
    throw error;
  }
}

export function getTeamStatistics(
  params: any
): Promise<AxiosResponse<TeamStatisticsResponse.RootObject>> {
  try {
    return axios.get(process.env.API_FOOTBALL_URL + '/teams/statistics', {
      params,
      headers: {
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST,
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
      },
    });
  } catch (error) {
    logger.error(
      `Error while fetching team statistics from the API. ` +
        `Passed in params: ${params}. Error: ${error}`
    );
    throw error;
  }
}
