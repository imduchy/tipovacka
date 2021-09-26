<template>
  <v-app dark>
    <navbar></navbar>
    <v-main>
      <v-container fill-height align-start justify-center>
        <alert id="alert"></alert>
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
