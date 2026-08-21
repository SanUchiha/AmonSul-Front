<template>
  <v-row v-if="data">
    <v-col cols="12">
      <v-alert type="info" variant="tonal" density="compact" class="mb-3" icon="mdi-information-outline">
        Solo se muestran ejércitos con un mínimo de <strong>20 partidas</strong> jugadas desde el <strong>01/01/2025</strong>.
      </v-alert>
    </v-col>

    <!-- BIEN (good) -->
    <v-col cols="12" md="6">
      <v-card class="pa-3" elevation="2">
        <v-card-title class="d-flex align-center gap-2">
          Luz
        </v-card-title>

        <v-divider class="mb-3" />

        <p class="text-subtitle-2 text-green-darken-3 font-weight-bold mb-1">
          Top {{ data.bien.mejores.length }}
        </p>
        <EjercitoStatsRow
          v-for="(item, i) in data.bien.mejores"
          :key="'bien-mejor-' + i"
          :stats="item"
          :posicion="i + 1"
          color="green-darken-2"
        />

        <v-divider class="my-3" />

        <p class="text-subtitle-2 text-red-darken-3 font-weight-bold mb-1">
          Bottom {{ data.bien.peores.length }}
        </p>
        <EjercitoStatsRow
          v-for="(item, i) in data.bien.peores"
          :key="'bien-peor-' + i"
          :stats="item"
          :posicion="i + 1"
          color="red-darken-2"
        />
      </v-card>
    </v-col>

    <!-- OSCURIDAD (evil) -->
    <v-col cols="12" md="6">
      <v-card class="pa-3" elevation="2">
        <v-card-title class="d-flex align-center gap-2">
          Oscuridad
        </v-card-title>

        <v-divider class="mb-3" />

        <p class="text-subtitle-2 text-green-darken-3 font-weight-bold mb-1">
          Top {{ data.oscuridad.mejores.length }}
        </p>
        <EjercitoStatsRow
          v-for="(item, i) in data.oscuridad.mejores"
          :key="'osc-mejor-' + i"
          :stats="item"
          :posicion="i + 1"
          color="green-darken-2"
        />

        <v-divider class="my-3" />

        <p class="text-subtitle-2 text-red-darken-3 font-weight-bold mb-1">
          Bottom {{ data.oscuridad.peores.length }}
        </p>
        <EjercitoStatsRow
          v-for="(item, i) in data.oscuridad.peores"
          :key="'osc-peor-' + i"
          :stats="item"
          :posicion="i + 1"
          color="red-darken-2"
        />
      </v-card>
    </v-col>
  </v-row>

  <v-alert v-else type="info" class="mt-4">
    No hay datos de estadísticas disponibles todavía.
  </v-alert>
</template>

<script setup lang="ts">
import type { TopBandosResponseDTO } from "@/interfaces/Estadisticas";
import EjercitoStatsRow from "./EjercitoStatsRow.vue";

defineProps<{ data: TopBandosResponseDTO | null }>();
</script>
