import colors from 'vuetify/es5/util/colors';

export default {
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'static',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    // titleTemplate: '%s - ' + process.env.npm_package_name,
    title: 'Tipovacka',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Online tipovacia súťaž pre futbalové fankluby',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // {
      //   rel: 'stylesheet',
      //   href: 'https://fonts.googleapis.com/css?family=Montserrat|Assistant&display=swap',
      // },
    ],
  },
  router: {
    middleware: ['auth', 'groupData'],
  },
  loading: {
    color: '#FBC02D',
    height: '5px',
    throttle: 200,
  },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [{ src: '~/plugins/showAlert.ts', mode: 'client' }],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/vuetify', '@nuxtjs/svg'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
  ],
  auth: {
    cookie: {
      options: {
        maxAge: 432000, // 5 days
      },
    },
    middleware: ['authenticatorMiddleware'],
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/',
    },
    strategies: {
      cookie: {
        user: {
          property: false,
        },
        token: {
          required: false,
          type: false,
        },
        endpoints: {
          login: {
            url: '/auth/login',
            method: 'post',
            withCredentials: true,
          },
          logout: {
            url: '/auth/logout',
            method: 'get',
          },
          user: {
            url: '/auth/user',
            method: 'get',
            withCredentials: true,
          },
        },
      },
    },
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.BASE_URL || 'http://localhost:3003/api',
    credentials: true,
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    defaultAssets: {
      font: {
        family: 'Noto Sans',
      },
    },
    theme: {
      options: {
        customProperties: true,
      },
      dark: false,
      themes: {
        light: {
          primary: '#00529F',
          secondary: '#FEBE10',
          accent: colors.grey.lighten5,
          info: colors.blue,
          warning: colors.orange,
          error: colors.red,
          success: colors.green,
        },
      },
    },
  },
  typescript: {
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}',
      },
    },
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    babel: {
      plugins: [
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      ],
    },
  },
};
