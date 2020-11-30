import { Plugin } from '@nuxt/types'

declare module 'vue/types/vue' {
  // this.$showAlert inside Vue components
  interface Vue {
    $showAlert(message: string, color: string): void
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$showAlert inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $showAlert(message: string, color: string): void
  }
  // nuxtContext.$showAlert
  interface Context {
    $showAlert(message: string, color: string): void
  }
}

declare module 'vuex/types/index' {
  // this.$showAlert inside Vuex stores
  interface Store<S> {
    $showAlert(message: string, color: string): void
  }
}

const showAlertPlugin: Plugin = (context, inject) => {
  inject('showAlert', (message: string, color: string) =>
    context.store.dispatch('showAlert', { message, color })
  )
}

export default showAlertPlugin
