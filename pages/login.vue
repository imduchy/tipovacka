<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="6" class="pa-12 text-center">
      <h4 class="text-h4 mb-5">Vítajte na Tipovačke</h4>
      <p class="text-subtitle-1">
        Prihlasovacia stránka pre členov fanklubu Halamadrid.sk
      </p>
      <v-card color="secondary pa-5" elevation="12">
        <v-form>
          <v-text-field
            v-model="login.username"
            label="Prihlasovacie meno"
            prepend-inner-icon="mdi-account-outline"
            light
            outlined
            required
          ></v-text-field>
          <v-text-field
            v-model="login.password"
            label="Heslo"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            light
            outlined
            required
          ></v-text-field>

          <v-btn color="accent" block class="text-black" @click="userLogin">
            Prihlásiť sa
          </v-btn>
        </v-form>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" class="text-center">
      <v-img src="/halamadrid-logo.png" class="mx-auto mb-3" width="300px"></v-img>
    </v-col>
  </v-row>
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
        // this.$auth.$storage.setUniversal('redirect', '/')
        await this.$auth.loginWith('local', {
          data: {
            username: this.login.username,
            password: this.login.password,
          },
        })
      } catch (err) {
        this.$showAlert('Wrong credentials', 'error')
        console.log(err)
      }
    },
  },
})
</script>
