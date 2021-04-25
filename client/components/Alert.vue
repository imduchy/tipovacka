<template>
  <v-alert
    id="alert"
    v-model="show"
    transition="fade-transition"
    dismissible
    :color="color"
    >{{ message }}</v-alert
  >
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      show: false,
      message: '',
      color: '',
    };
  },

  created() {
    this.$store.subscribe(async (mutation, state) => {
      if (mutation.type === 'SHOW_ALERT') {
        this.message = state.alert.message;
        this.color = state.alert.color;
        this.show = true;
        await setTimeout(() => {
          this.show = false;
        }, 3000);
      }
    });
  },
});
</script>

<style>
#alert {
  position: absolute;
  width: 50%;
  top: 5;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 9999;
}
</style>
