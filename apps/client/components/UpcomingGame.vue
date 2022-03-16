<template>
  <v-card color="#f5f5f5" class="pa-3 pa-sm-5" light>
    <v-row align="center" justify="center">
      <v-col cols="4" align="center">
        <v-img
          :src="upcomingGame.homeTeam.logo"
          height="auto"
          width="60%"
          max-width="100px"
          alt="home team logo"
        />
        <div class="hidden-xs-only text-sm-h5 text-md-h4 font-weight-light mt-3">
          {{ upcomingGame.homeTeam.name }}
        </div>
      </v-col>
      <v-col cols="4" align="center">
        <v-row v-if="isDerby" justify="center">
          <v-col class="d-flex flex-wrap justify-center">
            <v-icon color="info">mdi-chevron-double-up</v-icon>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <div
                  class="text-subtitle-2 text-md-subtitle-1 font-weight-light"
                  v-bind="attrs"
                  v-on="on"
                >
                  Derby
                </div>
              </template>
              <span>Za tento zápas získaš 2x počet bodov</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row justify="center" class="ma-0">
          <v-col class="px-0 d-flex flex-wrap justify-center">
            <div class="text-subtitle-1 text-sm-h5 text-md-h4 font-weight-light pr-1">
              {{ formatedDate }}
            </div>
            <div class="text-subtitle-1 secondary--text text-sm-h5 text-md-h4 font-weight-black">
              {{ formatedTime }}
            </div>
          </v-col>
        </v-row>
        <v-row justify="center" class="hidden-xs-only ma-0">
          <v-col class="d-flex justify-center pb-0">
            <v-icon class="mr-1">mdi-stadium</v-icon>
            <div
              class="d-inline-block text-truncate text-sm-subtitle-2 text-md-subtitle-1 font-weight-light"
            >
              {{ upcomingGame.venue }}
            </div>
          </v-col>
        </v-row>
        <v-row justify="center" class="hidden-xs-only ma-0">
          <v-col class="d-flex justify-center pt-0">
            <v-icon class="mr-1">mdi-trophy-variant</v-icon>
            <div
              class="d-inline-block text-truncate text-sm-subtitle-2 text-md-subtitle-1 font-weight-light"
            >
              {{ upcomingGame.competitionName }}
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="4" align="center">
        <v-img
          :src="upcomingGame.awayTeam.logo"
          height="auto"
          width="60%"
          max-width="100px"
          alt="away team logo"
        />
        <div class="hidden-xs-only text-sm-h5 text-md-h4 font-weight-light mt-3">
          {{ upcomingGame.awayTeam.name }}
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IGame } from '@tipovacka/models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    upcomingGame: {
      type: Object as PropType<IGame>,
      default: {} as IGame,
    },
  },
  data() {
    return {};
  },
  computed: {
    isDerby(): boolean {
      const rivals = this.$store.state.group.followedTeams[0].rivals;

      if (!rivals) {
        return false;
      }

      const isHomeTeam = rivals.find(
        (teamId: number) => teamId === this.upcomingGame.homeTeam.teamId
      );
      const isAwayTeam = rivals.find(
        (teamId: number) => teamId === this.upcomingGame.awayTeam.teamId
      );

      return !!(isHomeTeam || isAwayTeam);
    },
    formatedDate(): string {
      return new Date(this.upcomingGame.date).toLocaleDateString('sk-SK', {
        month: 'long',
        day: 'numeric',
      });
    },
    formatedTime(): string {
      return new Date(this.upcomingGame.date).toLocaleTimeString('sk-SK', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
});
</script>
