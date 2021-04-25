import { IGroup, IUser } from '@duchynko/tipovacka-models';
import { GetterTree, ActionTree, MutationTree } from 'vuex';

export const state = () => ({
  group: {} as IGroup,
  users: [] as IUser[],
  alert: {
    color: '',
    message: '',
  },
});

export type RootState = ReturnType<typeof state>;

export const getters: GetterTree<RootState, RootState> = {
  upcomingGame: (state) => state.group.upcomingGame,
};

export const mutations: MutationTree<RootState> = {
  SET_GROUP: (state, group) => (state.group = group),
  SET_USERS: (state, users) => (state.users = users),
  SHOW_ALERT: (state, payload) => (state.alert = payload),
};

export const actions: ActionTree<RootState, RootState> = {
  async fetchGroupData({ commit }, groupId: string) {
    const group: IGroup = await this.$axios.$get('/groups/' + groupId);
    const users: IUser[] = await this.$axios.$get('/groups/' + groupId + '/users');
    commit('SET_GROUP', group);
    commit('SET_USERS', users);
  },
  showAlert({ commit }, payload: { color: string; text: string }) {
    commit('SHOW_ALERT', payload);
  },
};
