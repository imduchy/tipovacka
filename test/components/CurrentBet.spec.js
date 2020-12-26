import CurrentBet from '../../components/CurrentBet'
import { renderWithVuetify } from '../setup'
import '@testing-library/jest-dom'

test('input fields display scores from a bet', () => {
  const { getByLabelText } = renderWithVuetify(CurrentBet, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
    mocks: {
      $auth: mockAuth,
    },
  })
  const homeTeamInpt = getByLabelText(mockUpcomingGame.homeTeam.name + ' skóre')
  const awayTeamInpt = getByLabelText(mockUpcomingGame.awayTeam.name + ' skóre')

  expect(homeTeamInpt).toHaveDisplayValue('2')
  expect(awayTeamInpt).toHaveDisplayValue('1')
})

test('input fields should be disabled', () => {
  const { getByLabelText } = renderWithVuetify(CurrentBet, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
    mocks: {
      $auth: mockAuth,
    },
  })
  const homeTeamInpt = getByLabelText(mockUpcomingGame.homeTeam.name + ' skóre')
  const awayTeamInpt = getByLabelText(mockUpcomingGame.awayTeam.name + ' skóre')

  expect(homeTeamInpt).toBeDisabled()
  expect(awayTeamInpt).toBeDisabled()
})

const date = new Date('February 19, 2050 12:10:00')

const mockUpcomingGame = {
  _id: '5f00000000000000000000',
  date,
  homeTeamScore: 3,
  awayTeamScore: 0,
  homeTeam: { name: 'Real Madrid' },
  awayTeam: { name: 'Barcelona' },
}

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
