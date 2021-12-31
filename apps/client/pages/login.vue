<template>
  <v-row id="custom-background" class="fill-height" no-gutters>
    <v-col cols="12" md="6" class="white text-left black--text">
      <v-row class="fill-height" align="center" no-gutters>
        <v-col
          class="mx-auto pt-8"
          cols="10"
          sm="8"
          :align="$vuetify.breakpoint.smAndDown ? 'center' : 'start'"
        >
          <v-img src="/halamadrid-logo.png" width="150px" class="hide-above-sm mb-10">
          </v-img>
          <p class="text-h4 font-weight-bold">Prihlásenie</p>
          <p class="text-subtitle-1 hide-on-sm">
            Prihlasovacia stránka pre členov fanklubu La Peňa Madridista de Eslovaquia
          </p>
          <v-divider class="my-8 hide-on-sm" color="grey"></v-divider>
          <v-form>
            <p class="text-subtitle-1 font-weight-bold mb-1 hide-on-sm">
              Prihlasovacie meno
            </p>
            <v-text-field
              v-model="login.username"
              :label="$vuetify.breakpoint.smAndDown ? 'Prihlasovacie meno' : ''"
              prepend-inner-icon="mdi-account-outline"
              light
              outlined
              required
            ></v-text-field>
            <p class="text-subtitle-1 font-weight-bold mb-1 hide-on-sm">Heslo</p>
            <v-text-field
              v-model="login.password"
              type="password"
              :label="$vuetify.breakpoint.smAndDown ? 'Heslo' : ''"
              prepend-inner-icon="mdi-lock-outline"
              light
              outlined
              required
            ></v-text-field>

            <!-- <v-row align="center">
              <v-col cols="12" md="6" class="text-left">
                <v-checkbox
                  class="ma-0 pa-0 text-none text-subtitle-1 font-weight-bold"
                  light
                  disabled
                  label="Zapamätaj prihlásenie"
                  color="primary"
                  hide-details
                  dense
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="6" class="text-right">
                <v-btn
                  id="no-background-hover"
                  class="text-none text-subtitle-1 font-weight-bold"
                  :ripple="false"
                  text
                  color="primary"
                  >Zabudnuté heslo?</v-btn
                >
              </v-col>
            </v-row> -->

            <v-btn class="my-8" color="secondary" large rounded block @click="userLogin">
              Prihlásiť sa
            </v-btn>
          </v-form>

          <p class="text-body-1 font-weight-light hide-on-sm">
            Táto aplikácia je vyhradená iba pre členov fanklubu. Ak si členom fanklubu a
            ešte nemáš účet, kontaktuj prosím vedenie fanklubu.
          </p>

          <p class="text-subtitle-1 font-weight-light mt-10">
            &copy; {{ new Date().getFullYear() }}
            Vytvoril
            <a href="https://www.linkedin.com/in/jakubduchon9/" target="_blank"
              >Jakub Duchon.</a
            >
          </p>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" md="6" class="hide-on-sm" align="center" align-self="center">
      <v-img src="/halamadrid-logo.png" class="" width="300px"></v-img>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  // @ts-ignore
  layout: 'full-width',
  data() {
    return {
      login: {
        username: '',
        password: '',
      },
    };
  },
  methods: {
    async userLogin() {
      try {
        // this.$auth.$storage.setUniversal('redirect', '/')
        await this.$auth.loginWith('cookie', {
          data: {
            username: this.login.username,
            password: this.login.password,
          },
        });
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          this.$showAlert('Nesprávne meno alebo heslo', 'error');
        } else {
          this.$showAlert('Stala sa chyba. Skús to opäť neskôr', 'error');
        }
      }
    },
  },
});
</script>

<style scoped>
#no-background-hover::before {
  background-color: transparent !important;
}

@media only screen and (max-width: 960px) {
  .hide-on-sm {
    display: none;
  }
}

@media only screen and (min-width: 960px) {
  .hide-above-sm {
    display: none;
  }
}

#custom-background {
  background-color: var(--v-primary-base);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2000' height='2000' viewBox='0 0 800 800'%3E%3Cg fill='none' %3E%3Cg stroke='%23026' stroke-width='17'%3E%3Cline x1='-8' y1='-8' x2='808' y2='808'/%3E%3Cline x1='-8' y1='792' x2='808' y2='1608'/%3E%3Cline x1='-8' y1='-808' x2='808' y2='8'/%3E%3C/g%3E%3Cg stroke='%23002163' stroke-width='16'%3E%3Cline x1='-8' y1='767' x2='808' y2='1583'/%3E%3Cline x1='-8' y1='17' x2='808' y2='833'/%3E%3Cline x1='-8' y1='-33' x2='808' y2='783'/%3E%3Cline x1='-8' y1='-783' x2='808' y2='33'/%3E%3C/g%3E%3Cg stroke='%23002060' stroke-width='15'%3E%3Cline x1='-8' y1='742' x2='808' y2='1558'/%3E%3Cline x1='-8' y1='42' x2='808' y2='858'/%3E%3Cline x1='-8' y1='-58' x2='808' y2='758'/%3E%3Cline x1='-8' y1='-758' x2='808' y2='58'/%3E%3C/g%3E%3Cg stroke='%23001f5c' stroke-width='14'%3E%3Cline x1='-8' y1='67' x2='808' y2='883'/%3E%3Cline x1='-8' y1='717' x2='808' y2='1533'/%3E%3Cline x1='-8' y1='-733' x2='808' y2='83'/%3E%3Cline x1='-8' y1='-83' x2='808' y2='733'/%3E%3C/g%3E%3Cg stroke='%23001e59' stroke-width='13'%3E%3Cline x1='-8' y1='92' x2='808' y2='908'/%3E%3Cline x1='-8' y1='692' x2='808' y2='1508'/%3E%3Cline x1='-8' y1='-108' x2='808' y2='708'/%3E%3Cline x1='-8' y1='-708' x2='808' y2='108'/%3E%3C/g%3E%3Cg stroke='%23001d56' stroke-width='12'%3E%3Cline x1='-8' y1='667' x2='808' y2='1483'/%3E%3Cline x1='-8' y1='117' x2='808' y2='933'/%3E%3Cline x1='-8' y1='-133' x2='808' y2='683'/%3E%3Cline x1='-8' y1='-683' x2='808' y2='133'/%3E%3C/g%3E%3Cg stroke='%23001c53' stroke-width='11'%3E%3Cline x1='-8' y1='642' x2='808' y2='1458'/%3E%3Cline x1='-8' y1='142' x2='808' y2='958'/%3E%3Cline x1='-8' y1='-158' x2='808' y2='658'/%3E%3Cline x1='-8' y1='-658' x2='808' y2='158'/%3E%3C/g%3E%3Cg stroke='%23001b4f' stroke-width='10'%3E%3Cline x1='-8' y1='167' x2='808' y2='983'/%3E%3Cline x1='-8' y1='617' x2='808' y2='1433'/%3E%3Cline x1='-8' y1='-633' x2='808' y2='183'/%3E%3Cline x1='-8' y1='-183' x2='808' y2='633'/%3E%3C/g%3E%3Cg stroke='%23001a4c' stroke-width='9'%3E%3Cline x1='-8' y1='592' x2='808' y2='1408'/%3E%3Cline x1='-8' y1='192' x2='808' y2='1008'/%3E%3Cline x1='-8' y1='-608' x2='808' y2='208'/%3E%3Cline x1='-8' y1='-208' x2='808' y2='608'/%3E%3C/g%3E%3Cg stroke='%23001949' stroke-width='8'%3E%3Cline x1='-8' y1='567' x2='808' y2='1383'/%3E%3Cline x1='-8' y1='217' x2='808' y2='1033'/%3E%3Cline x1='-8' y1='-233' x2='808' y2='583'/%3E%3Cline x1='-8' y1='-583' x2='808' y2='233'/%3E%3C/g%3E%3Cg stroke='%23001846' stroke-width='7'%3E%3Cline x1='-8' y1='242' x2='808' y2='1058'/%3E%3Cline x1='-8' y1='542' x2='808' y2='1358'/%3E%3Cline x1='-8' y1='-558' x2='808' y2='258'/%3E%3Cline x1='-8' y1='-258' x2='808' y2='558'/%3E%3C/g%3E%3Cg stroke='%23001743' stroke-width='6'%3E%3Cline x1='-8' y1='267' x2='808' y2='1083'/%3E%3Cline x1='-8' y1='517' x2='808' y2='1333'/%3E%3Cline x1='-8' y1='-533' x2='808' y2='283'/%3E%3Cline x1='-8' y1='-283' x2='808' y2='533'/%3E%3C/g%3E%3Cg stroke='%2300163f' stroke-width='5'%3E%3Cline x1='-8' y1='292' x2='808' y2='1108'/%3E%3Cline x1='-8' y1='492' x2='808' y2='1308'/%3E%3Cline x1='-8' y1='-308' x2='808' y2='508'/%3E%3Cline x1='-8' y1='-508' x2='808' y2='308'/%3E%3C/g%3E%3Cg stroke='%2300153c' stroke-width='4'%3E%3Cline x1='-8' y1='467' x2='808' y2='1283'/%3E%3Cline x1='-8' y1='317' x2='808' y2='1133'/%3E%3Cline x1='-8' y1='-333' x2='808' y2='483'/%3E%3Cline x1='-8' y1='-483' x2='808' y2='333'/%3E%3C/g%3E%3Cg stroke='%23001439' stroke-width='3'%3E%3Cline x1='-8' y1='342' x2='808' y2='1158'/%3E%3Cline x1='-8' y1='442' x2='808' y2='1258'/%3E%3Cline x1='-8' y1='-458' x2='808' y2='358'/%3E%3Cline x1='-8' y1='-358' x2='808' y2='458'/%3E%3C/g%3E%3Cg stroke='%23001336' stroke-width='2'%3E%3Cline x1='-8' y1='367' x2='808' y2='1183'/%3E%3Cline x1='-8' y1='417' x2='808' y2='1233'/%3E%3Cline x1='-8' y1='-433' x2='808' y2='383'/%3E%3Cline x1='-8' y1='-383' x2='808' y2='433'/%3E%3C/g%3E%3Cg stroke='%23013' stroke-width='1'%3E%3Cline x1='-8' y1='392' x2='808' y2='1208'/%3E%3Cline x1='-8' y1='-408' x2='808' y2='408'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-repeat: repeat;
}
</style>
