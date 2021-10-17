<template>
  <v-app dark>
    <v-row>
      <v-col cols="12">
        <div class="my-12 mx-4 text-center">
          <div class="status-code font-weight-bold">{{ error.statusCode }}</div>
          <div class="error-message">
            {{ error.statusCode === 404 ? pageNotFound : otherError }}
          </div>
          <v-btn nuxt color="secondary" x-large href="/">Domov</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-app>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: 'Táto stránka neexistuje',
      otherError: 'Vyskytla sa neočakávaná chyba',
    };
  },
  head() {
    const title = this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title,
    };
  },
};
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
