<template>
  <v-row class="white--text">
    <v-col no-gutters>
      <v-row align="center" no-gutters>
        <v-col self-justify="start" cols="12" md="6">
          <div class="text-h4 font-weight-bold pb-3 px-0">Všeobecné pravidlá</div>
          <ul class="text-justify">
            <li class="py-1">Tipuje sa počas celej sezóny a víťazi sa určia po poslednom kole.</li>
            <li class="py-1">
              Tipy na zápas je možné pridať iba pred začiatkom zápasu na stránke onlinetipovacka.sk
            </li>
            <li class="py-1">
              V prebiehajúcej časti Tipovačky bude možné tipovať iba zápasy La Ligy.
            </li>
          </ul>
        </v-col>
        <v-col class="order-md-2" cols="12" md="6" align="center">
          <v-img src="/undraw_game_day.svg" contain width="80%" max-height="250" />
        </v-col>
      </v-row>
      <v-row justify="center" align="center" class="pa-4">
        <v-col order="2" order-md="1" cols="12" md="6" align="center">
          <v-img src="/undraw_spreadsheets.svg" width="80%" contain max-height="250" />
        </v-col>
        <v-col order="1" order-md="2" cols="12" md="6">
          <div class="text-h4 font-weight-bold pb-3">Bodovanie</div>
          <ul>
            <li class="py-1">Správny výsledok zápasu (1/X/2) = <b>1 bod</b></li>
            <li class="py-1">Presné skóre zápasu = <b>3 bod</b></li>
            <li class="py-1">Správny strelec gólu = <b>1 bod</b></li>
          </ul>
          <v-divider class="my-3"></v-divider>
          <ul>
            <li class="py-1">
              Pri uhádnutí presného skóre sa body za spravny výsledok a presné skóre nesčítavajú.
              Užívateľ obdrží 3 body <i>(namiesto 4 bodov)</i>.
            </li>
            <li class="py-1">
              Maximálny počet zísakných bodov za zápas je 4. Na dosiahnutie maximálneho počtu bodov
              musí užívateľ správne tipnúť skóre zápasu <i>(3 body)</i> a správneho strelca
              <i>(1 bod)</i>.
            </li>
            <li class="py-1">
              Ak užívateľ uhádne strelca zápasu, no neuhádne výsledok, 1 bod
              <i>(za správneho strelca)</i> mu bude aj napriek tomu pripísaný.
            </li>
          </ul>
        </v-col>
      </v-row>
      <v-row justify="center" align="center" class="ma-4">
        <v-col cols="12" md="6">
          <div class="text-h4 font-weight-bold pb-3">Ceny pre víťazov</div>
          <v-row>
            <v-col cols="12">
              <v-card dark raised class="pa-4" rounded="lg" color="card">
                <v-card-title>
                  <v-icon left color="yellow darken-1"> mdi-medal </v-icon>
                  <span class="text-subtitle-1">1. Miesto</span>
                </v-card-title>
                <v-card-text>
                  <ul>
                    <li>
                      200 € na nákup oficiálnych produktov Realu Madrid alebo iný tovar z eshopu
                      <a href="https://11teamsports.sk/?a_box=hqzugtck">11teamsports.sk</a>
                    </li>
                  </ul></v-card-text
                >
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card dark raised class="pa-4" rounded="lg" color="card">
                <v-card-title>
                  <v-icon
                    left
                    color="blue-grey lighten-5
"
                  >
                    mdi-medal
                  </v-icon>
                  <span class="text-subtitle-1">2. Miesto</span>
                </v-card-title>
                <v-card-text>
                  <ul>
                    <li>
                      100 € na nákup oficiálnych produktov Realu Madrid alebo iný tovar z eshopu
                      <a href="https://11teamsports.sk/?a_box=hqzugtck">11teamsports.sk</a>
                    </li>
                  </ul></v-card-text
                >
              </v-card></v-col
            >
            <v-col cols="12">
              <v-card dark raised class="pa-4" rounded="lg" color="card">
                <v-card-title>
                  <v-icon
                    left
                    color="yellow darken-3
"
                  >
                    mdi-medal
                  </v-icon>
                  <span class="text-subtitle-1">3. Miesto</span>
                </v-card-title>
                <v-card-text>
                  <ul>
                    <li>
                      50 € na nákup oficiálnych produktov Realu Madrid alebo iný tovar z eshopu
                      <a href="https://11teamsports.sk/?a_box=hqzugtck">11teamsports.sk</a>
                    </li>
                  </ul></v-card-text
                >
              </v-card></v-col
            >
          </v-row>
        </v-col>
        <v-col cols="12" md="6" align="center">
          <v-img src="/undraw_fans.svg" contain width="80%" max-height="250" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<router>
{
    name: "Pravidlá"
}
</router>
