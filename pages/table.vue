<template>
  <v-row>
    <v-col cols="12">
      <v-data-table
        :headers="[
          { text: 'Meno', value: 'username' },
          { text: 'Body', value: 'points' },
          { text: '# tipov', value: 'bets' },
        ]"
        :items="users"
        :sort-by="['points']"
        :sort-desc="[true]"
        :items-per-page="30"
        mobile-breakpoint="0"
        hide-default-footer
        class="elevation-1"
      >
      </v-data-table>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import Vue from 'vue'
import { IUser } from '~/models/User'
export default Vue.extend({
  computed: {
    users() {
      const users = this.$store.state.users as IUser[]
      return users.map((u) => ({
        username: u.username,
        points: u.totalScore![0].score,
        bets: u.bets?.length || 0,
      }))
    },
  },
})
</script>
