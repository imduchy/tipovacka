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

        <v-card v-if="!alreadyBet">
          <v-card-title class="headline"> Bet </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="validScoreInput">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="homeTeamScore"
                    type="number"
                    min="0"
                    max="99"
                    :rules="[rules.minInput, rules.maxInput]"
                    :label="`${upcomingGame.homeTeam.name} score`"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="awayTeamScore"
                    type="number"
                    min="0"
                    max="99"
                    :rules="[rules.minInput, rules.maxInput]"
                    :label="`${upcomingGame.awayTeam.name} score`"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              ref="submit-btn"
              color="primary"
              :disabled="alreadyStarted || !validScoreInput"
              nuxt
              @click="createBet"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else>
          <v-card-title class="headline"> Your bet </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  :value="getCurrentBet().homeTeamScore"
                  type="number"
                  :label="`${upcomingGame.homeTeam.name} score`"
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :value="getCurrentBet().awayTeamScore"
                  type="number"
                  :label="`${upcomingGame.awayTeam.name} score`"
                  disabled
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import UpcomingGame from '../components/UpcomingGame.vue'
import { IGroup } from '~/models/Group'
import { IBet } from '~/models/Bet'

export default Vue.extend({
  components: { UpcomingGame },
  data() {
    return {
      homeTeamScore: 0,
      awayTeamScore: 0,
      rules: {
        minInput: (value: string) =>
          (Number.isInteger(parseInt(value)) && parseInt(value) >= 0) ||
          'Skóre môže byť v rozsahu od 0 do 99',
        maxInput: (value: string) =>
          (Number.isInteger(parseInt(value)) && parseInt(value) < 100) ||
          'Skóre môže byť v rozsahu od 0 do 99',
      },
      validScoreInput: true,
    }
  },
  computed: {
    ...mapGetters({
      upcomingGame: 'upcomingGame',
    }),
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
    alreadyStarted(): boolean {
      return new Date().getTime() > new Date(this.upcomingGame.date).getTime()
    },
  },
  methods: {
    getCurrentBet(): IBet | undefined {
      if (!this.alreadyBet || !this.usersBets) return undefined

      const filteredGames: IBet[] = this.usersBets.filter(
        (b: IBet) => b.game === this.upcomingGame._id
      )
      return filteredGames[0]
    },
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
    createBet() {
      try {
        this.$axios
          .post('/bets', {
            gameId: this.upcomingGame!._id,
            homeTeamScore: this.homeTeamScore,
            awayTeamScore: this.awayTeamScore,
            userId: this.$auth.user._id,
          })
          .then(async (response) => {
            if (response.status === 200) {
              this.$showAlert('Bet submited successfully', 'success')
              await this.$auth.fetchUser()
            }
          })
          .catch((err) => {
            this.$showAlert(err.response.data, 'warning')
          })
      } catch (error) {
        if (error === 'You already placed a bet on this game') {
          // TODO: Change this!
          console.log('Already bet')
        }
      }
    },
  },
})
</script>
