<template>
  <v-app>
    <navbar></navbar>
    <v-main>
      <!-- <v-system-bar height="30" color="warning">
        <v-spacer></v-spacer>
        <span class="font-weight-bold">
          Momentálne nie je možné vidieť mená strelcov vo vašich tipoch. Pracujeme na
          odstránení tejto chyby.
        </span>
        <v-spacer></v-spacer>
      </v-system-bar> -->
      <v-container fill-height align-start justify-center>
        <alert id="alert"></alert>
        <nuxt keep-alive />
      </v-container>
    </v-main>

    <v-footer color="accent" absolute light app>
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
  data: () => ({}),
});
</script>

<style scoped>
#alert {
  position: absolute;
  width: 70%;
  top: 10px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 9999;
}
</style>
