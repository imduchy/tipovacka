<template>
  <v-card data-testid="user-bet">
    <v-row align="center" class="no-gutters">
      <v-col cols="3" align="center" class="py-5">
        <v-img alt="home team logo" :src="homeTeam.logo" width="50px"></v-img
      ></v-col>
      <v-col cols="6" align="center" justify="center">
        <v-row justify="center" class="no-gutters">
          <div class="text-h6 font-weight-light grey--text pr-2">({{ bet.homeTeamScore }})</div>
          <div class="text-h5 font-weight-bold">
            {{ bet.game.homeTeamScore }} : {{ bet.game.awayTeamScore }}
          </div>
          <div class="text-h6 font-weight-light grey--text pl-2">({{ bet.awayTeamScore }})</div>
        </v-row>
        <v-row class="no-gutters">
          <v-col
            cols="12"
            :class="[
              'text-subtitle-2',
              'font-weight-light',
              'grey--text',
              correctScorer ? '' : 'text-decoration-line-through',
            ]"
          >
            ({{ scorerName }})
          </v-col>
          <v-col cols="12">
            <div class="text-caption font-weight-light">
              {{ formatedDate }}
            </div>
          </v-col>
          <v-col cols="12">
            <div class="text-caption font-weight-bold">{{ formatedTime }}</div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3" align="center" class="py-5">
        <v-img alt="away team logo" :src="awayTeam.logo" width="50px"></v-img
      ></v-col>
    </v-row>
    <v-row class="no-gutters">
      <v-col>
        <v-progress-linear :color="resultColor" value="100"></v-progress-linear>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IBet, IGame, IPlayer, ITeam, FixtureEventDetail } from '@tipovacka/models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    bet: {
      type: Object as PropType<IBet>,
      default: {} as IBet,
    },
    players: {
      type: Array as PropType<IPlayer[]>,
      default: [] as IPlayer[],
    },
  },
  computed: {
    scorerName(): string {
      if (!this.bet) {
        return '';
      } else {
        const playerId = this.bet.scorer;

        const scorer = this.players.find((p: IPlayer) => p.apiId === playerId);
        return scorer ? scorer.name : '';
      }
    },
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
    correctScorer(): boolean {
      const game = this.bet.game as IGame;
      return (
        game.events
          ?.filter((event) => event.detail === FixtureEventDetail.NORMAL_GOAL)
          .some((goal) => goal.playerId === this.bet.scorer) || false
      );
    },
  },
  methods: {
    getResultColor(bet: IBet) {
      const game = bet.game as IGame;
      if (bet.homeTeamScore === game.homeTeamScore && bet.awayTeamScore === game.awayTeamScore) {
        return 'success';
      } else if (
        (bet.homeTeamScore > bet.awayTeamScore && game.homeTeamScore! > game.awayTeamScore!) ||
        (bet.awayTeamScore > bet.homeTeamScore && game.awayTeamScore! > game.homeTeamScore!) ||
        (bet.homeTeamScore === bet.awayTeamScore && game.homeTeamScore === game.awayTeamScore)
      ) {
        return 'info';
      } else {
        return 'error';
      }
    },
  },
});
</script>
