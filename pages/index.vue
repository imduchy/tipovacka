<template>
  <v-row column justify-center align-center>
    <v-col xs12 sm8 md6>
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
            ><i>{{ new Date(upcommingGame.date).toUTCString() }}</i></span
          >
          <br />
          <span class="text-overline">In {{ upcommingGame.venue }}</span>
        </v-col>
      </v-row>
      <v-card>
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
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import { IGame } from '../models/Game'

export default Vue.extend({
  async asyncData({ $axios }) {
    const response = await $axios.$get(
      'http://localhost:3000/api/groups/5f7b18ea8e24c3829587a00d'
    )
    return { upcommingGame: response.upcommingGame as IGame }
  },
  data() {
    return {
      homeTeamScore: 0,
      awayTeamScore: 0,
    }
  },
  methods: {
    async createBet() {
      const response = await this.$axios.post(
        'http://localhost:3000/api/bets',
        {
          gameId: this.$data.upcommingGame._id,
          homeTeamScore: 2,
          awayTeamScore: 1,
          userId: '5f6751433a593bee3ec63dea',
        }
      )

      console.log(response)
    },
  },
})
</script>
