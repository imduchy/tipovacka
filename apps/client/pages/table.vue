<template>
  <v-row :class="{ 'align-self-center': $fetchState.pending }">
    <loading-bar v-if="$fetchState.pending" />
    <v-col v-else cols="12">
      <v-data-table
        dark
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
import { IUser } from '@tipovacka/models';
import Vue from 'vue';
export default Vue.extend({
  data: () => ({
    rawUsers: [] as IUser[],
  }),
  // @ts-ignore
  async fetch() {
    this.rawUsers = await this.$axios.$get('/groups/users', {
      params: { group: this.$store.state.group._id, season: 2023 },
    });
  },
  computed: {
    users() {
      return this.rawUsers
        .map((u) => ({
          username: u.username,
          points: u.competitionScore![u.competitionScore.length - 1].score || 0,
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
