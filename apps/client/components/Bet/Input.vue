<template>
  <v-card class="pa-4" rounded="lg" color="card">
    <v-row no-gutters>
      <v-col cols="12">
        <v-tabs hide-slider centered background-color="card" color="primary" centerd dark>
          <v-tab active-class="active-tab" class="text-capitalize text-subtitle-2" :ripple="false"
            >Tip</v-tab
          >
          <v-tab active-class="active-tab" class="text-capitalize text-subtitle-2" :ripple="false"
            >Tabuľka</v-tab
          >
          <v-tab active-class="active-tab" class="text-capitalize text-subtitle-2" :ripple="false"
            >Head to Head</v-tab
          >
          <v-tab active-class="active-tab" class="text-capitalize text-subtitle-2" :ripple="false"
            >Výsledky</v-tab
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
        <v-form ref="form" v-model="validInput" data-testid="bet-input">
          <v-row no-gutters align="center">
            <v-col align="right" class="d-none d-md-flex" cols="2">
              <v-img
                class="mx-auto"
                :src="upcomingGame.homeTeam.logo"
                height="auto"
                max-width="80px"
                alt="home team logo"
              />
            </v-col>
            <v-col cols="5" md="3">
              <v-row no-gutters>
                <v-col>
                  <p class="white--text ma-0 caption">{{ upcomingGame.homeTeam.name }}</p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <v-text-field
                    v-model="homeTeamScore"
                    hide-spin-buttons
                    class="pt-0"
                    dark
                    rounded
                    background-color="input"
                    type="number"
                    min="0"
                    max="99"
                    :disabled="hasAlreadyStarted || (currentUsersBet && !editingEnabled)"
                    :rules="[inputRules.minInput, inputRules.maxInput]"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="2" align="center" justify="start">
              <p class="primary--text subtitle-1">VS</p>
            </v-col>
            <v-col cols="5" md="3">
              <v-row no-gutters>
                <v-col align="right">
                  <p class="white--text ma-0 caption">{{ upcomingGame.awayTeam.name }}</p>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <v-text-field
                    v-model="awayTeamScore"
                    hide-spin-buttons
                    class="pt-0"
                    dark
                    rounded
                    background-color="input"
                    :disabled="hasAlreadyStarted || (currentUsersBet && !editingEnabled)"
                    type="number"
                    min="0"
                    max="99"
                    :rules="[inputRules.minInput, inputRules.maxInput]"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col class="d-none d-md-flex" cols="2">
              <v-img
                class="mx-auto"
                :src="upcomingGame.awayTeam.logo"
                height="auto"
                max-width="80px"
                alt="away team logo"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col align="center" class="pb-0 offset-md-3" cols="12" md="6">
              <p class="white--text ma-0 caption">Strelec zápasu</p>
            </v-col>
            <v-col class="py-0 offset-md-3" cols="12" md="6"
              ><v-select
                v-model="scorer"
                class="pt-0"
                :disabled="
                  hasAlreadyStarted || (currentUsersBet && !editingEnabled) || emptyScorerRule
                "
                :items="players"
                item-text="name"
                item-value="apiId"
                :menu-props="{ top: true, offsetY: true }"
                dark
                rounded
                background-color="input"
                return-object
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
          <v-row no-gutters class="mb-4" align="center" justify="center">
            <v-col v-if="currentUsersBet && !editingEnabled" cols="6">
              <v-btn
                ref="update-btn"
                color="grey lighten-2"
                v-bind="defaultButtonProps"
                :dark="hasAlreadyStarted"
                :disabled="hasAlreadyStarted"
                @click="toggleEditing"
              >
                Zmeniť tip
              </v-btn>
            </v-col>
            <span v-else-if="currentUsersBet && editingEnabled">
              <v-col cols="6">
                <v-btn
                  color="grey lighten-2"
                  v-bind="defaultButtonProps"
                  @click="editingEnabled = false"
                >
                  Zrušiť
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  color="primary"
                  v-bind="defaultButtonProps"
                  dark
                  :disabled="hasAlreadyStarted || !validInput"
                  @click="updateBet"
                >
                  Uložiť zmeny
                </v-btn>
              </v-col>
            </span>
            <v-col v-else cols="6">
              <v-btn
                ref="submit-btn"
                color="primary"
                v-bind="defaultButtonProps"
                :dark="hasAlreadyStarted || !validInput || sendingRequest"
                :disabled="hasAlreadyStarted || !validInput || sendingRequest"
                @click="submitBet"
              >
                Odoslať tip
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-card>
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
      default: undefined,
    },
  },
  data() {
    return {
      defaultButtonProps: {
        small: true,
        block: true,
        rounded: true,
      },
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
      homeTeamScore: this.currentUsersBet ? this.currentUsersBet.homeTeamScore : '0',
      awayTeamScore: this.currentUsersBet ? this.currentUsersBet.awayTeamScore : '0',
      /**
       * Because of a bug in Vetur, it's not possible to use setter in a computed property.
       * The following code together with the 'watch' property defined below are a workaround
       * to make sure that the 'scorer' property gets updated properly when 'players' props
       * changes.
       */
      scorer: this.currentUsersBet
        ? this.players.find((p: IPlayer) => p.apiId === this.currentUsersBet!.scorer)
        : undefined,
      user: this.$auth.user as IUser & { _id: string },
    };
  },
  computed: {
    hasAlreadyStarted(): boolean {
      return new Date().getTime() > new Date(this.upcomingGame.date).getTime();
    },
    isFollowedTeamHomeTeam(): boolean {
      return this.upcomingGame.homeTeam.teamId === this.$store.state.group.followedTeams[0].apiId;
    },
    emptyScorerRule(): boolean {
      if (this.isFollowedTeamHomeTeam && this.homeTeamScore === '0') {
        return true;
      } else if (!this.isFollowedTeamHomeTeam && this.awayTeamScore === '0') {
        return true;
      }
      return false;
    },
  },
  watch: {
    /**
     * This is a workaround due to a bug in Vetur. All details are described in a
     * comment in the data section, above the 'scorer' attribute.
     */
    players() {
      this.scorer = this.currentUsersBet
        ? this.players.find((p: IPlayer) => p.apiId === this.currentUsersBet!.scorer)
        : undefined;
    },
    /**
     * The value of 'scorer' should be undefined whenever the value of 'score'
     * for the 'followedTeam' is 0.
     */
    homeTeamScore() {
      if (this.isFollowedTeamHomeTeam && this.homeTeamScore === '0') {
        this.scorer = undefined;
      }
    },
    /**
     * Same as the above. The value of 'scorer' should be undefined whenever the
     * value of 'score' for the 'followedTeam' is 0.
     */
    awayTeamScore() {
      if (!this.isFollowedTeamHomeTeam && this.awayTeamScore === '0') {
        this.scorer = undefined;
      }
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
</style>
