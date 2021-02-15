import '@testing-library/jest-dom'
import { BetStatus } from '@duchynko/tipovacka-models'
import IndexPage from '../../pages/index'
import { renderWithVuetify } from '../setup'

test('displays teams names', () => {
  const { getByText } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: mockUpcomingGame,
      },
    },
    mocks: {
      $auth: mockAuth,
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  })
  const homeTeamName = getByText(mockUpcomingGame().homeTeam.name)
  const awayTeamName = getByText(mockUpcomingGame().awayTeam.name)

  expect(homeTeamName).toBeVisible()
  expect(awayTeamName).toBeVisible()
})

test('shows loading bar when upcomingGame is undefined', () => {
  const { getByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => undefined,
      },
    },
    mocks: {
      $auth: mockAuth,
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  })
  const progressBar = getByTestId('progress-circular')

  expect(progressBar).toBeVisible()
})

test('hides loading bar when upcomingGame is not undefined', () => {
  const { queryByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: mockAuth,
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  })

  expect(queryByTestId('progress-circular')).toBe(null)
})

test('displays upcoming-game component when upcomingGame is not undefined', () => {
  const { getByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: mockAuth,
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  })

  expect(getByTestId('upcoming-game')).not.toBeNull()
})

test("displays bet-input component if user hasn't placed a bet yet", () => {
  const { getByTestId, queryByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: { user: { bets: [] } },
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  })

  expect(getByTestId('bet-input')).not.toBeNull()
  expect(queryByTestId('current-bet')).toBeNull()
})

test("displays bet-input component if user hasn't placed a bet yet", () => {
  const { getByTestId, queryByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: mockAuth,
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  })

  expect(getByTestId('current-bet')).not.toBeNull()
  expect(queryByTestId('bet-input')).toBeNull()
})

test('displays 3 user-bet components if user has 3 or more evaluated bets', () => {
  const { getAllByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: mockAuth,
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  })

  expect(getAllByTestId('user-bet').length).toBe(3)
})

test('displays 1 user-bet component if user has 1 evaluated bet', () => {
  const { getAllByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: {
        user: {
          ...mockAuth.user,
          // Only use the first 2 bets defined in the mockAuth object
          bets: mockAuth.user.bets.slice(0, 2),
        },
      },
    },
  })

  expect(getAllByTestId('user-bet').length).toBe(1)
})

test('displays no user-bet components if user has no evaluated bet', () => {
  const { queryByTestId } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: {
        user: {
          ...mockAuth.user,
          // Only use the first 2 bets defined in the mockAuth object
          bets: mockAuth.user.bets.slice(0, 1),
        },
      },
    },
  })

  expect(queryByTestId('user-bet')).toBeNull()
})

const mockDate = new Date('February 19, 2050 12:10:00')

const mockUpcomingGame = () => ({
  _id: '5f00000000000000000000',
  date: mockDate,
  homeTeamScore: 0,
  awayTeamScore: 0,
  homeTeam: { name: 'Real Madrid', logo: 'hometeam.logo' },
  awayTeam: { name: 'Barcelona', logo: 'awayteam.logo' },
  venue: 'Santiago Bernabéu Stadium',
})

const mockAuth = {
  user: {
    bets: [
      {
        game: {
          _id: '5f00000000000000000000',
          homeTeamScore: 2,
          awayTeamScore: 1,
          homeTeam: {
            logo: 'hometeamlogo.png',
            name: 'Real Madrid',
          },
          awayTeam: {
            logo: 'awayteamlogo.png',
            name: 'Barcelona',
          },
          date: mockDate,
        },
        homeTeamScore: 2,
        awayTeamScore: 1,
        status: BetStatus.PENDING,
      },
      {
        game: {
          _id: '5f00000000000000000001',
          homeTeamScore: 3,
          awayTeamScore: 2,
          homeTeam: {
            logo: 'hometeamlogo.png',
            name: 'Real Madrid',
          },
          awayTeam: {
            logo: 'awayteamlogo.png',
            name: 'Barcelona',
          },
          date: mockDate,
        },
        homeTeamScore: 4,
        awayTeamScore: 1,
        status: BetStatus.EVALUATED,
      },
      {
        game: {
          _id: '5f00000000000000000002',
          homeTeamScore: 3,
          awayTeamScore: 0,
          homeTeam: {
            logo: 'hometeamlogo.png',
            name: 'Real Madrid',
          },
          awayTeam: {
            logo: 'awayteamlogo.png',
            name: 'Barcelona',
          },
          date: mockDate,
        },
        homeTeamScore: 0,
        awayTeamScore: 2,
        status: BetStatus.EVALUATED,
      },
      {
        game: {
          _id: '5f00000000000000000003',
          homeTeamScore: 4,
          awayTeamScore: 4,
          homeTeam: {
            logo: 'hometeamlogo.png',
            name: 'Real Madrid',
          },
          awayTeam: {
            logo: 'awayteamlogo.png',
            name: 'Barcelona',
          },
          date: mockDate,
        },
        homeTeamScore: 2,
        awayTeamScore: 2,
        status: BetStatus.EVALUATED,
      },
      {
        game: {
          _id: '5f00000000000000000004',
          homeTeamScore: 0,
          awayTeamScore: 0,
          homeTeam: {
            logo: 'hometeamlogo.png',
            name: 'Real Madrid',
          },
          awayTeam: {
            logo: 'awayteamlogo.png',
            name: 'Barcelona',
          },
          date: mockDate,
        },
        homeTeamScore: 0,
        awayTeamScore: 0,
        status: BetStatus.EVALUATED,
      },
    ],
  },
}
