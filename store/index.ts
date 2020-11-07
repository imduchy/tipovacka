import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { IGroup } from '~/models/Group'

export const state = () => ({
  group: {} as IGroup,
  alert: {
    color: '',
    message: '',
  },
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  upcommingGame: (state) => state.group.upcommingGame,
}

export const mutations: MutationTree<RootState> = {
  SET_GROUP: (state, group) => (state.group = group),
  SHOW_ALERT: (state, payload) => (state.alert = payload),
}

export const actions: ActionTree<RootState, RootState> = {
  async fetchGroup({ commit }, groupId: string) {
    const group: IGroup = await this.$axios.$get('/groups/' + groupId)
    commit('SET_GROUP', group)
  },
  showAlert({ commit }, payload: { color: string; text: string }) {
    commit('SHOW_ALERT', payload)
  },
}
