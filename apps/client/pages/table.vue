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
          { text: 'Poradie', value: 'rank' },
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
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { IUser } from '@tipovacka/models';
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
      return this.rawUsers
        .map((u) => ({
          username: u.username,
          points: u.competitionScore![0].score || 0,
          bets: u.bets?.length || 0,
          rank: '0',
        }))
        .sort((a, b) => b.points - a.points)
        .map((user, index) => {
          if (index === 0) {
            user.rank = '🥇';
          } else if (index === 1) {
            user.rank = '🥈';
          } else if (index === 2) {
            user.rank = '🥉';
          } else {
            user.rank = index + 1 + '';
          }

          return user;
        });
    },
  },
});
</script>

<style>
.custom-header div table thead {
  background-color: #f5f5f5;
}
</style>

<router>
{
    name: "Tabuľka"
}
</router>
