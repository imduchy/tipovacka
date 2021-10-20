<template>
  <v-row :class="{ 'align-self-center': $fetchState.pending }">
    <v-col v-if="$fetchState.pending" class="text-center" cols="12">
      <v-progress-circular
        :size="70"
        :width="7"
        color="secondary"
        indeterminate
      ></v-progress-circular>
      <div class="text-overline ma-3">Načítam dáta...</div>
    </v-col>
    <v-col v-else cols="12">
      <v-data-table
        :headers="[
          { text: '#' },
          { text: 'Meno', value: 'username' },
          { text: 'Body', value: 'points' },
          { text: 'Tipy', value: 'bets' },
        ]"
        :items="users"
        :sort-by="['points']"
        :sort-desc="[true]"
        :items-per-page="30"
        mobile-breakpoint="0"
        class="elevation-1 custom-header"
        :footer-props="{
          itemsPerPageOptions: [10, 20, 30, -1],
          itemsPerPageAllText: 'Všetky',
          itemsPerPageText: 'Riadky na stranu',
        }"
      >
        <template #item="{ item, index }">
          <tr>
            <td>{{ (rankIcon(index) ? rankIcon(index) + ' ' : '') + (index + 1) }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.points }}</td>
            <td>{{ item.bets }}</td>
          </tr>
        </template>
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
  methods: {
    rankIcon(rank: number) {
      if (rank === 0) {
        return '🥇';
      } else if (rank === 1) {
        return '🥈';
      } else if (rank === 2) {
        return '🥉';
      }
    },
  },
});
</script>

<style>
.custom-header div table thead {
  background-color: #f5f5f5;
}
</style>
