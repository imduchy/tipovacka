<template>
  <v-card color="secondary" class="pa-3 pa-sm-5" elevation="12" light>
    <v-row align="center" justify="center">
      <v-col cols="4" align="center">
        <v-img
          :src="upcomingGame.homeTeam.logo"
          height="auto"
          width="50%"
          max-width="100px"
        />
        <div class="text-body-1 text-sm-h4 font-weight-light mt-3">
          {{ upcomingGame.homeTeam.name }}
        </div>
      </v-col>
      <v-col cols="4" align="center">
        <div>
          <span class="text-subtitle-1 text-sm-h4 font-weight-light">{{
            formatedDate
          }}</span>
          <span class="text-subtitle-1 text-sm-h4 font-weight-black">{{
            formatedTime
          }}</span>
        </div>
        <v-row class="hidden-xs-only mt-3" justify="center">
          <v-icon class="mr-3">mdi-stadium</v-icon>
          <div class="text-sm-subtitle-1 font-weight-light">
            {{ upcomingGame.venue }}
          </div>
        </v-row>
        <v-row class="hidden-xs-only mt-1" justify="center">
          <v-icon class="mr-3">mdi-trophy-variant</v-icon>
          <div class="text-sm-subtitle-1 font-weight-light">La Liga</div>
        </v-row>
      </v-col>
      <v-col cols="4" align="center">
        <v-img
          :src="upcomingGame.awayTeam.logo"
          height="auto"
          width="50%"
          max-width="100px"
        />
        <div class="text-body-1 text-sm-h4 font-weight-light mt-3">
          {{ upcomingGame.awayTeam.name }}
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { IGame } from '~/models/Game'
export default Vue.extend({
  props: {
    upcomingGame: {
      type: Object as PropType<IGame>,
      default: {} as IGame,
    },
  },
  data: () => ({
    inputRules: {
      minInput: (value: string) =>
        (Number.isInteger(parseInt(value)) && parseInt(value) >= 0) ||
        'Skóre môže byť v rozsahu od 0 do 99',
      maxInput: (value: string) =>
        (Number.isInteger(parseInt(value)) && parseInt(value) < 100) ||
        'Skóre môže byť v rozsahu od 0 do 99',
    },
    homeTeamScore: 0,
    awayTeamScore: 0,
    validScoreInput: true,
  }),
  computed: {
    formatedDate(): string {
      return new Date(this.upcomingGame.date).toLocaleDateString('sk-SK', {
        month: 'long',
        day: 'numeric',
      })
    },
    formatedTime(): string {
      return new Date(this.upcomingGame.date).toLocaleTimeString('sk-SK', {
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
})
</script>
