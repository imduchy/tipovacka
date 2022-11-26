<template>
  <v-card rounded="lg" color="card" light height="400px">
    <v-img class="card-background rounded-lg" src="stadium-background.png" />
    <v-row class="content" align="center" justify="center">
      <v-col v-if="upcomingGame">
        <v-row>
          <v-col align="center" class="pa-2">
            <span class="white--text text-h5 font-weight-bold">Nasledujúci zápas</span>
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center" class="pa-2">
            <span class="white--text text-subtitle-1">
              {{ `${formatedDate} ${formatedTime}` }}
            </span>
          </v-col>
        </v-row>

        <v-row>
          <v-col align="right" class="pa-2">
            <v-img
              :src="upcomingGame.homeTeam.logo"
              height="auto"
              width="60%"
              max-width="100px"
              alt="home team logo"
            />
          </v-col>

          <v-col align="left" class="pa-2">
            <v-img
              :src="upcomingGame.awayTeam.logo"
              height="auto"
              width="60%"
              max-width="100px"
              alt="home team logo"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center" class="pa-2 pb-0">
            <span class="primary--text text-subtitle-1 font-weight-bold">
              {{ upcomingGame.competitionName }}
            </span>
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center" class="py-0">
            <span class="white--text text-h6 font-weight-bold">
              {{ `${upcomingGame.homeTeam.name} & ${upcomingGame.awayTeam.name}` }}
            </span>
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center" class="pa-2 pt-0">
            <span class="primary--text text-subtitle-1">
              {{ upcomingGame.venue }}
            </span>
          </v-col>
        </v-row>

        <!--
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
              {{ upcomingGame ? formatedDate : 'Koniec sezóny' }}
            </div>
            <div class="text-subtitle-1 primary--text text-sm-h5 text-md-h4 font-weight-black">
              {{ upcomingGame ? formatedTime : '' }}
            </div>
          </v-col>
        </v-row>
      -->
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
      type: Object as PropType<IGame> | undefined,
      default: undefined,
    },
  },
  data() {
    return {};
  },
  computed: {
    isDerby(): boolean {
      if (!this.upcomingGame) {
        return false;
      }

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
    formatedDate(): string | undefined {
      if (!this.upcomingGame) {
        return undefined;
      }

      return new Date(this.upcomingGame.date).toLocaleDateString('sk-SK', {
        month: 'long',
        day: 'numeric',
      });
    },
    formatedTime(): string | undefined {
      if (!this.upcomingGame) {
        return undefined;
      }

      return new Date(this.upcomingGame.date).toLocaleTimeString('sk-SK', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
});
</script>

<style scoped>
.card-background {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  height: 400px;
  -webkit-filter: brightness(30%);
  -moz-filter: brightness(30%);
  -o-filter: brightness(30%);
  -ms-filter: brightness(30%);
  filter: brightness(30%);
}

.content {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  height: 400px;
  padding: 0px;
  margin: 0px;
}

.v-skeleton-loader__heading {
  border-radius: 12px;
  height: 24px;
  width: unset !important;
}
</style>
