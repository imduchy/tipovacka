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
        class="elevation-1"
        :footer-props="{
          itemsPerPageOptions: [10, 20, 30, -1],
          itemsPerPageAllText: 'Všetky',
          itemsPerPageText: 'Riadky na stranu',
        }"
      >
      </v-data-table>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { IUser } from '@duchynko/tipovacka-models';
import Vue from 'vue';
export default Vue.extend({
  data: () => ({
    rawUsers: [] as IUser[],
  }),
  async fetch() {
    this.rawUsers = await this.$axios.$get('/groups/users', {
      params: { group: this.$store.state.group._id },
    });
  },
  computed: {
    users() {
      return this.rawUsers.map((u) => ({
        username: u.username,
        points: u.competitionScore![0].score || 0,
        bets: u.bets?.length || 0,
      }));
    },
  },
});
</script>
