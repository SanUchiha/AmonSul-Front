<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else class="center">
    <v-table :loading="isLoading">
      <thead>
        <tr>
          <th class="text-center">Nombre torneo</th>
          <th class="text-center">Ver torneo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="torneo in listaTorneos" :key="torneo.idTorneo">
          <td>{{ torneo.nombreTorneo }}</td>
          <td class="text-center">
            <v-btn icon @click="verTorneo(torneo.idTorneo)">
              <v-icon color="orange">mdi-eye</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import router from "@/router";
import { getTorneos } from "@/services/TorneosService";
import { Torneo } from "@/interfaces/Torneo";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";

const listaTorneos = ref<Torneo[]>([]);
const isLoading = ref<boolean>(false);

onMounted(async () => {
  isLoading.value = true;
  const response = await getTorneos();
  listaTorneos.value = response.data;

  isLoading.value = false;
});

const verTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-live", params: { idTorneo } });
};
</script>
