<template>
  <div>
    <v-row>
      <!-- Main view -->
      <v-col cols="12" lg="9" align-self="start" justify-self="start">
        <!-- Upcoming game -->
        <v-row>
          <v-col cols="12">
            <upcoming-game :upcoming-game="upcomingGame"></upcoming-game>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <bet-input
              v-if="upcomingGame"
              :upcoming-game="upcomingGame"
              :competition="competition"
              :players="players"
              :current-users-bet="currentUsersBet"
            ></bet-input>
          </v-col>
        </v-row>
      </v-col>

      <!-- Side panel -->
      <v-col cols="12" lg="3" align-self="start" justify-self="start">
        <v-card raised class="pa-4" rounded="lg" color="card">
          <v-row>
            <v-col cols="12">
              <span class="white--text text-subtitle-1 font-weight-bold"> Posledné zápasy </span>
            </v-col>
            <v-col v-if="bestBets[0]" cols="12">
              <game-result-card :game="bestBets[0].bets[lastGamePage].game"></game-result-card>
              <v-pagination
                v-model="lastGamePage"
                class="mt-2"
                dark
                disabled
                :length="bestBets[0].bets.length"
              ></v-pagination>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" align="center">
              <hr />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <span class="white--text text-subtitle-1 font-weight-bold">
                Najlepšie tipy kola
              </span>
            </v-col>
            <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4" lg="12">
              <bet-result-card
                v-if="bestBets[n]"
                :bet="bestBets[n].bets[0]"
                :players="players"
                :user="bestBets[n].username"
                :display-date="false"
              ></bet-result-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Last bets -->
    <v-row>
      <v-col cols="12">
        <v-card raised class="pa-4" rounded="lg" color="card">
          <v-row no-gutters>
            <v-col cols="12">
              <span class="white--text text-subtitle-1 font-weight-bold">
                Tvoje posledné tipy

                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon color="grey darken-2" medium v-bind="attrs" v-on="on">
                      mdi-information-outline
                    </v-icon>
                  </template>
                  <span>Tvoj tip je v zátvorkách vedľa výsledku zápasu</span>
                </v-tooltip>
              </span>
            </v-col>
          </v-row>

          <v-row>
            <v-col v-if="evaluatedBets[0]" cols="12" sm="6" md="4" lg="3">
              <bet-result-card
                :bet="evaluatedBets[0]"
                :players="players"
                :user="$auth.user.username"
              ></bet-result-card>
            </v-col>
            <v-col v-if="evaluatedBets[1]" cols="12" sm="6" md="4" lg="3">
              <bet-result-card
                :bet="evaluatedBets[1]"
                :players="players"
                :user="$auth.user.username"
              ></bet-result-card>
            </v-col>
            <v-col v-if="evaluatedBets[2]" cols="12" sm="6" md="4" lg="3">
              <bet-result-card
                :bet="evaluatedBets[2]"
                :players="players"
                :user="$auth.user.username"
              ></bet-result-card>
            </v-col>
            <v-col v-if="evaluatedBets[3]" cols="12" sm="6" md="4" lg="3">
              <bet-result-card
                :bet="evaluatedBets[3]"
                :players="players"
                :user="$auth.user.username"
              ></bet-result-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
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
      lastGamePage: 0,
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
