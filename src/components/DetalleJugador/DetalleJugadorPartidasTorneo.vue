<template>
  <div v-if="!props.isLoading && (props.tournamentMatches?.length ?? 0) > 0">
    <v-card class="section-card stats-section pt-0 mt-0">
      <v-col cols="12">
        <p class="text-h5 ringbearer">Partidas de torneo</p>
      </v-col>
      <v-divider></v-divider>
      <v-col cols="12">
        <EstadisticasPartidasTorneoBar
          :tournamentMatches="props.tournamentMatches"
          :idUsuario="props.idUsuario"
          @filtroCambiar="filtroActivo = $event"
        />
      </v-col>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="6"
          lg="4"
          xl="4"
          class="pb-0"
          v-for="match in partidasFiltradas"
          :key="match.idPartidaTorneo"
        >
          <CardPartidaTorneo
            :idUsuario="props.idUsuario"
            :match="match"
            class="mb-4"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
  <div v-else>
    <h3>No tiene partidas de torneo</h3>
  </div>
  <v-divider class="my-3"></v-divider>
</template>

<script setup lang="ts">
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import CardPartidaTorneo from "../PartidasTorneo/CardPartidaTorneo.vue";
import EstadisticasPartidasTorneoBar from "./EstadisticasPartidasTorneoBar.vue";
import { computed, ref } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps<{
  isLoading: boolean;
  tournamentMatches: ViewPartidaTorneoDTO[];
  idUsuario: number;
}>();

const filtroActivo = ref<"win" | "loss" | "draw" | null>(null);

const partidasFiltradas = computed(() => {
  if (!filtroActivo.value) return props.tournamentMatches;
  if (filtroActivo.value === "win") {
    return props.tournamentMatches.filter(
      p => p.ganadorPartidaTorneo === props.idUsuario
    );
  }
  if (filtroActivo.value === "draw") {
    return props.tournamentMatches.filter(
      p => p.ganadorPartidaTorneo === null || p.ganadorPartidaTorneo === 0
    );
  }
  if (filtroActivo.value === "loss") {
    return props.tournamentMatches.filter(
      p =>
        p.ganadorPartidaTorneo !== null &&
        p.ganadorPartidaTorneo !== 0 &&
        p.ganadorPartidaTorneo !== props.idUsuario
    );
  }
  return props.tournamentMatches;
});
</script>
