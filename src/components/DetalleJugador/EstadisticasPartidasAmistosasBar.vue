<template>
  <v-container class="text-center pa-0 mb-0">
    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold text-victorias"
              >Victorias: {{ partidasGanadas }}</span
            >
          </v-col>
          <v-col cols="4">
            <span class="font-weight-bold text-empates"
              >Empates: {{ partidasEmpatadas }}</span
            >
          </v-col>
          <v-col cols="4" v-if="partidasPerdidas > 0">
            <span class="font-weight-bold text-derrotas"
              >Derrotas: {{ partidasPerdidas }}</span
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <span class="font-weight-bold text-ejercito"
              >Ejército más usado: {{ ejercitoMasUsado || "N/A" }}</span
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col class="pb-0 pt-1 text-left" cols="12">
            <v-icon class="ml-2" color="grey-lighten-1" size="20"
              >mdi-filter-variant</v-icon
            >
            Pulsa sobre la barra para filtrar partidas
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-0">
            <div class="resultado-barra">
              <div
                class="victorias"
                :class="{ active: filtroActivo === 'win' }"
                v-if="winRate > 0"
                :style="{ flex: winRate.toFixed(2) }"
                @click="toggleFiltro('win')"
              >
                {{ (winRate * 100).toFixed(1) }}%
              </div>
              <div
                class="empates"
                :class="{ active: filtroActivo === 'draw' }"
                v-if="drawRate > 0"
                :style="{ flex: drawRate.toFixed(2) }"
                @click="toggleFiltro('draw')"
              >
                {{ (drawRate * 100).toFixed(1) }}%
              </div>
              <div
                class="derrotas"
                :class="{ active: filtroActivo === 'loss' }"
                v-if="lossRate > 0"
                :style="{ flex: lossRate.toFixed(2) }"
                @click="toggleFiltro('loss')"
              >
                {{ (lossRate * 100).toFixed(1) }}%
              </div>
            </div>
          </v-col>
        </v-row>
        <v-snackbar
          v-model="mostrarSnackbar"
          timeout="1500"
          color="indigo-darken-4"
          elevation="3"
          location="top"
          rounded="lg"
          class="px-4"
        >
          <template #default>
            <v-icon class="mr-2" color="yellow-lighten-2"
              >mdi-filter-check</v-icon
            >
            {{ textoSnackbar }}
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { ref, computed } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps<{
  amistosasMatches: ViewPartidaAmistosaDTO[];
  idUsuario: number;
}>();

//eslint-disable-next-line no-undef
const emit = defineEmits(["filtroCambiar"]);
const filtroActivo = ref<"win" | "loss" | "draw" | null>(null);
const mostrarSnackbar = ref(false);
const textoSnackbar = ref("");

const partidasGanadas = computed(
  () =>
    props.amistosasMatches.filter(p => p.ganadorPartida === props.idUsuario)
      .length
);
const partidasEmpatadas = computed(
  () =>
    props.amistosasMatches.filter(
      p => p.ganadorPartida === null || p.ganadorPartida === 0
    ).length
);
const partidasPerdidas = computed(
  () =>
    props.amistosasMatches.filter(
      p => p.ganadorPartida !== null && p.ganadorPartida !== props.idUsuario
    ).length
);
const total = computed(() => props.amistosasMatches.length);

const winRate = computed(() =>
  total.value ? partidasGanadas.value / total.value : 0
);
const drawRate = computed(() =>
  total.value ? partidasEmpatadas.value / total.value : 0
);
const lossRate = computed(() =>
  total.value ? partidasPerdidas.value / total.value : 0
);

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
      p => p.ganadorPartida !== null && p.ganadorPartida !== props.idUsuario
    );
  }
  return props.amistosasMatches;
});

const ejercitoMasUsado = computed(() => {
  const counts: { [key: string]: number } = {};
  for (const partida of partidasFiltradas.value) {
    let ejercito = null;
    if (partida.idUsuario1 === props.idUsuario) {
      ejercito = partida.ejercitoUsuario1;
    } else if (partida.idUsuario2 === props.idUsuario) {
      ejercito = partida.ejercitoUsuario2;
    }
    if (ejercito) {
      counts[ejercito] = (counts[ejercito] || 0) + 1;
    }
  }
  let max = 0;
  let ejercitoMax = null;
  for (const [ejercito, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      ejercitoMax = ejercito;
    }
  }
  return ejercitoMax;
});

function toggleFiltro(tipo: "win" | "loss" | "draw") {
  filtroActivo.value = filtroActivo.value === tipo ? null : tipo;
  emit("filtroCambiar", filtroActivo.value);
  textoSnackbar.value =
    filtroActivo.value === "win"
      ? "Filtrando por victorias"
      : filtroActivo.value === "draw"
        ? "Filtrando por empates"
        : filtroActivo.value === "loss"
          ? "Filtrando por derrotas"
          : "Sin filtro";
  mostrarSnackbar.value = true;
}
</script>

<style scoped>
.resultado-barra {
  display: flex;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  background: #333;
  margin-bottom: 8px;
}
.victorias {
  background: #43a047;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.empates {
  background: #fbc02d;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.derrotas {
  background: #e53935;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.active {
  border: 2px solid #fff;
}
.text-victorias {
  color: #43a047;
}
.text-empates {
  color: #fbc02d;
}
.text-derrotas {
  color: #e53935;
}
.text-ejercito {
  color: #1976d2;
}
.active {
  border: 2px solid #fff;
}
</style>
