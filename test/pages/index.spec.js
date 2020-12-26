import '@testing-library/jest-dom'
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
    },
  })
  const homeTeamName = getByText(mockUpcomingGame().homeTeam.name)
  const awayTeamName = getByText(mockUpcomingGame().awayTeam.name)

  expect(homeTeamName).toBeVisible()
  expect(awayTeamName).toBeVisible()
})

test('shows loading bar when upcomingGame is undefined', () => {
  const { getByRole } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => undefined,
      },
    },
    mocks: {
      $auth: mockAuth,
    },
  })
  const progressBar = getByRole('progressbar')

  expect(progressBar).toBeVisible()
})

test('hides loading bar when upcomingGame is fetched', () => {
  const { queryByRole } = renderWithVuetify(IndexPage, {
    store: {
      getters: {
        upcomingGame: () => mockUpcomingGame(),
      },
    },
    mocks: {
      $auth: mockAuth,
    },
  })

  expect(queryByRole('progressbar')).toBe(null)
})

const date = new Date('February 19, 2050 12:10:00')

const mockUpcomingGame = () => ({
  _id: '5f00000000000000000000',
  date,
  homeTeamScore: 3,
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
        },
        homeTeamScore: 2,
        awayTeamScore: 1,
      },
      { game: { _id: '5f00000000000000000001' } },
      { game: { _id: '5f00000000000000000002' } },
      { game: { _id: '5f00000000000000000003' } },
      { game: { _id: '5f00000000000000000004' } },
    ],
  },
}
