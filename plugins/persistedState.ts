import createPersistedState from 'vuex-persistedstate'
import { Plugin } from '@nuxt/types'
import * as Cookies from 'js-cookie'
import cookie from 'cookie'

const persistedStatePlugin: Plugin = ({ store, req }) => {
  createPersistedState({
    paths: ['users', 'group'],
    storage: {
      getItem: (key) => {
        if (process.server) {
          if (req.headers.cookie) {
            const parsedCookies = cookie.parse(req.headers.cookie)
            return parsedCookies[key]
          }
        } else {
          return Cookies.get(key)
        }
      },
      // Please see https://github.com/js-cookie/js-cookie#json, on how to handle JSON.
      setItem: (key, value) => {
        Cookies.set(key, value, { expires: 30, secure: false })
      },
      removeItem: (key) => Cookies.remove(key),
    },
  })(store)
}

export default persistedStatePlugin
