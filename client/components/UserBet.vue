<template>
  <v-card data-testid="user-bet">
    <v-row align="center">
      <v-col cols="4" align="center">
        <v-img alt="home team logo" :src="homeTeam.logo" width="70px"></v-img
      ></v-col>
      <v-col cols="4" align="center">
        <v-row justify="center">
          <div class="text-h6 font-weight-light grey--text pr-2">
            ({{ bet.homeTeamScore }})
          </div>
          <div class="text-h5 font-weight-bold">
            {{ bet.game.homeTeamScore }} : {{ bet.game.awayTeamScore }}
          </div>
          <div class="text-h6 font-weight-light grey--text pl-2">
            ({{ bet.awayTeamScore }})
          </div>
        </v-row>
        <v-row justify="center" align="center" class="pa-3">
          <v-col cols="12" class="pa-0">
            <div class="text-caption font-weight-light">
              {{ formatedDate }}
            </div>
          </v-col>
          <v-col cols="12" class="pa-0">
            <div class="text-caption font-weight-bold">{{ formatedTime }}</div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="4" align="center">
        <v-img alt="away team logo" :src="awayTeam.logo" width="70px"></v-img
      ></v-col>
    </v-row>
    <v-progress-linear :color="resultColor" value="100"></v-progress-linear>
  </v-card>
</template>

<script lang="ts">
import { IBet, IGame, ITeam } from '@duchynko/tipovacka-models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    bet: {
      type: Object as PropType<IBet>,
      default: {} as IBet,
    },
  },
  computed: {
    formatedDate(): string {
      return new Date((this.bet.game as IGame).date).toLocaleDateString('sk-SK', {
        month: 'long',
        day: 'numeric',
      });
    },
    formatedTime(): string {
      return new Date((this.bet.game as IGame).date).toLocaleTimeString('sk-SK', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    homeTeam(): ITeam {
      return (this.bet.game as IGame).homeTeam;
    },
    awayTeam(): ITeam {
      return (this.bet.game as IGame).awayTeam;
    },
    resultColor(): string {
      return this.getResultColor(this.bet);
    },
  },
  methods: {
    getResultColor(bet: IBet) {
      const game = bet.game as IGame;
      if (
        bet.homeTeamScore === game.homeTeamScore &&
        bet.awayTeamScore === game.awayTeamScore
      ) {
        return 'success';
      } else if (
        (bet.homeTeamScore > bet.awayTeamScore &&
          game.homeTeamScore! > game.awayTeamScore!) ||
        (bet.awayTeamScore > bet.homeTeamScore &&
          game.awayTeamScore! > game.homeTeamScore!) ||
        (bet.homeTeamScore === bet.awayTeamScore &&
          game.homeTeamScore === game.awayTeamScore)
      ) {
        return 'info';
      } else {
        return 'error';
      }
    },
  },
});
</script>
