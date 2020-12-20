<template>
  <v-app dark>
    <Navbar></Navbar>

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

    <v-footer color="secondary" light :absolute="!fixed" app>
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
import Navbar from '../components/Navbar.vue'
export default Vue.extend({
  components: { Alert, Navbar },
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
      // this.$router.push('/login')
    },
  },
})
</script>
