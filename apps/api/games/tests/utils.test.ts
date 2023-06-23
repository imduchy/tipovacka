import { FixtureResponse } from '@tipovacka/models';
import { AxiosResponse } from 'axios';
import { getFixture } from '../../utils/footballApi';
import { findUpcomingGame } from '../utils';

jest.mock('../../utils/footballApi');
const getFixtureMock = jest.mocked(getFixture);

type FixtureResponseType = AxiosResponse<FixtureResponse.RootObject>;

describe('test findUpcomingGame method', () => {
  let mockFixtureResponse = {} as FixtureResponse.RootObject;

  beforeEach(() => {
    mockFixtureResponse = {
      response: [
        {
          teams: {
            home: {
              id: 1,
              logo: 'logo1',
              name: 'Real Madrid',
            },
            away: {
              id: 2,
              logo: 'logo2',
              name: 'Barcelona',
            },
          },
          fixture: {
            id: 123,
            date: '2023-02-06T14:00:00+00:00',
            status: {
              short: 'NS',
            },
            venue: {
              name: 'Santiago Bernabeu',
            },
          },
          league: {
            id: 1,
            name: 'La Liga',
            season: 2023,
          },
          score: {
            fulltime: {
              home: 2,
              away: 1,
            },
          },
        },
      ],
    } as FixtureResponse.RootObject;
  });

  test('should return undefined if leagueIds array is empty', async () => {
    const game = await findUpcomingGame(1, []);

    expect(game).toBeUndefined();
  });

  test('should return undefined if the response contains no data', async () => {
    getFixtureMock.mockResolvedValue({ data: { results: 0 } } as FixtureResponseType);

    const game = await findUpcomingGame(1, [1]);

    expect(game).toBeUndefined();
  });

  test('should return a game object if the response contains one game', async () => {
    getFixtureMock.mockResolvedValue({ data: mockFixtureResponse } as FixtureResponseType);

    const game = await findUpcomingGame(1, [1]);

    expect(game?.gameId).toBe(mockFixtureResponse.response[0].fixture.id);
  });

  test('should return a game object if the response contains multiple games', async () => {
    const mockResponse1 = { ...mockFixtureResponse };
    const mockResponse2 = { ...mockFixtureResponse };
    const mockResponse3 = { ...mockFixtureResponse };
    mockResponse3.response[0].fixture.id = 345;
    mockResponse3.response[0].league.id = 3;
    mockResponse3.response[0].fixture.date = '2023-03-06T14:00:00+00:00';

    // mockResponse2 will contain the upcoming fixture (based on the date)
    mockResponse2.response[0].fixture.id = 234;
    mockResponse2.response[0].league.id = 2;
    mockResponse2.response[0].fixture.date = '2023-01-06T14:00:00+00:00';

    getFixtureMock
      .mockResolvedValueOnce({ data: mockResponse1 } as FixtureResponseType)
      .mockResolvedValueOnce({ data: mockResponse2 } as FixtureResponseType)
      .mockResolvedValueOnce({ data: mockResponse3 } as FixtureResponseType);

    const game = await findUpcomingGame(1, [1, 2, 3]);

    expect(game?.gameId).toEqual(234);
  });

  test('should return a game object if some responses contain no data', async () => {
    getFixtureMock
      .mockResolvedValueOnce({ data: { results: 0 } } as FixtureResponseType)
      .mockResolvedValueOnce({ data: mockFixtureResponse } as FixtureResponseType)
      .mockResolvedValueOnce({ data: { results: 0 } } as FixtureResponseType);

    const game = await findUpcomingGame(1, [1, 2, 3]);

    expect(game?.gameId).toBe(123);
  });

  test('should catch and throw an error raised while calling the API', () => {
    getFixtureMock
      .mockResolvedValueOnce({ data: mockFixtureResponse } as FixtureResponseType)
      .mockRejectedValueOnce(new Error('whopsie'));

    expect(findUpcomingGame(1, [1, 2, 3])).rejects.toThrow(new Error('whopsie'));
  });
});
