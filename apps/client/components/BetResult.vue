<template>
  <v-card data-testid="bet-result" class="d-flex flex-column" height="120">
    <v-row align="center" class="justify-space-around no-gutters">
      <v-col cols="3" align="center">
        <v-img alt="home team logo" :src="homeTeam.logo" min-width="50px" max-width="75px"></v-img
      ></v-col>
      <v-col cols="6" align="center" justify="center">
        <v-row justify="center" class="no-gutters">
          <v-col cols="12">
            <v-badge
              color="green font-weight-bold"
              :content="`+ ${bet.points} ${pointsString}`"
              offset-x="-10"
              offset-y="20"
            >
              <div class="text-subtitle-1 font-weight-bold">
                {{ user.username }}
              </div>
            </v-badge>
          </v-col>
        </v-row>
        <v-row justify="center" class="no-gutters">
          <div class="text-h6 font-weight-light grey--text pr-2">({{ bet.homeTeamScore }})</div>
          <div class="text-h5">{{ bet.game.homeTeamScore }} : {{ bet.game.awayTeamScore }}</div>
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
        </v-row>
      </v-col>
      <v-col cols="3" align="center">
        <v-img alt="away team logo" :src="awayTeam.logo" min-width="50px" max-width="75px"></v-img
      ></v-col>
    </v-row>
    <v-row class="no-gutters align-end">
      <v-col>
        <v-progress-linear :color="resultColor" value="100"></v-progress-linear>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IBet, IGame, IPlayer, ITeam, FixtureEventDetail, IUser } from '@tipovacka/models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    user: {
      type: Object as PropType<IUser>,
      default: {} as IUser,
    },
    players: {
      type: Array as PropType<IPlayer[]>,
      default: [] as IPlayer[],
    },
  },
  computed: {
    bet(): IBet {
      return this.user.bets[0];
    },
    pointsString(): string {
      if (this.bet.points === 1) {
        return 'bod';
      } else if (this.bet.points >= 2 && this.bet.points <= 4) {
        return 'body';
      } else {
        return 'bodov';
      }
    },
    scorerName(): string {
      if (!this.bet) {
        return '';
      } else {
        const playerId = this.bet.scorer;

        const scorer = this.players.find((p: IPlayer) => p.apiId === playerId);
        return scorer ? scorer.name : '';
      }
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
          ?.filter(
            (event) =>
              event.detail === FixtureEventDetail.NORMAL_GOAL ||
              event.detail === FixtureEventDetail.PENALTY
          )
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
