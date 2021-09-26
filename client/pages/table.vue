<template>
  <v-row :class="{ 'align-self-center': $fetchState.pending }">
    <v-col v-if="$fetchState.pending" class="text-center" cols="12">
      <v-progress-circular
        :size="70"
        :width="7"
        color="accent"
        indeterminate
      ></v-progress-circular>
      <div class="text-overline ma-3">Načítam dáta...</div>
    </v-col>
    <v-col v-else cols="12">
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
