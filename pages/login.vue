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

<script>
export default {
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
        const response = await this.$auth.loginWith('local', {
          data: this.login,
        })
        console.log(response)
      } catch (err) {
        console.log(err)
      }
    },
  },
}
</script>
