<template>
  <v-form ref="form" v-model="validScoreInput" data-testid="bet-input">
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="homeTeamScore"
          outlined
          type="number"
          min="0"
          max="99"
          :rules="[inputRules.minInput, inputRules.maxInput]"
          :label="`${upcomingGame.homeTeam.name} skóre`"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="awayTeamScore"
          outlined
          type="number"
          min="0"
          max="99"
          :rules="[inputRules.minInput, inputRules.maxInput]"
          :label="`${upcomingGame.awayTeam.name} skóre`"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col align="center" cols="12" class="pb-8 pt-0">
        <v-btn
          ref="submit-btn"
          color="primary"
          large
          block
          :disabled="alreadyStarted || !validScoreInput || this.$nuxt.$loading.show"
          nuxt
          @click="createBet"
        >
          Odoslať tip
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { IGame } from '@duchynko/tipovacka-models';
import Vue, { PropType } from 'vue';
export default Vue.extend({
  props: {
    upcomingGame: {
      type: Object as PropType<IGame & { _id: string }>,
      default: {} as IGame & { _id: string },
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
    alreadyStarted(): boolean {
      return new Date().getTime() > new Date(this.upcomingGame.date).getTime();
    },
  },
  methods: {
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
              this.$showAlert('Tip úspešne odoslaný', 'success');
              await this.$auth.fetchUser();
            }
          })
          .catch((err) => {
            this.$showAlert(err.response.data, 'warning');
          });
      } catch (error) {
        if (error === 'You already placed a bet on this game') {
          // TODO: Change this!
          console.log('Already bet');
        }
      }
    },
  },
});
</script>
