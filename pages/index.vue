<template>
  <v-container>
    <v-row column justify-center align-center>
      <v-col v-if="$fetchState.pending" class="xs12 sm8 md6">
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
            <v-img
              :src="upcommingGame.homeTeam.logo"
              height="100px"
              width="100px"
            />
            <div class="text-h5">{{ upcommingGame.homeTeam.name }}</div>
          </v-col>
          <div class="text-h4">vs</div>
          <v-col align="center">
            <v-img
              :src="upcommingGame.awayTeam.logo"
              height="100px"
              width="100px"
            />
            <div class="text-h5">{{ upcommingGame.awayTeam.name }}</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <span class="text-caption"
              ><i>{{ formatedGameDate }}</i></span
            >
            <br />
            <span class="text-caption">In {{ upcommingGame.venue }}</span>
          </v-col>
        </v-row>
        <v-card v-if="!usersBet">
          <v-card-title class="headline"> Bet </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="homeTeamScore"
                    type="number"
                    :label="`${upcommingGame.homeTeam.name} score`"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="awayTeamScore"
                    type="number"
                    :label="`${upcommingGame.awayTeam.name} score`"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" nuxt @click="createBet"> Submit </v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else>
          <v-card-title class="headline"> Your bet </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  :value="usersBet.homeTeamScore"
                  type="number"
                  :label="`${upcommingGame.homeTeam.name} score`"
                  disabled
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :value="usersBet.awayTeamScore"
                  type="number"
                  :label="`${upcommingGame.awayTeam.name} score`"
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
import { IGame, IGameDocument } from '../models/Game'
import { IUser } from '../models/User'
import { IGroup } from '~/models/Group'
import { IBet } from '~/models/Bet'

export default Vue.extend({
  async fetch() {
    this.upcommingGame = await this.fetchUpcommingGame()
  },
  data() {
    return {
      upcommingGame: {} as IGame | undefined,
      homeTeamScore: 0,
      awayTeamScore: 0,
    }
  },
  computed: {
    usersBet(): IBet | undefined {
      const upcommingGameId = (this.upcommingGame as IGameDocument)._id
      const usersBets = (this.$auth.user as IUser).bets
      if (!usersBets) {
        return undefined
      }
      const filteredGames = usersBets.filter((b) => b.game === upcommingGameId)
      return filteredGames[0]
    },
    formatedGameDate(): string {
      if (this.upcommingGame) {
        const date = new Date(this.upcommingGame.date)
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
    async createBet() {
      try {
        await this.$axios
          .post('/bets', {
            gameId: this.$data.upcommingGame._id,
            homeTeamScore: this.homeTeamScore,
            awayTeamScore: this.awayTeamScore,
            userId: this.$auth.user._id,
          })
          .then((response) => {
            if (response.status === 200) {
              this.$showAlert('Bet submited successfully', 'success')
            }
          })
          .catch((err) => {
            this.$showAlert(err.response.data, 'warning')
          })

        this.$auth.fetchUser()
      } catch (error) {
        if (error === 'You already placed a bet on this game') {
          console.log('Already bet')
        }
      }
    },
  },
})
</script>
