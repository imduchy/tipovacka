<template>
  <v-card color="input" class="pa-2" raised rounded="lg" height="120">
    <v-row align="center" no-gutters>
      <v-col cols="12" align="center">
        <div class="d-flex justify-center text-caption white--text">
          <div class="pr-2">
            <b>⭐️ {{ user }} </b>
          </div>
          <div>+{{ bet.points }} b.</div>
        </div>
      </v-col>
    </v-row>
    <v-row align="center" no-gutters>
      <v-col cols="3" align="center">
        <v-img alt="home team logo" :src="homeTeam.logo" min-width="50px" max-width="60px"></v-img
      ></v-col>
      <v-col cols="6" align="center" justify="center">
        <v-row justify="center" class="no-gutters">
          <v-col cols="12">
            <div class="white--text text-caption">
              {{ bet.game.homeTeamScore }} : {{ bet.game.awayTeamScore }}
            </div>
          </v-col>
          <v-col cols="12">
            <div
              :class="[
                'white--text',
                'text-caption',
                correctScorer && scorerName ? '' : 'text-decoration-line-through',
              ]"
            >
              ({{ scorerName ? scorerName : 'N/A' }})
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3" align="center">
        <v-img alt="away team logo" :src="awayTeam.logo" min-width="50px" max-width="60px"></v-img
      ></v-col>
    </v-row>
    <v-row align="center" no-gutters>
      <v-col cols="12" align="center">
        <div class="text-caption font-weight-light white--text">
          {{ formatedDate }} {{ formatedTime }}
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IBet, IGame, IPlayer, ITeam, FixtureEventDetail } from '@tipovacka/models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    user: {
      type: String,
      required: true,
    },
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
    scorerName(): string | undefined {
      if (!this.bet) {
        return '';
      } else {
        const playerId = this.bet.scorer;

        const scorer = this.players.find((p: IPlayer) => p.apiId === playerId);
        return scorer ? scorer.name : undefined;
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
    correctScorer(): boolean {
      const game = this.bet.game as IGame;
      return (
        game.events
          ?.filter(
            (event) =>
              event.detail === FixtureEventDetail.NORMAL_GOAL ||
              event.detail === FixtureEventDetail.PENALTY
          )
          .some((goal) => goal.playerId === this.bet.scorer) || false
      );
    },
  },
});
</script>
