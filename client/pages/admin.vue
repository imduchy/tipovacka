<template>
  <v-row :class="{ 'align-self-center': $fetchState.pending }">
    <v-col v-if="$fetchState.pending" class="text-center" cols="12">
      <v-progress-circular
        :size="70"
        :width="7"
        color="secondary"
        indeterminate
      ></v-progress-circular>
      <div class="text-overline ma-3">Načítam dáta...</div>
    </v-col>
    <v-col v-else cols="12">
      <v-card color="#f5f5f5">
        <v-card-title>
          Užívatelia
          <v-spacer></v-spacer>
          <v-dialog
            v-model="addUserDialog"
            max-width="800px"
            @click:outside="closeAddUserDialog"
          >
            <template #activator="{ on, attrs }">
              <v-btn color="secondary" dark class="mb-2" v-bind="attrs" v-on="on">
                + Pridať
              </v-btn>
            </template>
            <v-card class="pa-4">
              <v-card-title>
                <span class="text-h5">Pridať užívateľa</span>
              </v-card-title>

              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedUser.username"
                      dense
                      hide-details
                      outlined
                      label="Užívateľské meno"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedUser.email"
                      hide-details
                      dense
                      outlined
                      label="Email"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedUser.password"
                      dense
                      hide-details
                      outlined
                      type="password"
                      label="Heslo"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedUser.password2"
                      dense
                      hide-details
                      outlined
                      type="password"
                      label="Zopakuj heslo"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="editedUser.active"
                      hide-details
                      dense
                      label="Aktívny"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="editedUser.admin"
                      hide-details
                      dense
                      label="Admin"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" dark @click="closeAddUserDialog">Zrušiť</v-btn>
                <v-btn color="secondary" @click="addUser">Uložiť</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog
            v-model="editUserDialog"
            max-width="800px"
            @click:outside="closeEditUserDialog"
          >
            <v-card class="pa-4">
              <v-card-title>
                <span class="text-h5">Upraviť užívateľa</span>
              </v-card-title>

              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedUser.username"
                      dense
                      hide-details
                      outlined
                      label="Užívateľské meno"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="editedUser.email"
                      hide-details
                      dense
                      outlined
                      label="Email"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="editedUser.active"
                      hide-details
                      dense
                      label="Aktívny"
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="editedUser.admin"
                      hide-details
                      dense
                      label="Admin"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" dark @click="closeEditUserDialog">Zrušiť</v-btn>
                <v-btn color="secondary" @click="editUser">Uložiť</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-title>
        <v-data-table
          :headers="[
            { text: 'Meno', value: 'username' },
            { text: 'Email', value: 'email' },
            { text: 'Registrovaný', value: 'createdAt', filterable: false },
            { text: 'Aktívny', value: 'active', filterable: false },
            { text: 'Akcie', value: 'actions', sortable: false, filterable: false },
          ]"
          :items="users"
          :search="search"
          :sort-desc="[true]"
          :items-per-page="30"
          mobile-breakpoint="0"
          class="elevation-1 custom-header"
          :footer-props="{
            itemsPerPageOptions: [10, 20, 30, -1],
            itemsPerPageAllText: 'Všetky',
            itemsPerPageText: 'Riadky na stranu',
          }"
        >
          <template #top>
            <v-toolbar color="#f5f5f5" flat>
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Hľadať"
                outlined
                background-color="white"
                dense
                single-line
                hide-details
              ></v-text-field>
              <v-dialog v-model="deleteUserDialog" max-width="500px">
                <v-card class="pa-4">
                  <v-card-title class="text-h5">Vymazať užívateľa</v-card-title>
                  <v-card-text>
                    <p>Naozaj chceš vymazať užívateľa {{ editedUser.username }}?</p>
                    <p class="font-weight-bold">
                      Vymazaním užívateľa vymažeš aj všetky informácie spojené z jeho
                      účtom vrátane tipov a bodov z jednotlivych sezón.
                    </p>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="grey"
                      dark
                      @click:outside="closeDeleteUserDialog"
                      @click="closeDeleteUserDialog"
                      >Zrušiť</v-btn
                    >
                    <v-btn color="secondary" @click="deleteUser">Áno</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template #item.active="{ item }">
            <v-simple-checkbox
              id="disabled-icon-success"
              v-model="item.active"
              disabled
            ></v-simple-checkbox>
          </template>
          <template #item.actions="{ item }">
            <v-icon small class="mr-2" @click="openEditUserDialog(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="openDeleteUserDialog(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { IUser } from '@duchynko/tipovacka-models';
import Vue from 'vue';
export default Vue.extend({
  middleware: ['auth', 'authenticator'],
  data: () => ({
    search: '',
    editUserDialog: false,
    deleteUserDialog: false,
    addUserDialog: false,
    rawUsers: [] as IUser[],
    editedIndex: -1,
    editedUser: {
      username: '',
      email: '',
      password: '',
      password2: '',
      active: true,
      admin: false,
    },
    emptyUser: {
      username: '',
      email: '',
      password: '',
      password2: '',
      active: true,
      admin: false,
    },
  }),
  async fetch() {
    this.rawUsers = await this.$axios.$get('/groups/users', {
      params: { group: this.$store.state.group._id },
    });
  },
  computed: {
    users() {
      return this.rawUsers.map((rawUser) => {
        const user = rawUser as IUser & { createdAt: string };
        return {
          ...user,
          createdAt: new Date(user.createdAt).toLocaleDateString('sk-SK'),
          active: true,
          admin: user.scope === 'admin',
        };
      });
    },
  },
  methods: {
    closeAddUserDialog() {
      this.addUserDialog = false;
      this.$nextTick(() => {
        this.editedUser = Object.assign({}, this.emptyUser);
        this.editedIndex = -1;
      });
    },
    addUser() {
      console.log('Adding user', this.editedUser);
      this.closeAddUserDialog();
    },
    openEditUserDialog(
      item: IUser & { createdAt: string; active: boolean; admin: boolean }
    ) {
      this.editedIndex = this.users.indexOf(item);
      this.editedUser = Object.assign(
        {},
        {
          username: item.username,
          email: item.email,
          password: '',
          password2: '',
          active: item.active,
          admin: item.admin,
        }
      );
      this.editUserDialog = true;
    },
    closeEditUserDialog() {
      this.editUserDialog = false;
      this.$nextTick(() => {
        this.editedUser = Object.assign({}, this.emptyUser);
        this.editedIndex = -1;
      });
    },
    editUser() {
      console.log('Editting user', this.editedUser);
      this.closeEditUserDialog();
    },
    openDeleteUserDialog(
      item: IUser & { createdAt: string; active: boolean; admin: boolean }
    ) {
      this.editedIndex = this.users.indexOf(item);
      this.editedUser = Object.assign(
        {},
        {
          username: item.username,
          email: item.email,
          password: '',
          password2: '',
          active: item.active,
          admin: item.admin,
        }
      );
      this.deleteUserDialog = true;
    },
    closeDeleteUserDialog() {
      this.deleteUserDialog = false;
      this.$nextTick(() => {
        this.editedUser = Object.assign({}, this.emptyUser);
        this.editedIndex = -1;
      });
    },
    deleteUser() {
      console.log('Deleting the user', this.editedUser);
      this.closeDeleteUserDialog();
    },
  },
});
</script>

<style>
.custom-header div table thead {
  background-color: #f5f5f5;
}

#disabled-icon-success > div > i {
  color: var(--v-success-base) !important;
}
</style>
