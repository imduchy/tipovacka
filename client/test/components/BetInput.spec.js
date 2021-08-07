import '@testing-library/jest-dom';
import { fireEvent, waitFor } from '@testing-library/vue';
import Vue from 'vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import BetInput from '../../components/BetInput';
import { renderWithVuetify } from '../setup';

test('score input form has default values', () => {
  const { getByLabelText } = renderWithVuetify(BetInput, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
    mocks: {
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  });
  const homeTeamInpt = getByLabelText(mockUpcomingGame.homeTeam.name + ' skóre');
  const awayTeamInpt = getByLabelText(mockUpcomingGame.awayTeam.name + ' skóre');

  expect(homeTeamInpt).toHaveDisplayValue('0');
  expect(awayTeamInpt).toHaveDisplayValue('0');
});

test('submit button is disabled for negative value inputs', async () => {
  const { getByLabelText, getByRole } = renderWithVuetify(BetInput, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
    mocks: {
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  });
  const homeTeamInpt = getByLabelText(mockUpcomingGame.homeTeam.name + ' skóre');
  const submitBtn = getByRole('button', { name: 'Odoslať tip' });

  expect(submitBtn).toBeEnabled();
  await fireEvent.update(homeTeamInpt, -1);

  await waitFor(() => {
    expect(submitBtn).toHaveClass('v-btn--disabled');
  });
});

test('submit button is disabled for non-number inputs', async () => {
  const { getByLabelText, getByRole } = renderWithVuetify(BetInput, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
    mocks: {
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  });
  const awayTeamInpt = getByLabelText(mockUpcomingGame.awayTeam.name + ' skóre');
  const submitBtn = getByRole('button', { name: 'Odoslať tip' });

  expect(submitBtn).toBeEnabled();
  await fireEvent.update(awayTeamInpt, 'a');

  await waitFor(() => {
    expect(submitBtn).toHaveClass('v-btn--disabled');
  });
});

test('submit button is enabled for valid number inputs', async () => {
  const { getByLabelText, getByRole } = renderWithVuetify(BetInput, {
    props: {
      upcomingGame: mockUpcomingGame,
    },
    mocks: {
      $nuxt: {
        $loading: {
          show: false,
        },
      },
    },
  });
  const homeTeamInpt = getByLabelText(mockUpcomingGame.homeTeam.name + ' skóre');
  const awayTeamInpt = getByLabelText(mockUpcomingGame.awayTeam.name + ' skóre');
  const submitBtn = getByRole('button', { name: 'Odoslať tip' });

  expect(submitBtn).toBeEnabled();
  await fireEvent.update(homeTeamInpt, '2');
  await fireEvent.update(awayTeamInpt, '1');
  await Vue.nextTick();

  expect(submitBtn).toBeEnabled();
});

test('submit button is disabled if game already started', () => {
  const { getByRole } = renderWithVuetify(BetInput, {
    props: {
      upcomingGame: { ...mockUpcomingGame, date: new Date('February 19, 2020 12:10:00') },
    },
  });
  const submitBtn = getByRole('button', { name: 'Odoslať tip' });

  expect(submitBtn).toBeDisabled();
});

describe('alreadyStarted', () => {
  it("returns true if current datetime is past game's datetime", () => {
    const localVue = createLocalVue();
    const wrapper = shallowMount(BetInput, {
      localVue,
      propsData: {
        upcomingGame: {
          ...mockUpcomingGame,
          date: new Date('February 19, 2020 12:10:00'),
        },
      },
    });

    expect(wrapper.vm.alreadyStarted).toBe(true);
  });

  it("returns false if current datetime is before game's datetime", () => {
    const localVue = createLocalVue();
    const wrapper = shallowMount(BetInput, {
      localVue,
      mocks: {
        $nuxt: {
          $loading: {
            show: false,
          },
        },
      },
      propsData: {
        upcomingGame: mockUpcomingGame,
      },
    });

    expect(wrapper.vm.alreadyStarted).toBe(false);
  });
});

const date = new Date('February 19, 2050 12:10:00');

const mockUpcomingGame = {
  _id: '5f00000000000000000000',
  date,
  homeTeamScore: 3,
  awayTeamScore: 0,
  homeTeam: { name: 'Real Madrid' },
  awayTeam: { name: 'Barcelona' },
};
