import { AllowedSchema } from 'express-json-validator-middleware';

export interface PostBetParams {
  game: string;
  homeTeamScore: number;
  awayTeamScore: number;
  scorer?: number;
}

export const postBetSchema: AllowedSchema = {
  type: 'object',
  required: ['game, homeTeamScore, awayTeamScore'],
  properties: {
    game: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
    homeTeamScore: {
      type: 'string',
      minimum: 0,
      maximum: 99,
    },
    awayTeamScore: {
      type: 'string',
      minimum: 0,
      maximum: 99,
    },
    scorer: {
      type: 'string',
      minimum: 1,
      maximum: 999999,
    },
  },
};

export interface PutBetParams {
  bet: string;
  homeTeamScore: number;
  awayTeamScore: number;
  scorer: number;
}

export const putBetSchema: AllowedSchema = {
  type: 'object',
  required: ['bet, homeTeamScore, awayTeamScore', 'scorer'],
  properties: {
    bet: {
      type: 'string',
      // pattern: '^[0-9a-fA-F]{24}$',
    },
    homeTeamScore: {
      type: 'string',
      minimum: 0,
      maximum: 99,
    },
    awayTeamScore: {
      type: 'string',
      minimum: 0,
      maximum: 99,
    },
    scorer: {
      type: 'number',
      minimum: 1,
      maximum: 999999,
    },
  },
};

export interface GetTopBetsParams {
  team: number;
  season: number;
  round: number;
  competition?: number;
}

export const getTopBetsSchema: AllowedSchema = {
  type: 'object',
  required: ['team', 'season', 'round'],
  properties: {
    season: {
      type: 'string',
      minimum: 2000,
      maximum: 2099,
    },
    round: {
      type: 'string',
      minimum: 1,
      maximum: 99,
    },
    competition: {
      type: 'string',
      minimum: 1,
      maximum: 999,
    },
    team: {
      type: 'string',
      minimum: 1,
      maximum: 99999,
    },
  },
};
