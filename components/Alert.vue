<template>
  <v-alert v-model="show" dismissible :color="color">{{ message }}</v-alert>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      show: false,
      message: '',
      color: '',
    }
  },

  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'SHOW_ALERT') {
        this.message = state.alert.message
        this.color = state.alert.color
        this.show = true
      }
    })
  },
})
</script>
