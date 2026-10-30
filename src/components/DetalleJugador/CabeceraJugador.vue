<template>
  <!-- Lo esencial del jugador, siempre a la vista encima de las pestañas -->
  <v-card class="mb-3 pa-3 text-left" elevation="2">
    <div class="d-flex align-center ga-3">
      <v-avatar size="72">
        <!-- Sin foto, un Señor Oscuro de anime en vez del avatar genérico -->
        <v-img :src="usuario.imagen || avatarSinFoto" alt="Avatar" cover />
      </v-avatar>
      <div class="flex-grow-1 min-w-0">
        <h1 class="text-h6 font-weight-bold text-wrap">{{ usuario.nick }}</h1>
        <div
          v-if="usuario.faccion?.nombreFaccion"
          class="text-body-2 text-medium-emphasis text-wrap"
        >
          {{ usuario.faccion.nombreFaccion }}
        </div>
        <div class="d-flex flex-wrap align-center ga-1 mt-1">
          <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-chart-line">
            {{ usuario.puntuacionElo }} ELO
          </v-chip>
          <v-chip v-if="usuario.clasificacionElo > 0" size="small" variant="tonal">
            #{{ usuario.clasificacionElo }} clasificación
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Racha: las últimas partidas jugadas, la más reciente a la izquierda -->
    <div v-if="racha.length > 0" class="mt-3">
      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="partida in racha"
          :key="partida.clave"
          size="small"
          label
          :color="colorResultado(partida.resultado)"
          :title="`${textoResultado(partida.resultado)} ${partida.propios}-${partida.rival} contra ${partida.nickRival}`"
        >
          {{ partida.resultado }}
        </v-chip>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { PartidaJugada, ResultadoPartida } from "@/utils/historialJugador";
import avatarSinFoto from "@/assets/icons/sauron-anime.svg";

const props = defineProps<{
  usuario: UsuarioDataDTO;
  // Ya ordenadas de la más reciente a la más antigua
  partidas: PartidaJugada[];
}>();

const racha = computed(() => props.partidas.slice(0, 5));

const colorResultado = (resultado: ResultadoPartida) =>
  resultado === "V" ? "success" : resultado === "D" ? "error" : "grey";
const textoResultado = (resultado: ResultadoPartida) =>
  resultado === "V" ? "Victoria" : resultado === "D" ? "Derrota" : "Empate";
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}
</style>
