<template>
  <v-card raised class="pa-4" rounded="lg" color="card">
    <v-row no-gutters>
      <v-col cols="12">
        <v-tabs
          v-model="tab"
          hide-slider
          centered
          background-color="card"
          color="primary"
          centerd
          dark
        >
          <v-tab
            v-for="item in items"
            :key="item"
            active-class="active-tab"
            class="text-capitalize text-subtitle-2"
            :ripple="false"
            >{{ item }}</v-tab
          >
        </v-tabs>
      </v-col>
    </v-row>

    <v-row no-gutters class="my-4">
      <v-col cols="12" align="center">
        <hr />
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col cols="12">
        <v-tabs-items id="custom-tab-color" v-model="tab" dark>
          <v-tab-item>
            <bet-input-form
              :upcoming-game="upcomingGame"
              :players="players"
              :current-users-bet="currentUsersBet"
            />
          </v-tab-item>
          <v-tab-item v-for="n in 3" :key="n" class="align-center justify-center">
            <v-col align="center" justify="center">
              <h4 class="white--text">Pripravujeme...</h4>
            </v-col>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { IBet, IGame, IPlayer } from '@tipovacka/models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    upcomingGame: {
      type: Object as PropType<IGame & { _id: string }>,
      default: {} as IGame & { _id: string },
    },
    players: {
      type: Array as PropType<IPlayer[]>,
      default: [] as IPlayer[],
    },
    currentUsersBet: {
      type: Object as PropType<(IBet & { _id: string }) | undefined>,
      default: undefined,
    },
  },
  data() {
    return {
      items: ['Tip', 'Tabuľka', 'Head to Head', 'Výsledky'],
      tab: null,
    };
  },
});
</script>

<style scoped>
hr {
  width: 90%;
  height: 2px;
  background-image: linear-gradient(
    to right,
    transparent,
    var(--v-primary-base),
    var(--v-primary-base),
    transparent
  );
  font-size: 0;
  border: 0;
}

.active-tab {
  font-weight: bold;
  color: var(--v-primary-base);
}

#custom-tab-color {
  background-color: var(--card-base);
}
</style>
