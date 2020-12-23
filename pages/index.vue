<template>
  <v-container>
    <!-- Loading bar -->
    <template v-if="!upcomingGame">
      <v-row column justify-center align-center>
        <v-col cols="12">
          <div class="text-center">
            <v-progress-circular
              indeterminate
              :size="50"
              color="amber"
            ></v-progress-circular>
          </div>
        </v-col>
      </v-row>
    </template>
    <!-- Loading bar -->
    <template v-else>
      <v-row>
        <v-col cols="12">
          <!-- Upcoming game -->
          <upcoming-game :upcoming-game="upcomingGame"></upcoming-game>

          <v-row>
            <v-col cols="12" class="pt-0">
              <v-card class="pt-8 px-8">
                <!-- Input field / Current bet -->
                <bet-input v-if="!alreadyBet" :upcoming-game="upcomingGame"></bet-input>
                <current-bet v-else :upcoming-game="upcomingGame"></current-bet>
              </v-card>
            </v-col>
          </v-row>
          <!-- Last bets -->
          <div class="mt-5 text-h5">Posledné tipy</div>
          <v-row>
            <v-col v-if="evaluatedBets[0]" cols="12" lg="4">
              <user-bet :bet="usersBets[0]"></user-bet>
            </v-col>
            <v-col v-if="evaluatedBets[1]" cols="12" lg="4">
              <user-bet :bet="usersBets[1]"></user-bet>
            </v-col>
            <v-col v-if="evaluatedBets[2]" cols="12" lg="4">
              <user-bet :bet="usersBets[2]"></user-bet>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import UpcomingGame from '../components/UpcomingGame.vue'
import BetInput from '../components/BetInput.vue'
import CurrentBet from '../components/CurrentBet.vue'

import { IGroup } from '~/models/Group'
import { BetStatus, IBet } from '~/models/Bet'
import UserBet from '~/components/UserBet.vue'
import { IGame } from '~/models/Game'

export default Vue.extend({
  components: { UpcomingGame, BetInput, CurrentBet, UserBet },
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
        return this.usersBets.some(
          (bet: IBet) => (bet.game as IGame)._id === upcomingGame
        )
      }
      return false
    },
    evaluatedBets(): IBet[] {
      const bets: IBet[] = this.$auth.user.bets
      if (bets) {
        return bets.filter((b) => b.status === BetStatus.EVALUATED)
      }
      return []
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
