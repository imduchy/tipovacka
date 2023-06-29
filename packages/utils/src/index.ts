import {
  mapPlayersFromApiResponse,
  mapStandingsFromApiResponse,
  mapTeamStatisticsFromApiResponse,
  mapFixtureFromApiResponse,
} from './mappings';

import {
  getFixture,
  getLeagues,
  getPlayers,
  getStandings,
  getTeam,
  getTeamStatistics,
} from './football_api';

import { createEmptyTeamStatisticsObject } from './teams';

export const MappingUtils = {
  mapPlayersFromApiResponse,
  mapStandingsFromApiResponse,
  mapTeamStatisticsFromApiResponse,
  mapFixtureFromApiResponse,
};

export const TeamUtils = {
  createEmptyTeamStatisticsObject,
};

export const FootballApi = {
  getFixture,
  getLeagues,
  getPlayers,
  getStandings,
  getTeam,
  getTeamStatistics,
};
