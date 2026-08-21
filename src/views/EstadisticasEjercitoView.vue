<template>
  <v-container class="text-center">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>

    <div v-else>
      <h2 class="text-h5 font-weight-bold mb-4">
        <v-icon color="primary" class="mr-2">mdi-sword-cross</v-icon>
        Estadísticas de Ejércitos en Torneos
      </h2>

      <v-tabs v-model="tab" color="primary" grow class="mb-4">
        <v-tab value="ranking">
          <v-icon start>mdi-trophy</v-icon>
          General
        </v-tab>
        <v-tab value="filtro">
          <v-icon start>mdi-filter-variant</v-icon>
          Filtrar 
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="ranking">
          <TopBandosCard
            :data="mostrarTodo ? topBandosTodo : topBandos"
            :mostrarTodo="mostrarTodo"
            :isLoadingTodo="isLoadingTodo"
            @toggle="mostrarTodo ? (mostrarTodo = false) : cargarTodo()"
          />
        </v-tabs-window-item>

        <v-tabs-window-item value="filtro">
          <FiltroRatingEjercito />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getTopEjercitosPorBando } from "@/services/EstadisticasService";
import type { TopBandosResponseDTO } from "@/interfaces/Estadisticas";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import TopBandosCard from "@/components/Estadisticas/TopBandosCard.vue";
import FiltroRatingEjercito from "@/components/Estadisticas/FiltroRatingEjercito.vue";

const tab = ref<string>("ranking");
const isLoading = ref(true);
const isLoadingTodo = ref(false);
const mostrarTodo = ref(false);
const topBandos = ref<TopBandosResponseDTO | null>(null);
const topBandosTodo = ref<TopBandosResponseDTO | null>(null);

onMounted(async () => {
  try {
    topBandos.value = await getTopEjercitosPorBando(3);
  } catch (e) {
    console.error("Error al cargar estadísticas", e);
  } finally {
    isLoading.value = false;
  }
});

async function cargarTodo() {
  isLoadingTodo.value = true;
  try {
    topBandosTodo.value = await getTopEjercitosPorBando(999);
    mostrarTodo.value = true;
  } catch (e) {
    console.error("Error al cargar ranking completo", e);
  } finally {
    isLoadingTodo.value = false;
  }
}
</script>
