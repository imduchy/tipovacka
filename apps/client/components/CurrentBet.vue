<template>
  <v-col cols="12">
    <v-row data-testid="current-bet">
      <v-col cols="6">
        <v-text-field
          :value="currentBet.homeTeamScore"
          :label="`${upcomingGame.homeTeam.name} skóre`"
          outlined
          disabled
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          :value="currentBet.awayTeamScore"
          :label="`${upcomingGame.awayTeam.name} skóre`"
          outlined
          disabled
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-text-field
          :value="scorerName"
          label="Strelec"
          outlined
          disabled
        ></v-text-field>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import { IBet, IGame, IPlayer } from '@tipovacka/models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    upcomingGame: {
      type: Object as PropType<IGame & { _id: string }>,
      default: {} as IGame & { _id: string },
    },
    players: {
      type: Array as PropType<IPlayer[]>,
      default: [] as IPlayer[],
    },
  },
  computed: {
    betsOfUser(): IBet[] {
      return this.$auth.user.bets;
    },
    currentBet(): IBet | undefined {
      return this.betsOfUser.find(
        (b: IBet) => (b.game as IGame).gameId === this.upcomingGame.gameId
      );
    },
    scorerName(): string {
      if (!this.currentBet) {
        return '';
      } else {
        const playerId = this.currentBet.scorer;

        const scorer = this.players.find((p: IPlayer) => p.apiId === playerId);
        return scorer ? scorer.name : '';
      }
    },
  },
});
</script>
