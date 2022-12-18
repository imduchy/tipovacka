<template>
  <v-card color="input" class="pa-2" raised rounded="lg" height="120">
    <v-row align="center" no-gutters>
      <v-col cols="12" align="center">
        <div class="text-caption primary--text">
          {{ game.competitionName }}
        </div>
      </v-col>
    </v-row>
    <v-row align="center" no-gutters>
      <v-col cols="3" align="center">
        <v-img alt="home team logo" :src="homeTeam.logo" min-width="50px" max-width="60px"></v-img
      ></v-col>
      <v-col cols="6" align="center" justify="center">
        <div class="white--text text-caption">
          {{ game.homeTeamScore }} : {{ game.awayTeamScore }}
        </div>
      </v-col>
      <v-col cols="3" align="center">
        <v-img alt="away team logo" :src="awayTeam.logo" min-width="50px" max-width="60px"></v-img
      ></v-col>
    </v-row>
    <v-row align="center" no-gutters>
      <v-col cols="12" align="center">
        <div class="text-caption font-weight-light white--text">
          {{ formatedDate }} {{ formatedTime }}
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IGame, ITeam } from '@tipovacka/models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    game: {
      type: Object as PropType<IGame>,
      required: true,
    },
  },
  computed: {
    formatedDate(): string {
      return new Date(this.game.date).toLocaleDateString('sk-SK', {
        month: 'long',
        day: 'numeric',
      });
    },
    formatedTime(): string {
      return new Date(this.game.date).toLocaleTimeString('sk-SK', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    homeTeam(): ITeam {
      return this.game.homeTeam;
    },
    awayTeam(): ITeam {
      return this.game.awayTeam;
    },
  },
});
</script>
