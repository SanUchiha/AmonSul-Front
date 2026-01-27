<template>
  <div v-if="!props.isLoading && (props.amistosasMatches?.length ?? 0) > 0">
    <v-card class="section-card stats-section pt-0 mt-0">
      <v-col cols="12">
        <p class="text-h5 ringbearer">Partidas amistosas</p>
      </v-col>
      <v-divider></v-divider>
      <v-col cols="12">
        <EstadisticasPartidasAmistosasBar
          :amistosasMatches="props.amistosasMatches"
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
          :key="match.idPartidaAmistosa"
        >
          <ValidadasMatchCard
            :idUsuario="props.idUsuario"
            :match="match"
            class="mb-4"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
  <div v-else>
    <h3>No tienes partidas amistosas</h3>
  </div>
  <v-divider class="my-3"></v-divider>
</template>

<script setup lang="ts">
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import ValidadasMatchCard from "../PartidaAmistosa/ValidadasMatchCard.vue";
import EstadisticasPartidasAmistosasBar from "@/components/DetalleJugador/EstadisticasPartidasAmistosasBar.vue";
import { ref, computed } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps<{
  isLoading: boolean;
  amistosasMatches: ViewPartidaAmistosaDTO[];
  idUsuario: number;
}>();

const filtroActivo = ref<"win" | "loss" | "draw" | null>(null);

const partidasFiltradas = computed(() => {
  if (!filtroActivo.value) return props.amistosasMatches;
  if (filtroActivo.value === "win") {
    return props.amistosasMatches.filter(
      p => p.ganadorPartida === props.idUsuario
    );
  }
  if (filtroActivo.value === "draw") {
    return props.amistosasMatches.filter(
      p => p.ganadorPartida === null || p.ganadorPartida === 0
    );
  }
  if (filtroActivo.value === "loss") {
    return props.amistosasMatches.filter(
      p =>
        p.ganadorPartida !== null &&
        p.ganadorPartida !== 0 &&
        p.ganadorPartida !== props.idUsuario
    );
  }
  return props.amistosasMatches;
});
</script>
