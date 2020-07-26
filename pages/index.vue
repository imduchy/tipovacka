<template>
  <v-row column justify-center align-center>
    <v-col xs12 sm8 md6>
      <div class="text-h4" align="center">Upcoming game</div>
      <v-row align="center">
        <v-col align="center">
          <v-img :src="response.teams.home.logo" height="100px" width="100px" />
          <div class="text-h5">{{ response.teams.home.name }}</div>
        </v-col>
        <div class="text-h4">vs</div>
        <v-col align="center">
          <v-img :src="response.teams.away.logo" height="100px" width="100px" />
          <div class="text-h5">{{ response.teams.away.name }}</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col align="center">
          <span class="text-caption"
            ><i>{{ new Date(response.fixture.date).toUTCString() }}</i></span
          >
          <br />
          <span class="text-overline"
            >In {{ response.fixture.venue.name }} ({{
              response.fixture.venue.city
            }})</span
          >
        </v-col>
      </v-row>
      <v-card>
        <v-card-title class="headline">
          Bet
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-radio-group v-model="resultChoiceGroup" row :rules="[]">
              <v-row justify="space-around">
                <v-radio :label="response.teams.home.name" value="1"></v-radio>
                <v-radio label="Draw" value="0"></v-radio>
                <v-radio :label="response.teams.away.name" value="2"></v-radio>
              </v-row>
            </v-radio-group>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  type="number"
                  :label="`${response.teams.home.name} score`"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  type="number"
                  :label="`${response.teams.away.name} score`"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt to="/inspire">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import mockFixture from '../mocks/lastFixture.json'

export default {
  data() {
    return {
      response: {
        teams: {
          home: {
            logo: '',
          },
          away: {
            logo: '',
          },
        },
        fixture: {
          venue: {
            name: '',
          },
        },
      },
    }
  },
  async created() {
    this.response = await mockFixture.response[0]
  },
}
</script>
