import { AllowedSchema } from 'express-json-validator-middleware';

export const postBetSchema: AllowedSchema = {
  type: 'object',
  required: ['game, homeTeamScore, awayTeamScore'],
  properties: {
    game: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
    homeTeamScore: {
      type: 'number',
      minimum: 0,
      maximum: 99,
    },
    awayTeamScore: {
      type: 'number',
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

export const putBetSchema: AllowedSchema = {
  type: 'object',
  required: ['bet, homeTeamScore, awayTeamScore', 'scorer'],
  properties: {
    bet: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
    homeTeamScore: {
      type: 'number',
      minimum: 0,
      maximum: 99,
    },
    awayTeamScore: {
      type: 'number',
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

export const getTopBetsSchema: AllowedSchema = {
  type: 'object',
  required: ['team', 'season', 'round'],
  properties: {
    team: {
      type: 'string',
      minLength: 1,
      maxLength: 5,
    },
    season: {
      type: 'string',
      minLength: 4,
      maxLength: 4,
    },
    round: {
      type: 'string',
      minLength: 1,
      maxLength: 2,
    },
    competition: {
      type: 'string',
      minLength: 1,
      maxLength: 3,
    },
  },
};
