<template>
  <span>
    <!-- Navigation drawer -->
    <v-navigation-drawer v-model="sidebar" temporary app>
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <img src="/user-icon.png" />
          </v-list-item-avatar>

          <v-list-item-title>{{ $auth.user && $auth.user.username }} </v-list-item-title>
        </v-list-item>
        <v-list-item v-for="item in items" :key="item.title" :to="item.to">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Odhlásiť</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <!-- Navigation drawer -->
    <!-- App bar -->
    <v-app-bar app color="primary">
      <v-toolbar-title>
        <router-link
          v-slot="{ navigate }"
          class="font-weight-bold"
          to="/"
          custom
          style="cursor: pointer"
        >
          <span role="link" @click="navigate" @keypress.enter="navigate">
            {{ title }}
          </span>
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="$auth.loggedIn">
        <span class="hidden-sm-and-down">
          <v-btn
            v-for="item in items"
            :key="item.title"
            large
            class="mr-2"
            icon
            :to="item.to"
          >
            <v-icon>{{ item.icon }}</v-icon>
          </v-btn>
          <!-- Additional menu -->
          <v-menu bottom offset-y>
            <template #activator="{ on, attrs }">
              <v-avatar v-bind="attrs" color="accent" size="38" class="mr-3" v-on="on">
                <img alt="Avatar" src="/user-icon.png" />
              </v-avatar>
            </template>

            <v-list dense color="grey darken-3" width="200px">
              <v-list-item-group>
                <v-list-item to="password">
                  <v-list-item-icon>
                    <v-icon>mdi-lock</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Zmeniť heslo</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="logout">
                  <v-list-item-icon>
                    <v-icon>mdi-logout</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Odhlásiť</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-menu>
          <!-- Additional menu -->
        </span>
        <span class="hidden-md-and-up">
          <v-app-bar-nav-icon
            v-if="$auth.loggedIn"
            @click="sidebar = !sidebar"
          ></v-app-bar-nav-icon>
        </span>
      </template>
    </v-app-bar>
    <!-- App bar -->
  </span>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data: () => ({
    items: [
      {
        icon: 'mdi-home',
        title: 'Domov',
        to: '/',
      },
      {
        icon: 'mdi-trophy',
        title: 'Tabuľka',
        to: '/table',
      },
    ],
    title: 'Tipovačka',
    sidebar: false,
  }),
  methods: {
    async logout() {
      await this.$auth.logout();
    },
  },
});
</script>
