<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="6" class="pa-12 text-center">
      <h4 class="text-h4 mb-5">Zmena hesla</h4>
      <p class="text-subtitle-1">
        Tu si môžete zmeniť svoje heslo. Po zmene hesla budete odhlásený.
      </p>
      <v-card color="secondary" class="pa-5" elevation="12">
        <v-form v-model="validPasswordInput">
          <v-text-field
            v-model="oldPassword"
            label="Staré heslo"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            light
            outlined
            required
            :rules="[inputRules.notEmpty]"
          ></v-text-field>

          <v-text-field
            v-model="newPassword"
            label="Nové heslo"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            light
            outlined
            required
            :rules="[inputRules.notEmpty]"
          ></v-text-field>

          <v-text-field
            v-model="confirmedPassword"
            label="Zopakujte nové heslo"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            light
            outlined
            required
            :rules="[passwordsMatch]"
          ></v-text-field>

          <!-- UPDATE THIS -->
          <v-btn
            color="warning"
            block
            light
            :disabled="!validPasswordInput"
            @click="changePassword"
          >
            Zmeniť heslo
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
      oldPassword: '',
      newPassword: '',
      confirmedPassword: '',
      inputRules: {
        notEmpty: (value: string) => value.length >= 8 || 'Zadajte minimálne 8 znakov',
      },
      validPasswordInput: false,
    }
  },
  computed: {
    passwordsMatch(): boolean | string {
      return this.newPassword === this.confirmedPassword || 'Heslá sa musia zhodovať'
    },
  },
  methods: {
    changePassword() {
      this.$axios
        .post('/auth/password', {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
          confirmedPassword: this.confirmedPassword,
        })
        .then(async (response) => {
          if (response.status === 200) {
            this.$showAlert('Heslo úspešne zmenené', 'success')
            await this.$auth.logout()
          }
        })
        .catch((err) => {
          if (err.response.data === 'Wrong password') {
            this.$showAlert('Nesprávne heslo', 'warning')
          } else {
            this.$showAlert('Niekde sa stala chyba. Skúste to prosím neskôr.', 'error')
          }
        })
    },
  },
})
</script>
