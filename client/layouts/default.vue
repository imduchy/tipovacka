<template>
  <v-app dark>
    <navbar></navbar>
    <v-main>
      <v-container>
        <v-row column justify-center align-text>
          <v-col class="xs12 sm8 md6">
            <alert></alert>
          </v-col>
        </v-row>
        <nuxt keep-alive />
      </v-container>
    </v-main>

    <v-footer color="secondary" absolute light app>
      <span class="text-caption"
        >&copy; {{ new Date().getFullYear() }}
        Vytvoril
        <a href="https://www.linkedin.com/in/jakubduchon9/" target="_blank"
          >Jakub Duchon.</a
        ></span
      >
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data: () => ({
    systemBar: true,
    systemBar2: true,
  }),
});
</script>
