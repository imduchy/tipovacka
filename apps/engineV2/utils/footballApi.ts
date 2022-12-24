import { Context, Logger } from '@azure/functions';
import axios, { AxiosResponse } from 'axios';
import {
  FixtureEventsResponse,
  FixtureResponse,
  PlayersResponse,
  StandingsResponse,
} from '@tipovacka/models';
import { SecretClient } from '@azure/keyvault-secrets';

export class FootballApi {
  funcContext: Context;
  log: Logger;
  secretClient: SecretClient;
  apiHost: string;
  apiKey: string;

  constructor(funcContext: Context, secretClient: SecretClient, apiHost: string, apiKey: string) {
    this.funcContext = funcContext;
    this.log = this.funcContext.log;
    this.secretClient = secretClient;
    this.apiHost = apiHost;
    this.apiKey = apiKey;
  }

  private async _get<T>(url: string, params: any): Promise<AxiosResponse<T>> {
    return axios.get(url, {
      params,
      headers: {
        'x-rapidapi-host': this.apiHost,
        'x-rapidapi-key': this.apiKey,
      },
    });
  }

  async getFixture(params: any): Promise<AxiosResponse<FixtureResponse.RootObject>> {
    try {
      return this._get(`https://${this.apiHost}/fixtures`, params);
    } catch (error) {
      this.log.error(`An error occurred while fetching a fixture from the API. Error: ${error}`);
      throw error;
    }
  }

  async getEvents(params: any): Promise<AxiosResponse<FixtureEventsResponse.RootObject>> {
    try {
      return this._get(`https://${this.apiHost}/fixtures/events`, params);
    } catch (error) {
      this.log.error(
        `An error occurred while fetching fixture events from the API. Error: ${error}`
      );
      throw error;
    }
  }

  async getStandings(
    params: StandingsResponse.Parameters
  ): Promise<AxiosResponse<StandingsResponse.RootObject>> {
    try {
      return this._get(`https://${this.apiHost}/standings`, params);
    } catch (error) {
      this.log.error(`An error occurred while fetching standings from the API. Error: ${error}`);
      throw error;
    }
  }

  async getPlayers(
    params: PlayersResponse.Parameters
  ): Promise<AxiosResponse<PlayersResponse.RootObject>> {
    try {
      const response = await this._get<PlayersResponse.RootObject>(
        `https://${this.apiHost}/players`,
        params
      );

      const pages = response.data.paging.total;
      this.log.info(`The response contains ${pages} page(s) of results.`);

      if (pages > 1) {
        for (let i = 2; i <= pages; i++) {
          this.log.info(`Fetching the page ${i} of ${pages} of results.`);
          params.page = i;

          const nextResponse = await this._get<PlayersResponse.RootObject>(
            `https://${this.apiHost}/players`,
            params
          );

          response.data.response.push(...nextResponse.data.response);
        }
      }

      return response;
    } catch (error) {
      this.log.error(
        `An error occurred while fetching players information from the API. Error: ${error}`
      );
      throw error;
    }
  }
}
