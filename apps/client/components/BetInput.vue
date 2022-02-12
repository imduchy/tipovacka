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
          :disabled="hasAlreadyStarted || (currentUsersBet && !editingEnabled)"
          :rules="[inputRules.minInput, inputRules.maxInput]"
          :label="`${upcomingGame.homeTeam.name} skóre`"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="awayTeamScore"
          :disabled="hasAlreadyStarted || (currentUsersBet && !editingEnabled)"
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
          :disabled="hasAlreadyStarted || (currentUsersBet && !editingEnabled)"
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
    <v-row v-if="!currentUsersBet">
      <v-col align="center" cols="12" class="pb-8 pt-0">
        <v-btn
          ref="submit-btn"
          color="secondary"
          large
          block
          :disabled="hasAlreadyStarted || !validInput || sendingRequest"
          @click="submitBet"
        >
          Odoslať tip
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-else-if="currentUsersBet && editingEnabled" justify="center">
      <v-col cols="6">
        <v-btn color="grey lighten-2" light large block @click="editingEnabled = false">
          Zrušiť
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          color="secondary"
          light
          large
          block
          :disabled="hasAlreadyStarted || !validInput"
          @click="updateBet"
        >
          Uložiť zmeny
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-btn
          ref="update-btn"
          color="grey lighten-2"
          light
          large
          block
          :disabled="hasAlreadyStarted"
          @click="toggleEditing"
        >
          Zmeniť tip
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script lang="ts">
import { IBet, IGame, IPlayer, IUser } from '@tipovacka/models';
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
      default: {} as IBet & { _id: string },
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
      editingEnabled: false,
      sendingRequest: false,
      homeTeamScore: this.currentUsersBet ? this.currentUsersBet.homeTeamScore : 0,
      awayTeamScore: this.currentUsersBet ? this.currentUsersBet.awayTeamScore : 0,
      // Because of a bug in Vetur, it's not possible to use setter in a computed property.
      // The following code together with the 'watch' property defined below are a workaround
      // to make sure that the 'scorer' property gets updated properly when 'players' props
      // changes.
      scorer: this.currentUsersBet
        ? this.players.find((p: IPlayer) => p.apiId === this.currentUsersBet!.scorer)
        : this.players[0],
      user: this.$auth.user as IUser & { _id: string },
    };
  },
  computed: {
    hasAlreadyStarted(): boolean {
      return new Date().getTime() > new Date(this.upcomingGame.date).getTime();
    },
  },
  watch: {
    players() {
      this.scorer = this.currentUsersBet
        ? this.players.find((p: IPlayer) => p.apiId === this.currentUsersBet!.scorer)
        : this.players[0];
    },
  },
  methods: {
    toggleEditing() {
      this.editingEnabled = !this.editingEnabled;
    },
    submitBet() {
      this.sendingRequest = true;

      try {
        this.$axios
          .post('/bets', {
            game: this.upcomingGame._id,
            homeTeamScore: this.homeTeamScore,
            awayTeamScore: this.awayTeamScore,
            user: this.user._id,
            scorer: this.scorer ? this.scorer.apiId : 0,
          })
          .then(async (response) => {
            if (response.status === 200) {
              this.$showAlert('Tip úspešne odoslaný', 'success');
              await this.$auth.fetchUser();
            }
          })
          .catch((error) => {
            this.$showAlert(error.response.data, 'error');
          });
      } catch (error: any) {
        if (error.response.data === 'Tip na tento zápas si už podal.') {
          this.$showAlert(error.response.data, 'error');
        }
      } finally {
        this.sendingRequest = false;
      }
    },
    updateBet() {
      if (!this.currentUsersBet) return;

      this.sendingRequest = true;
      this.editingEnabled = false;

      try {
        this.$axios
          .put('/bets', {
            bet: this.currentUsersBet._id,
            homeTeamScore: this.homeTeamScore,
            awayTeamScore: this.awayTeamScore,
            scorer: this.scorer ? this.scorer.apiId : 0,
          })
          .then(async (response) => {
            if (response.status === 200) {
              this.$showAlert('Tip úspešne zmenený', 'success');
              await this.$auth.fetchUser();
            }
          })
          .catch((error) => {
            this.$showAlert(error.response.data, 'error');
          });
      } finally {
        this.sendingRequest = false;
      }
    },
  },
});
</script>
