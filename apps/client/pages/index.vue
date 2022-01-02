<template>
  <v-row :class="{ 'align-self-center': !upcomingGame }">
    <!-- Loading bar  -->
    <loading-bar v-if="!upcomingGame" />
    <!-- Main view -->
    <v-col v-else cols="12" class="align-self-start" align-self="start" justify-self="start">
      <!-- Upcoming game -->
      <upcoming-game :upcoming-game="upcomingGame"></upcoming-game>

      <v-row class="mb-5">
        <v-col cols="12" class="pt-0 pb-0">
          <v-card class="pt-8 px-8">
            <!-- Input field / Current bet -->
            <bet-input
              v-if="!alreadyBet"
              :upcoming-game="upcomingGame"
              :players="players"
            ></bet-input>
            <current-bet v-else :upcoming-game="upcomingGame" :players="players"></current-bet>
          </v-card>
        </v-col>
      </v-row>

      <!-- Last bets -->
      <div class="py-3 mt-3 text-h5">
        Posledné tipy

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-icon color="grey darken-2" medium v-bind="attrs" v-on="on">
              mdi-information-outline
            </v-icon>
          </template>
          <span>Tvoj tip je v zátvorkách vedľa výsledku zápasu</span>
        </v-tooltip>
      </div>

      <v-row class="mt-0">
        <v-col v-if="evaluatedBets[0]" cols="12" lg="4">
          <user-bet :bet="evaluatedBets[0]" :players="players"></user-bet>
        </v-col>
        <v-col v-if="evaluatedBets[1]" cols="12" lg="4">
          <user-bet :bet="evaluatedBets[1]" :players="players"></user-bet>
        </v-col>
        <v-col v-if="evaluatedBets[2]" cols="12" lg="4">
          <user-bet :bet="evaluatedBets[2]" :players="players"></user-bet>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { BetStatus, IBet, ICompetition, IGame, IPlayer } from '@tipovacka/models';

export default Vue.extend({
  data() {
    return {
      homeTeamScore: 0,
      awayTeamScore: 0,
      competition: {} as ICompetition,
      followedTeam: this.$store.state.group.followedTeams[0],
    };
  },
  // @ts-ignore
  async fetch() {
    this.competition = await this.$axios.$get('/groups/competition', {
      params: {
        group: this.$store.state.group._id,
        team: this.followedTeam.apiId,
        season: this.upcomingGame.season,
        competition: this.upcomingGame.competitionId,
      },
    });
  },
  computed: {
    ...mapGetters({
      upcomingGame: 'upcomingGame',
    }),
    players(): IPlayer[] {
      return this.competition.players
        ? (this.competition.players as IPlayer[])
            .filter((p) => p.statistics.games.position !== 'Goalkeeper')
            .sort((a, b) => (b.statistics.goals.total || 0) - (a.statistics.goals.total || 0))
        : [];
    },
    alreadyStarted(): boolean {
      return new Date().getTime() > new Date(this.upcomingGame.date).getTime();
    },
    usersBets(): IBet[] {
      return this.$auth.user.bets;
    },
    alreadyBet(): boolean {
      const upcomingGame = this.upcomingGame._id;
      if (this.usersBets !== undefined) {
        return this.usersBets.some(
          (bet: IBet) => (bet.game as IGame & { _id: string })._id === upcomingGame
        );
      }
      return false;
    },
    evaluatedBets(): IBet[] {
      const bets: IBet[] = this.$auth.user.bets;
      if (bets) {
        // TODO: Optimize to shortcut after finding first (last) 3 items
        return bets.filter((b) => b.status === BetStatus.EVALUATED).reverse();
      }
      return [];
    },
  },
  activated() {
    if (this.$fetchState.timestamp <= Date.now() - 30000) {
      this.$fetch();
    }
  },
});
</script>

<router>
{
    name: "Domov"
}
</router>
