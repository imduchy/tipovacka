<template>
  <v-row>
    <!-- Main view -->
    <v-col cols="10" align-self="start" justify-self="start">
      <!-- Upcoming game -->
      <v-row class="mb-4">
        <v-col cols="12">
          <upcoming-game :upcoming-game="upcomingGame"></upcoming-game>
        </v-col>
      </v-row>

      <v-row class="mb-5">
        <v-col cols="12">
          <bet-input
            v-if="upcomingGame"
            :upcoming-game="upcomingGame"
            :players="players"
            :current-users-bet="currentUsersBet"
          ></bet-input>
        </v-col>
      </v-row>

      <!-- Last bets -->
      <v-row>
        <v-col cols="12">
          <div class="text-h5">
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
        </v-col>
      </v-row>

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

      <!-- Best bets -->
      <v-row v-if="bestBets.length > 0">
        <v-col cols="12">
          <div class="text-h5">
            Najlepšie tipy kola

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-icon color="grey darken-2" medium v-bind="attrs" v-on="on">
                  mdi-information-outline
                </v-icon>
              </template>
              <span>Užívateľov tip je v zátvorkách vedľa výsledku zápasu</span>
            </v-tooltip>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="bestBets.length > 0" class="mt-0">
        <v-col v-if="bestBets[0]" cols="12" lg="4">
          <bet-result :user="bestBets[0]" :players="players"></bet-result>
        </v-col>
        <v-col v-if="bestBets[1]" cols="12" lg="4">
          <bet-result :user="bestBets[1]" :players="players"></bet-result>
        </v-col>
        <v-col v-if="bestBets[2]" cols="12" lg="4">
          <bet-result :user="bestBets[2]" :players="players"></bet-result>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="2"></v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { BetStatus, IBet, ICompetition, IGame, IPlayer, IUser } from '@tipovacka/models';

export default Vue.extend({
  data() {
    return {
      homeTeamScore: 0,
      awayTeamScore: 0,
      competition: {} as ICompetition,
      bestBets: [] as IBet[],
      user: this.$auth.user,
    };
  },
  // @ts-ignore
  async fetch() {
    this.competition = await this.$axios.$get('/groups/competition', {
      params: {
        group: this.$store.state.group._id,
        team: this.followedTeam.apiId,
        season: this.latestSeason,
      },
    });

    this.bestBets = await this.$axios.$get('/bets/top', {
      params: {
        team: this.followedTeam.apiId,
        season: this.latestSeason,
        // If there's no upcomingGame, get the last game.
        // Othewrise, get the second last game
        round: this.upcomingGame ? -2 : -1,
      },
    });
  },
  computed: {
    ...mapGetters({
      upcomingGame: 'upcomingGame',
      followedTeam: 'followedTeam',
      latestSeason: 'latestSeason',
    }),
    players(): IPlayer[] {
      if (!this.competition || !this.competition.players) {
        return [];
      }
      return [...this.competition.players].sort(
        (a, b) => (b.statistics.goals.total || 0) - (a.statistics.goals.total || 0)
      );
    },
    alreadyStarted(): boolean {
      if (!this.upcomingGame) {
        return false;
      }

      return new Date().getTime() > new Date(this.upcomingGame.date).getTime();
    },
    evaluatedBets(): IBet[] {
      const bets: IBet[] = this.$auth.user.bets;
      if (bets) {
        return bets.filter((b) => b.status === BetStatus.EVALUATED).reverse();
      }
      return [];
    },
    currentUsersBet(): (IBet & { _id: string }) | undefined {
      if (!this.upcomingGame) {
        return undefined;
      }

      const upcomingGame = this.upcomingGame._id;
      const user = this.$auth.user as IUser;
      const bets = user.bets as (IBet & { _id: string })[];

      return bets.find((bet) => (bet.game as IGame & { _id: string })._id === upcomingGame);
    },
  },
  activated() {
    if (this.$fetchState.timestamp <= Date.now() - 30000) {
      this.$fetch();
    }
  },
});
</script>
