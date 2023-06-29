import {
  FixtureResponse,
  PlayersResponse,
  StandingsResponse,
  TeamResponse,
  TeamStatisticsResponse,
} from '@tipovacka/models';
import axios, { AxiosResponse } from 'axios';

export async function getFixture(
  params: FixtureResponse.Parameters
): Promise<AxiosResponse<FixtureResponse.RootObject>> {
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
}

export async function getTeam(
  params: TeamResponse.Parameters
): Promise<AxiosResponse<TeamResponse.RootObject>> {
  const response = await axios.get<TeamResponse.RootObject>(
    process.env.API_FOOTBALL_URL + '/teams',
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
}

export async function getStandings(
  params: StandingsResponse.Parameters
): Promise<AxiosResponse<StandingsResponse.RootObject>> {
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

  if (response.data.errors.length) {
    throw new FootballApiResponseError(
      'The response contains error objects: ' + response.data.errors
    );
  }

  return response;
}

export async function getTeamStatistics(
  params: TeamStatisticsResponse.Parameters
): Promise<AxiosResponse<TeamStatisticsResponse.RootObject>> {
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
}

export async function getLeagues(params: any): Promise<AxiosResponse> {
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
}

export async function getPlayers(
  params: PlayersResponse.Parameters
): Promise<AxiosResponse<PlayersResponse.RootObject>> {
  /**
   * A helper method wrapping the request to the '/players' endpoint
   *
   * @param params Parameters for the request
   * @returns Response containing players information
   */
  async function _request(
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

    return response;
  }

  /**
   * A helper method to iterate over multiple pages of the response
   *
   * @param n number of pages to iterate over
   * @returns list of response objects from the '/players' endpoint
   */
  async function _iteratePages(n: number): Promise<PlayersResponse.Response[]> {
    const requests = [];

    for (let i = 2; i <= n; i++) {
      params.page = i;
      requests.push(_request(params));
    }

    const responses = await Promise.all(requests);
    const data = responses.map((res) => res.data.response);

    return data.flat();
  }

  // Set the default value for the page parameter, if no value was provided.
  if (!params.page) params.page = 1;

  const response = await _request(params);
  const pages = response.data.paging.total;

  if (pages > 1) {
    const pagingResponses = await _iteratePages(pages);
    response.data.response.push(...pagingResponses);
  }

  return response;
}

export class FootballApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FootballApiResponseError';
  }
}
