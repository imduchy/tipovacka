<template>
  <v-app dark>
    <v-row>
      <v-col cols="12">
        <div class="my-12 mx-4 text-center">
          <div class="status-code font-weight-bold">{{ error.statusCode }}</div>
          <div class="error-message">
            {{ getErrorMessage(error.statusCode) }}
          </div>
          <v-btn nuxt color="primary" x-large href="/">Domov</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  head() {
    const title: string = this.getErrorMessage(this.error.statusCode);
    return {
      title,
    };
  },
  methods: {
    getErrorMessage(statusCode: number): string {
      switch (statusCode) {
        case 401:
          return 'Nie si prihlásený';
        case 404:
          return 'Táto stránka neexistuje';
        default:
          return 'Vyskytla sa neočakávaná chyba';
      }
    },
  },
});
</script>

<style scoped>
.status-code {
  display: inline-block;
  font-size: 10rem;
}
.error-message {
  position: relative;
  bottom: 1.2em;
  font-size: 2rem;
}
</style>
