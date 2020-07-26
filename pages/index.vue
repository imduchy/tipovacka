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
          The last game
        </v-card-title>
        <v-card-text>
          <p>
            Vuetify is a progressive Material Design component framework for
            Vue.js. It was designed to empower developers to create amazing
            applications.
          </p>
          <p>
            For more information on Vuetify, check out the
            <a
              href="https://vuetifyjs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation </a
            >.
          </p>
          <p>
            If you have questions, please join the official
            <a
              href="https://chat.vuetifyjs.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="chat"
            >
              discord </a
            >.
          </p>
          <p>
            Find a bug? Report it on the github
            <a
              href="https://github.com/vuetifyjs/vuetify/issues"
              target="_blank"
              rel="noopener noreferrer"
              title="contribute"
            >
              issue board </a
            >.
          </p>
          <p>
            Thank you for developing with Vuetify and I look forward to bringing
            more exciting features in the future.
          </p>
          <div class="text-xs-right">
            <em><small>&mdash; John Leider</small></em>
          </div>
          <hr class="my-3" />
          <a
            href="https://nuxtjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nuxt Documentation
          </a>
          <br />
          <a
            href="https://github.com/nuxt/nuxt.js"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nuxt GitHub
          </a>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" nuxt to="/inspire">
            Continue
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
