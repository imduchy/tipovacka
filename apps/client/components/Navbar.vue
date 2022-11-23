<template>
  <span>
    <!-- Navigation drawer -->
    <v-navigation-drawer v-model="sidebar" dark color="black" temporary app>
      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <img src="/user-icon.png" />
          </v-list-item-avatar>

          <v-list-item-title>{{ $auth.user && $auth.user.username }} </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.to"
          active-class="active-btn"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
        <v-list-item v-if="isAdmin" to="admin">
          <v-list-item-icon>
            <v-icon>mdi-shield-account</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Admin</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="password">
          <v-list-item-icon>
            <v-icon>mdi-lock</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Zmeniť heslo</v-list-item-content>
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
    <v-app-bar dark app height="96" scroll-off-screen color="black">
      <v-container>
        <v-row align="center">
          <v-img src="logo-no-background.svg" max-height="120" max-width="120" contain></v-img>

          <v-spacer></v-spacer>

          <span v-if="$auth.loggedIn" class="hidden-sm-and-down">
            <v-btn
              v-for="item in items"
              :key="item.title"
              plain
              :ripple="false"
              text
              tile
              active-class="active-btn"
              class="mr-4 pl-1 pr-1 text-capitalize text-subtitle-1"
              :to="item.to"
            >
              {{ item.title }}
            </v-btn>
          </span>

          <v-spacer></v-spacer>

          <template v-if="$auth.loggedIn">
            <span class="hidden-sm-and-down">
              <!-- Additional menu -->
              <v-menu bottom offset-y>
                <template #activator="{ on, attrs }">
                  <v-avatar v-bind="attrs" color="accent" size="38" class="mr-3" v-on="on">
                    <img alt="Avatar" src="/user-icon.png" />
                  </v-avatar>
                </template>

                <v-list dense width="200px">
                  <v-list-item-group>
                    <v-list-item v-if="isAdmin" to="admin">
                      <v-list-item-icon>
                        <v-icon>mdi-shield-account</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>Admin</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
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
        </v-row>
      </v-container>
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
      {
        icon: 'mdi-seal-variant',
        title: 'Pravidlá',
        to: '/rules',
      },
    ],
    title: 'Tipovačka',
    sidebar: false,
  }),
  computed: {
    isAdmin() {
      return this.$auth.hasScope('admin');
    },
  },
  methods: {
    async logout() {
      await this.$auth.logout();
    },
  },
});
</script>

<style scoped>
.active-btn {
  color: var(--v-secondary-base);
  border-bottom: 2px solid var(--v-secondary-base);
  font-weight: bold;
}
</style>
