<template>
  <v-row data-testid="current-bet">
    <v-col cols="6">
      <v-text-field
        :value="getCurrentBet().homeTeamScore"
        :label="`${upcomingGame.homeTeam.name} skóre`"
        outlined
        disabled
      ></v-text-field>
    </v-col>
    <v-col cols="6">
      <v-text-field
        :value="getCurrentBet().awayTeamScore"
        :label="`${upcomingGame.awayTeam.name} skóre`"
        outlined
        disabled
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { IBet, IGame } from '@duchynko/tipovacka-models'
import Vue, { PropType } from 'vue'
export default Vue.extend({
  props: {
    upcomingGame: {
      type: Object as PropType<IGame & { _id: string }>,
      default: {} as IGame & { _id: string },
    },
  },
  computed: {
    usersBets(): IBet[] {
      return this.$auth.user.bets
    },
  },
  methods: {
    getCurrentBet(): IBet | undefined {
      if (!this.usersBets) return undefined

      const filteredGames: IBet[] = this.usersBets.filter(
        (b: IBet) => (b.game as IGame & { _id: string })._id === this.upcomingGame._id
      )
      return filteredGames[0]
    },
  },
})
</script>
