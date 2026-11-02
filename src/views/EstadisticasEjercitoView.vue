<template>
  <v-container class="estadisticas text-left">
    <FiltrosEstadisticas v-model="filtro" con-bando />
    <RankingEjercitos :filtro="filtro" @ver="abrirFicha" />
    <FichaEjercito v-model="verFicha" :ejercito="ejercitoVisto" :filtro="filtro" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FiltroEstadisticas } from "@/interfaces/Estadisticas";
import FiltrosEstadisticas from "@/components/Estadisticas/Ejercitos/FiltrosEstadisticas.vue";
import RankingEjercitos from "@/components/Estadisticas/Ejercitos/RankingEjercitos.vue";
import FichaEjercito from "@/components/Estadisticas/Ejercitos/FichaEjercito.vue";

// Se empieza por la temporada actual, con todos los puntos y sin amistosas
const filtro = ref<FiltroEstadisticas>({ temporada: new Date().getFullYear(), tramo: null, bando: null, amistosas: false });

const verFicha = ref(false);
const ejercitoVisto = ref<string | null>(null);
const abrirFicha = (ejercito: string) => {
  ejercitoVisto.value = ejercito;
  verFicha.value = true;
};
</script>

<style scoped>
/* En el móvil a todo lo ancho; en el ordenador, sin estirarse */
.estadisticas {
  max-width: 720px;
}
</style>
