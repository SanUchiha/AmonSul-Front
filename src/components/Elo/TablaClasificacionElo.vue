<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2"
      >Clasificación ELO

      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        density="compact"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
    </v-card-title>

    <v-divider></v-divider>
    <v-divider></v-divider>
    <v-data-table
      v-model:search="search"
      :items="items"
      :loading="loading"
      class="custom-table"
    >
      <template v-slot:item.elo="{ item }">
        <v-chip color="blue" dark>{{ item.elo }}</v-chip>
      </template>
      <template v-slot:item.win="{ item }">
        <v-chip color="green" dark>{{ item.win }}</v-chip>
      </template>
      <template v-slot:item.draw="{ item }">
        <v-chip color="yellow" dark>{{ item.draw }}</v-chip>
      </template>
      <template v-slot:item.lost="{ item }">
        <v-chip color="red" dark>{{ item.lost }}</v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { UsuarioElo } from "@/interfaces/Elo";
import { getClasifiacionElo } from "@/services/EloService";
import { onMounted, ref } from "vue";
import {
  VDataTable,
  VCard,
  VCardTitle,
  VDivider,
  VTextField,
} from "vuetify/components";

const search = ref<string>("");
const items = ref<UsuarioElo[]>([]);
const loading = ref<boolean>(true);

// const headers = [
//   { title: "NICK", key: "nick" },
//   { title: "EMP", key: "draw" },
//   { title: "ELO", key: "elo" },
//   { title: "NUM", key: "games" },
//   { title: "DER", key: "Lost" },
//   { title: "VIC", key: "win" },
// ];

onMounted(async () => {
  try {
    items.value = [];

    const data = await getClasifiacionElo();
    items.value = data;
    items.value = items.value.sort((a, b) => b.elo - a.elo);
    console.log(items.value);
  } catch (error) {
    console.error("Error al obtener la clasificación de Elo:", error);
  } finally {
    loading.value = false; // Indica que la carga ha finalizado
  }
});
</script>

<style scoped>
.custom-table {
  text-align: center;
}

.v-data-table-header {
  text-align: center;
}
</style>
