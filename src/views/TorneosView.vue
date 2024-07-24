<template>
  <v-container>
    <v-row dense justify="center" style="height: 100vh">
      <div v-if="isLoading">
        <v-row justify="center" style="height: 100px">
          <v-col cols="12" class="text-center">
            <ProgressCircular />
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <div v-if="listaTorneos.length < 1">No hay tornes proximamente...</div>
        <v-window v-model="activeTorneo" show-arrows>
          <v-window-item
            v-for="torneo in listaTorneos"
            :key="torneo.idTorneo"
            :value="torneo.idTorneo"
          >
            <TorneoCard :torneo="torneo" />
          </v-window-item>
        </v-window>
      </div>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { getTorneos } from "@/services/TorneosService";
import { onMounted, ref } from "vue";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";

const listaTorneos = ref<Torneo[]>([]);
const isLoading = ref(true);
const activeTorneo = ref<number | null>(null);

onMounted(async () => {
  listaTorneos.value = await getTorneos();
  listaTorneos.value = listaTorneos.value.sort(
    (a, b) =>
      new Date(a.fechaInicioTorneo).getTime() -
      new Date(b.fechaInicioTorneo).getTime()
  );
  isLoading.value = false;
  if (listaTorneos.value.length > 0) {
    activeTorneo.value = listaTorneos.value[0].idTorneo;
  }
});
</script>

<style scoped>
/* Puedes añadir estilos adicionales si es necesario */
</style>
