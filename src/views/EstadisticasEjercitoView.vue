<template>
  <v-container class="estadisticas text-left">
    <v-chip-group v-model="seccion" mandatory selected-class="text-primary" class="mb-1 secciones">
      <v-chip value="ejercitos" filter>Ejércitos</v-chip>
      <v-chip value="cruces" filter>Cruces</v-chip>
      <v-chip value="jugadores" filter>Jugadores</v-chip>
    </v-chip-group>

    <!-- Cómo se calcula, plegado para no quitar sitio -->
    <div class="text-center mb-1">
      <v-btn
        variant="text"
        size="small"
        color="primary"
        class="text-none"
        prepend-icon="mdi-information-outline"
        @click="verComo = !verComo"
      >
        ¿Cómo se calcula?
      </v-btn>
    </div>
    <v-expand-transition>
      <v-card v-if="verComo" variant="tonal" class="pa-4 mb-3">
        <ComoSeCalcula />
      </v-card>
    </v-expand-transition>

    <!-- El bando solo filtra el ranking: en los cruces se elige el rival -->
    <FiltrosEstadisticas v-model="filtro" :con-bando="seccion === 'ejercitos'" />

    <!-- Cada sección guarda lo que tenía al cambiar de una a otra; cruces y jugadores se cargan la primera vez que se abren -->
    <RankingEjercitos v-show="seccion === 'ejercitos'" :filtro="filtro" @ver="abrirFicha" />
    <CrucesEjercitos v-if="abiertas.cruces" v-show="seccion === 'cruces'" :filtro="filtro" :inicial="cruceInicial" />
    <JugadoresEjercitos
      v-if="abiertas.jugadores"
      v-show="seccion === 'jugadores'"
      :filtro="filtro"
      :jugadorInicial="jugadorInicial"
      @ver="abrirFicha"
    />

    <FichaEjercito v-model="verFicha" :ejercito="ejercitoVisto" :filtro="filtro" @cruce="verCruce" />
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { FiltroEstadisticas } from "@/interfaces/Estadisticas";
import FiltrosEstadisticas from "@/components/Estadisticas/Ejercitos/FiltrosEstadisticas.vue";
import RankingEjercitos from "@/components/Estadisticas/Ejercitos/RankingEjercitos.vue";
import CrucesEjercitos from "@/components/Estadisticas/Ejercitos/CrucesEjercitos.vue";
import JugadoresEjercitos from "@/components/Estadisticas/Ejercitos/JugadoresEjercitos.vue";
import FichaEjercito from "@/components/Estadisticas/Ejercitos/FichaEjercito.vue";
import ComoSeCalcula from "@/components/Estadisticas/Ejercitos/ComoSeCalcula.vue";

type Seccion = "ejercitos" | "cruces" | "jugadores";
const SECCIONES: Seccion[] = ["ejercitos", "cruces", "jugadores"];

const route = useRoute();
const router = useRouter();
const verComo = ref(false);

// La sección va en la URL (?seccion=cruces): al recargar se queda donde estaba. La ficha de un jugador enlaza aquí
// con ?seccion=jugadores&jugador=id
const pedida = String(route.query.seccion ?? "") as Seccion;
const seccion = ref<Seccion>(SECCIONES.includes(pedida) ? pedida : "ejercitos");
const abiertas = reactive({ cruces: seccion.value === "cruces", jugadores: seccion.value === "jugadores" });
const jugadorInicial = ref<number | null>(Number(route.query.jugador) || null);
watch(seccion, valor => {
  if (valor === "cruces") abiertas.cruces = true;
  if (valor === "jugadores") abiertas.jugadores = true;
  if (route.query.seccion !== valor) router.replace({ query: { ...route.query, seccion: valor } });
});

// Se empieza por la temporada actual, con todos los puntos y sin amistosas. Desde la ficha de un jugador, con todo, como
// cuenta sus partidas la ficha
const filtro = ref<FiltroEstadisticas>(
  jugadorInicial.value
    ? { temporada: null, tramo: null, bando: null, amistosas: true }
    : { temporada: new Date().getFullYear(), tramo: null, bando: null, amistosas: false }
);

const verFicha = ref(false);
const ejercitoVisto = ref<string | null>(null);
const abrirFicha = (ejercito: string) => {
  ejercitoVisto.value = ejercito;
  verFicha.value = true;
};

// Desde la ficha, un rival lleva a su cruce
const cruceInicial = ref<{ ejercito: string; rival: string } | null>(null);
const verCruce = (cruce: { ejercito: string; rival: string }) => {
  verFicha.value = false;
  cruceInicial.value = { ...cruce };
  seccion.value = "cruces";
};
</script>

<style scoped>
/* En el móvil a todo lo ancho; en el ordenador, sin estirarse */
.estadisticas {
  max-width: 720px;
}

/* Las secciones, centradas */
.secciones :deep(.v-slide-group__content) {
  justify-content: center;
}
</style>
