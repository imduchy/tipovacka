import {
  mapPlayersFromApiResponse,
  mapStandingsFromApiResponse,
  mapTeamStatisticsFromApiResponse,
  mapFixtureFromApiResponse,
} from './src/mappings';

import { createEmptyTeamStatisticsObject } from './src/teams';

export const MappingUtils = {
  mapPlayersFromApiResponse,
  mapStandingsFromApiResponse,
  mapTeamStatisticsFromApiResponse,
  mapFixtureFromApiResponse,
};

export const TeamUtils = {
  createEmptyTeamStatisticsObject,
};
