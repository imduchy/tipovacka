import '@testing-library/jest-dom';
import UserBet from '../../components/UserBet';
import { renderWithVuetify } from '../setup';

test('displays game score', () => {
  const { getByText } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  const text = mockBet.game.homeTeamScore + ' : ' + mockBet.game.awayTeamScore;

  expect(getByText(text)).toBeInTheDocument();
});

test('displays score bet on the home team', () => {
  const { getByText } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  expect(getByText(`(${mockBet.homeTeamScore})`)).toBeInTheDocument();
});

test('displays score bet on the away team', () => {
  const { getByText } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  expect(getByText(`(${mockBet.awayTeamScore})`)).toBeInTheDocument();
});

test('displays home team logo', () => {
  const { getByRole } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  expect(getByRole('img', { name: 'home team logo' })).toBeInTheDocument();
});

test('displays away team logo', () => {
  const { getByRole } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  expect(getByRole('img', { name: 'away team logo' })).toBeInTheDocument();
});

test('displays correct date', () => {
  const { getByText } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  expect(getByText('February 19')).toBeInTheDocument();
});

test('displays correct time', () => {
  const { getByText } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  const date = mockBet.game.date.toLocaleTimeString('sk-SK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  expect(getByText(date)).toBeInTheDocument();
});

test('displays correct color of progress bar for correct bets', () => {
  const { getByRole } = renderWithVuetify(UserBet, {
    props: {
      bet: mockBet,
    },
  });

  expect(getByRole('progressbar').firstElementChild).toHaveClass('info');
});

test('displays correct color of progress bar for exact score', () => {
  const { getByRole } = renderWithVuetify(UserBet, {
    props: {
      bet: { ...mockBet, homeTeamScore: 3, awayTeamScore: 4 },
    },
  });

  expect(getByRole('progressbar').firstElementChild).toHaveClass('success');
});

test('displays correct color of progress bar for incorrect bets', () => {
  const { getByRole } = renderWithVuetify(UserBet, {
    props: {
      bet: { ...mockBet, homeTeamScore: 2, awayTeamScore: 1 },
    },
  });

  expect(getByRole('progressbar').firstElementChild).toHaveClass('error');
});

const date = new Date('February 19, 1998 12:10:00');

const mockBet = {
  homeTeamScore: 1,
  awayTeamScore: 2,
  game: {
    homeTeamScore: 3,
    awayTeamScore: 4,
    homeTeam: {
      logo: 'https://media.api-sports.io/football/teams/541.png',
    },
    awayTeam: {
      logo: 'https://media.api-sports.io/football/teams/715.png',
    },
    date,
  },
};
