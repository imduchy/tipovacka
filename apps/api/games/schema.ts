import { AllowedSchema } from 'express-json-validator-middleware';

export const getGameSchema: AllowedSchema = {
  type: 'object',
  required: ['game'],
  properties: {
    game: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
    },
  },
};
