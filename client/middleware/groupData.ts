import { Middleware, Context } from '@nuxt/types'

const groupDataMiddleware: Middleware = async ({ $auth, store }: Context) => {
  if ($auth.loggedIn) {
    await store.dispatch('fetchGroupData', $auth.user.groupId)
  }
}

export default groupDataMiddleware
