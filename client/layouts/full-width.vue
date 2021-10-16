<template>
  <v-app>
    <navbar></navbar>

    <v-main>
      <v-container fluid fill-height pa-0>
        <alert id="alert"></alert>
        <nuxt keep-alive />
      </v-container>
    </v-main>
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
  width: 100%;
  top: 0px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 9999;
}
</style>
