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
import { IUser } from '@duchynko/tipovacka-models';
import Vue from 'vue';
export default Vue.extend({
  computed: {
    users() {
      const users = this.$store.state.users as IUser[];
      return users.map((u) => ({
        username: u.username,
        points: u.competitionScore![0].score || 0,
        bets: u.bets?.length || 0,
      }));
    },
  },
});
</script>
