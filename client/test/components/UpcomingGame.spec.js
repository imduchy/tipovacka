import UpcomingGame from '../../components/UpcomingGame'
import { renderWithVuetify } from '../setup'
import '@testing-library/jest-dom'

test('displays teams names', () => {
  const { getByText } = renderWithVuetify(UpcomingGame, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
  })
  const homeTeamName = getByText(mockUpcomingGame.homeTeam.name)
  const awayTeamName = getByText(mockUpcomingGame.awayTeam.name)

  expect(homeTeamName).toBeVisible()
  expect(awayTeamName).toBeVisible()
})

test('displays formated date', () => {
  const { getByText } = renderWithVuetify(UpcomingGame, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
  })
  const dateField = getByText('February 19')

  expect(dateField).toBeVisible()
})

test('displays formated date', () => {
  const { getByText } = renderWithVuetify(UpcomingGame, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
  })
  const date = mockUpcomingGame.date.toLocaleTimeString('sk-SK', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const timeField = getByText(date)

  expect(timeField).toBeVisible()
})

test('displays venue name', () => {
  const { getByText } = renderWithVuetify(UpcomingGame, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
  })
  const venueNameField = getByText(mockUpcomingGame.venue)

  expect(venueNameField).toBeVisible()
})

const date = new Date('February 19, 2050 12:10:00')

const mockUpcomingGame = {
  _id: '5f00000000000000000000',
  date,
  homeTeamScore: 3,
  awayTeamScore: 0,
  homeTeam: { name: 'Real Madrid', logo: 'hometeam.logo' },
  awayTeam: { name: 'Barcelona', logo: 'awayteam.logo' },
  venue: 'Santiago Bernabéu Stadium',
}
