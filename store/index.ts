import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { IGroup } from '~/models/Group'
import { IUser } from '~/models/User'

export const state = () => ({
  group: {} as IGroup,
  user: {} as IUser,
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  upcommingGame: (state) => state.group.upcommingGame,
}

export const mutations: MutationTree<RootState> = {
  SET_GROUP: (state, group) => (state.group = group),
  SET_USER: (state, user) => (state.user = user),
}

export const actions: ActionTree<RootState, RootState> = {
  async fetchGroup({ commit }, groupId: string) {
    const group: IGroup = await this.$axios.$get(
      'http://localhost:3000/api/groups/' + groupId
    )
    commit('SET_GROUP', group)
  },
  async fetchUser({ commit }, email: string) {
    const user: IUser = await this.$axios.$get(
      'http://localhost:3000/api/users/' + email
    )
    commit('SET_USER', user)
  },
}
