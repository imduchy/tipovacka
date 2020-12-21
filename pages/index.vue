<template>
  <v-container>
    <v-row column justify-center align-center>
      <v-col v-if="!upcomingGame" class="xs12 sm8 md6">
        <div class="text-center">
          <v-progress-circular
            indeterminate
            :size="50"
            color="amber"
          ></v-progress-circular>
        </div>
      </v-col>
      <v-col v-else xs12 sm8 md6>
        <upcoming-game :upcoming-game="upcomingGame"></upcoming-game>

        <v-row>
          <v-col cols="12" class="pt-0">
            <v-card class="pt-8 px-8">
              <bet-input v-if="!alreadyBet" :upcoming-game="upcomingGame"></bet-input>
              <current-bet v-else :upcoming-game="upcomingGame"></current-bet>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import UpcomingGame from '../components/UpcomingGame.vue'
import BetInput from '../components/BetInput.vue'
import CurrentBet from '../components/CurrentBet.vue'

import { IGroup } from '~/models/Group'
import { IBet } from '~/models/Bet'

export default Vue.extend({
  components: { UpcomingGame, BetInput, CurrentBet },
  data() {
    return {
      homeTeamScore: 0,
      awayTeamScore: 0,
      validScoreInput: true,
    }
  },
  computed: {
    ...mapGetters({
      upcomingGame: 'upcomingGame',
    }),
    alreadyStarted(): boolean {
      return new Date().getTime() > new Date(this.upcomingGame.date).getTime()
    },
    usersBets(): IBet[] {
      return this.$auth.user.bets
    },
    alreadyBet(): boolean {
      const upcomingGame = this.upcomingGame._id
      if (this.usersBets !== undefined) {
        return this.usersBets.some((bet: IBet) => bet.game === upcomingGame)
      }
      return false
    },
  },
  methods: {
    async fetchUpcommingGame() {
      try {
        return await this.$axios
          .get('/groups/' + this.$auth.user.groupId)
          .then(({ data }: { data: IGroup }) => {
            return data.upcommingGame
          })
      } catch (error) {
        console.log(error)
      }
    },
  },
})
</script>
