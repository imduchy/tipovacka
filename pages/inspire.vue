<template>
  <v-row>
    <v-col cols="12">
      <v-data-table
        :headers="[
          { text: 'Name', value: 'name' },
          { text: 'Points', value: 'points' },
          { text: 'Bets', value: 'bets' },
        ]"
        :items="[
          { name: 'Jakub', points: 10, bets: 9 },
          { name: 'Martin', points: 11, bets: 9 },
          { name: 'David', points: 2, bets: 9 },
          { name: 'Lukas', points: 0, bets: 9 },
          { name: 'Jozef', points: 0, bets: 9 },
          { name: 'Cristiano', points: 1, bets: 9 },
          { name: 'Alex', points: 6, bets: 9 },
          { name: 'Jan', points: 12, bets: 9 },
          { name: 'Michal', points: 9, bets: 9 },
          { name: 'Tomas', points: 7, bets: 9 },
          { name: 'Diana', points: 8, bets: 9 },
          { name: 'Alica', points: 5, bets: 9 },
          { name: 'Natalia', points: 5, bets: 9 },
          { name: 'Kamil', points: 5, bets: 9 },
          { name: 'Kamila', points: 12, bets: 9 },
          { name: 'David', points: 13, bets: 9 },
          { name: 'Tomas', points: 13, bets: 9 },
          { name: 'Marta', points: 24, bets: 9 },
        ]"
        :sort-by="['points']"
        :sort-desc="[true]"
        :items-per-page="30"
        hide-default-footer
        class="elevation-1"
      >
      </v-data-table>
    </v-col>
  </v-row>
</template>
