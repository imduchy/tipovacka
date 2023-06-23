import { IFollowedTeam } from '@tipovacka/models';
import { getLatestSeason } from '../utils';

describe('getLatestSeason', () => {
  let mockFollowedTeam: IFollowedTeam = {} as IFollowedTeam;

  beforeEach(() => {
    mockFollowedTeam = {
      apiId: 1,
      logo: 'logo1',
      name: 'Real Madrid',
      rivals: [2, 3],
      seasons: [
        {
          season: 2022,
          competitions: [{}],
        },
      ],
    } as IFollowedTeam;
  });

  test('returns undefined if the seasons array is empty', () => {
    const followedTeam = { ...mockFollowedTeam };
    followedTeam.seasons = [];

    expect(getLatestSeason(followedTeam)).toBeUndefined();
  });

  test('returns season object if seasons the array contains one season', () => {
    expect(getLatestSeason(mockFollowedTeam)).not.toBeUndefined();
  });

  test('returns the latest season object if the seasons array contains multiple seasons', () => {
    const followedTeam = { ...mockFollowedTeam };
    followedTeam.seasons[1] = { ...followedTeam.seasons[0] };
    followedTeam.seasons[1].season = 2024;
    followedTeam.seasons[2] = { ...followedTeam.seasons[0] };
    followedTeam.seasons[2].season = 2023;

    const season = getLatestSeason(followedTeam);

    expect(season?.season).toBe(2024);
  });
});
