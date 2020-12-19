<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" bottom fixed app>
      <template v-if="$auth.loggedIn" v-slot:prepend>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <img src="/user-icon.png" />
          </v-list-item-avatar>

          <v-list-item-title>{{ $auth.user.username }} </v-list-item-title>
        </v-list-item>
      </template>
      <template v-else v-slot:prepend>
        <v-list-item two-line>
          <v-list-item-avatar>
            <img src="/user-icon.png" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>Guest</v-list-item-title>
            <!-- <v-list-item-subtitle>Logged In</v-list-item-subtitle> -->
          </v-list-item-content>
        </v-list-item>
      </template>
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-if="$auth.loggedIn" v-slot:append>
        <v-list-item @click="userLogout">
          <v-list-item-action>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
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
      <span class="text-caption"
        >&copy; {{ new Date().getFullYear() }}
        <a href="https://www.linkedin.com/in/jakubduchon9/" target="_blank"
          >Jakub Duchon.</a
        >
        All rights reserved.</span
      >
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
      fixed: true,
      items: [
        {
          icon: 'mdi-home',
          title: 'Domov',
          to: '/',
        },
        {
          icon: 'mdi-seal',
          title: 'Tabuľka',
          to: '/table',
        },
      ],
      title: 'Tipovačka',
    }
  },
  methods: {
    async userLogout() {
      await this.$auth.logout()
      this.$showAlert('Successfully logged out', 'info')
      // this.$router.push('/login')
    },
  },
})
</script>
