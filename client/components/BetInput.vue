<template>
  <v-form ref="form" v-model="validInput" data-testid="bet-input">
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
      <v-col cols="12"
        ><v-select
          v-model="scorer"
          :items="players"
          item-text="name"
          item-value="apiId"
          :menu-props="{ top: true, offsetY: true }"
          outlined
          return-object
          label="Strelec gólu"
        >
          <template #item="{ item, on, attrs }">
            <v-list-item v-bind="attrs" v-on="on">
              <v-list-item-avatar>
                <v-img :src="item.photo"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="`${item.name}`"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="'Počet gólov: ' + item.statistics.goals.total"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template> </v-select
      ></v-col>
    </v-row>
    <v-row>
      <v-col align="center" cols="12" class="pb-8 pt-0">
        <v-btn
          ref="submit-btn"
          color="primary"
          large
          block
          :disabled="alreadyStarted || !validInput || submited"
          @click="submitBet"
        >
          Odoslať tip
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { IGame, IPlayer } from '@duchynko/tipovacka-models';
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
  },
  data() {
    return {
      inputRules: {
        minInput: (value: string) =>
          (Number.isInteger(parseInt(value)) && parseInt(value) >= 0) ||
          'Skóre môže byť v rozsahu od 0 do 99',
        maxInput: (value: string) =>
          (Number.isInteger(parseInt(value)) && parseInt(value) < 100) ||
          'Skóre môže byť v rozsahu od 0 do 99',
      },
      validInput: true,
      homeTeamScore: 0,
      awayTeamScore: 0,
      scorer: {} as IPlayer,
      submited: false,
    };
  },
  computed: {
    alreadyStarted(): boolean {
      return new Date().getTime() > new Date(this.upcomingGame.date).getTime();
    },
  },
  methods: {
    submitBet() {
      // Set submited to true, to disable the Submit button and prevent
      // users from doing multiple clicks and making multiple API calls.
      this.submited = true;

      try {
        this.$axios
          .post('/bets', {
            game: this.upcomingGame._id,
            homeTeamScore: this.homeTeamScore,
            awayTeamScore: this.awayTeamScore,
            user: this.$auth.user._id,
            scorer: this.scorer.apiId,
          })
          .then(async (response) => {
            if (response.status === 200) {
              this.$showAlert('Tip úspešne odoslaný', 'success');
              await this.$auth.fetchUser();
            }
          })
          .catch((error) => {
            this.$showAlert(error.response.data, 'warning');
          });
      } catch (error) {
        if (error === 'Tip na tento zápas si už podal.') {
          this.$showAlert(error.response.data, 'error');
        }
      }
    },
  },
});
</script>
