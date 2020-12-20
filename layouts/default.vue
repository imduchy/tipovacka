<template>
  <v-app dark>
    <navbar></navbar>
    <v-main>
      <v-system-bar class="hidden-sm-and-down" color="warning" height="32">
        <v-spacer></v-spacer>
        <span class="black--text"
          >Na stránke sa pracuje. Ak máte pripomienky, návrhy, alebo nájdete chybu v
          stránke, kontaktujte ma na WhatsApp.</span
        >
        <v-spacer></v-spacer>
      </v-system-bar>
      <v-container>
        <v-row column justify-center align-text>
          <v-col class="xs12 sm8 md6">
            <alert></alert>
          </v-col>
        </v-row>
        <nuxt />
      </v-container>
    </v-main>

    <v-footer color="secondary" light app>
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
  data: () => ({}),
})
</script>
