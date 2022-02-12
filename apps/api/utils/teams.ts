import { ITeamStatistics } from '@tipovacka/models';

export const emptyStatisticsObject = (): ITeamStatistics => ({
  played: {
    away: 0,
    home: 0,
    total: 0,
  },
  draws: {
    away: 0,
    home: 0,
    total: 0,
  },
  goals: {
    against: {
      average: {
        away: 0,
        home: 0,
        total: 0,
      },
      total: {
        away: 0,
        home: 0,
        total: 0,
      },
    },
    for: {
      average: {
        away: 0,
        home: 0,
        total: 0,
      },
      total: {
        away: 0,
        home: 0,
        total: 0,
      },
    },
  },
  wins: { away: 0, home: 0, total: 0 },
  form: '',
  cleanSheet: {
    away: 0,
    home: 0,
    total: 0,
  },
  failedToScore: {
    away: 0,
    home: 0,
    total: 0,
  },
  loses: {
    away: 0,
    home: 0,
    total: 0,
  },
});
