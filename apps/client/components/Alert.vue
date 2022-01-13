<template>
  <v-alert v-model="show" dark transition="fade-transition" dismissible :color="color"
    ><strong>{{ message }}</strong></v-alert
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
        }, 5000);
      }
    });
  },
});
</script>
