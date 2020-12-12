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
        <div class="text-h4" align="center">Upcoming game</div>
        <v-row align="center">
          <v-col align="center">
            <v-img :src="upcomingGame.homeTeam.logo" height="100px" width="100px" />
            <div class="text-h5">{{ upcomingGame.homeTeam.name }}</div>
          </v-col>
          <div class="text-h4">vs</div>
          <v-col align="center">
            <v-img :src="upcomingGame.awayTeam.logo" height="100px" width="100px" />
            <div class="text-h5">{{ upcomingGame.awayTeam.name }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <span class="text-caption"
              ><i>{{ formatedGameDate }}</i></span
            >
            <br />
            <span class="text-caption">In {{ upcomingGame.venue }}</span>
          </v-col>
        </v-row>
        <v-card v-if="!alreadyBet">
          <v-card-title class="headline"> Bet </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="homeTeamScore"
                    type="number"
                    :label="`${upcomingGame.homeTeam.name} score`"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="awayTeamScore"
                    type="number"
                    :label="`${upcomingGame.awayTeam.name} score`"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn ref="submit-btn" color="primary" nuxt @click="createBet">
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
import { IGroup } from '~/models/Group'
import { IBet } from '~/models/Bet'

export default Vue.extend({
  data() {
    return {
      homeTeamScore: 0,
      awayTeamScore: 0,
      usersBets: this.$auth.user.bets,
    }
  },
  computed: {
    ...mapGetters({
      upcomingGame: 'upcomingGame',
    }),
    alreadyBet(): boolean {
      const upcomingGame = this.upcomingGame._id
      if (this.usersBets !== undefined) {
        return this.usersBets.some((bet: IBet) => bet.game === upcomingGame)
      }
      return false
    },
    formatedGameDate(): string {
      if (this.upcomingGame) {
        const date = new Date(this.upcomingGame.date)
        const formatedDate = date.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        const formatedTime = date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        })
        return formatedDate + ' at ' + formatedTime
      }
      return ''
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
          .then((response) => {
            if (response.status === 200) {
              this.$auth.fetchUser()
              this.$showAlert('Bet submited successfully', 'success')
              this.$forceUpdate()
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
