import { AllowedSchema } from 'express-json-validator-middleware';

export const getGroupSchema: AllowedSchema = {
  type: 'object',
  required: ['group'],
  properties: {
    group: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
  },
};

export const getGroupUsersSchema: AllowedSchema = {
  type: 'object',
  required: ['group'],
  properties: {
    group: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
    season: {
      type: 'string',
      minLength: 4,
      maxLength: 4,
    },
  },
};

export const getGroupCompetitionsSchema: AllowedSchema = {
  type: 'object',
  required: ['group', 'team', 'season'],
  properties: {
    group: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
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
    competition: {
      type: 'string',
      minLength: 1,
      maxLength: 5,
    },
  },
};

export const getGroupGamesSchema: AllowedSchema = {
  type: 'object',
  required: ['group', 'team', 'season'],
  properties: {
    group: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
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
    amount: {
      type: 'string',
      minLength: 1,
      maxLength: 2,
    },
    competition: {
      type: 'string',
      minLength: 1,
      maxLength: 5,
    },
  },
};
