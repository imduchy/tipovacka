<template>
  <v-data-table
    class="card"
    hide-default-footer
    :items-per-page="itemsPerPage"
    :mobile-breakpoint="false"
    dense
    :headers="headers"
    :items="competition.standings"
  >
    <template #[`item.teamName`]="{ item }">
      <v-avatar class="float-left mr-2" tile size="18px">
        <v-img :src="item.teamLogo"> </v-img>
      </v-avatar>
      <div class="pl-2">{{ item.teamName }}</div>
    </template>

    <template #[`item.form`]="{ item }">
      <v-chip
        v-for="(result, index) in item.form"
        :key="index"
        class="form-chip"
        :ripple="false"
        x-small
        :color="getChipColor(result)"
        dark
      >
        {{ result }}
      </v-chip>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { ICompetition } from '@tipovacka/models';

export default defineComponent({
  props: {
    competition: {
      type: Object as PropType<ICompetition>,
      required: true,
    },
  },
  setup() {
    const itemsPerPage = -1;
    const headers = [
      {
        text: '#',
        value: 'rank',
      },
      {
        text: 'Team',
        value: 'teamName',
        width: 200,
      },
      {
        text: 'MP',
        value: 'played',
      },
      {
        text: 'W',
        value: 'won',
      },
      {
        text: 'D',
        value: 'draw',
      },
      {
        text: 'L',
        value: 'lost',
      },
      {
        text: 'GF',
        value: 'goalsFor',
      },
      {
        text: 'GA',
        value: 'goalsAgainst',
      },
      {
        text: 'Pts',
        value: 'points',
        cellClass: 'font-weight-bold',
      },
      {
        text: 'Form',
        value: 'form',
        width: 152,
      },
    ];

    const getChipColor = (letter: string): string => {
      if (letter.toLowerCase() === 'w') {
        return 'green';
      } else if (letter.toLowerCase() === 'd') {
        return 'yellow darken-3';
      } else if (letter.toLowerCase() === 'l') {
        return 'red';
      } else {
        return 'gray';
      }
    };

    return { headers, itemsPerPage, getChipColor };
  },
});
</script>

<style>
.form-chip {
  justify-content: center;
  padding: 10px 0px;
  margin: 0px 2px;
  height: 20px;
  width: 20px;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > tbody > tr > th,
.v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > th {
  padding: 0 10px !important ;
}
</style>
