<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" fixed app>
      <v-list>
        <v-list-item v-if="$auth.loggedIn">
          {{ $auth.user.username }}
          <v-btn color="primary" @click="userLogout">Logout</v-btn>
        </v-list-item>
        <v-list-item v-else>Guest</v-list-item>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row column justify-center align-text>
          <v-col class="xs12 sm8 md6">
            <Alert></Alert>
          </v-col>
        </v-row>
        <nuxt />
      </v-container>
    </v-main>

    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Alert from '../components/Alert.vue'
export default Vue.extend({
  components: { Alert },
  data() {
    return {
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Domov',
          to: '/',
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Tabuľka',
          to: '/inspire',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Tipovačka',
    }
  },
  methods: {
    async userLogout() {
      await this.$auth.logout()
      this.$showAlert('Successfully logged out', 'info')
      this.$router.push('/login')
    },
  },
})
</script>
