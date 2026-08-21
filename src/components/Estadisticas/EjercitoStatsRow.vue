<template>
  <v-row class="text-left align-center py-1" dense>
    <v-col cols="1" class="text-center">
      <span class="font-weight-bold text-caption">{{ posicion }}</span>
    </v-col>
    <v-col cols="5">
      <span class="font-weight-medium">{{ stats.ejercito }}</span>
    </v-col>
    <v-col cols="3" class="text-center">
      <v-progress-linear
        :model-value="stats.winRate"
        :color="color"
        bg-color="grey-lighten-3"
        height="18"
        rounded
      >
        <template #default>
          <span class="text-caption font-weight-bold" style="color: white">
            {{ stats.winRate.toFixed(1) }}%
          </span>
        </template>
      </v-progress-linear>
    </v-col>
    <v-col cols="3" class="text-right text-caption text-medium-emphasis">
      {{ stats.victorias }}V / {{ stats.empates }}E / {{ stats.derrotas }}D
      <br />
      <span class="text-caption">
        ({{ stats.totalPartidas }} partidas)
      </span>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { EjercitoStatsDTO } from "@/interfaces/Estadisticas";

defineProps<{
  stats: EjercitoStatsDTO;
  posicion: number;
  color: string;
}>();
</script>
