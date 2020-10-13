<template>
  <v-form>
    <v-text-field v-model="login.username" label="Name" required></v-text-field>
    <v-text-field
      v-model="login.password"
      label="Password"
      required
    ></v-text-field>

    <v-btn color="success" class="mr-4" @click="userLogin"> Login </v-btn>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      login: {
        username: '',
        password: '',
      },
    }
  },
  methods: {
    async userLogin() {
      try {
        await this.$auth.loginWith('local', {
          data: {
            username: this.login.username,
            password: this.login.password,
          },
        })
        this.$showAlert('Successfully logged-in', 'success darken-2')
      } catch (err) {
        console.log(err)
      }
    },
  },
})
</script>
