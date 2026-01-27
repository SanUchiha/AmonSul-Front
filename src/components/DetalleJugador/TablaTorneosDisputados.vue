<template>
  <v-card class="section-card stats-section pt-0 mt-0">
    <v-col cols="12">
      <p class="text-h5 ringbearer">Clasificación en Torneos</p>
    </v-col>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="clasificacionTorneos"
      class="elevation-1"
      :items-per-page="10"
      :search="search"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Buscar torneo"
          class="mx-4 my-2"
          clearable
        />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
const props = defineProps<{
  clasificacionTorneos: { nombreTorneo: string; resultado: number }[];
}>();

const search = ref("");

const headers = [
  { title: "Nombre Torneo", key: "nombreTorneo" },
  { title: "Resultado", key: "resultado" },
];
</script>
