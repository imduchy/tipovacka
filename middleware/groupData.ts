import { Middleware, Context } from '@nuxt/types'

const groupDataMiddleware: Middleware = ({ $auth, store }: Context) => {
  if ($auth.loggedIn) {
    if (Object.keys(store.state.group).length === 0) {
      store.dispatch('fetchGroupData', $auth.user.groupId)
    }
  }
}

export default groupDataMiddleware
