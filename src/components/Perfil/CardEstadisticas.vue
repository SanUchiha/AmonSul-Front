<template>
        <!--<v-row class="mt-2 mb-2 text-left">
        <v-col cols="4">
            <span class="font-weight-bold">{{ props.usuario.numeroPartidasJugadas }} partidas jugadas</span>
        </v-col>
        </v-row>

        <v-progress-linear height="30">
          <v-progress-linear
              :model-value="winRate"
              color="green"
              height="30"
              class="position-absolute"
          ></v-progress-linear>
          <v-progress-linear
              :model-value="drawRate"
              color="yellow"
              height="30"
              class="position-absolute"
              :style="{ left: `${winRate}%` }"
          ></v-progress-linear>
          <v-progress-linear
              :model-value="lossRate"
              color="red"
              height="30"
              class="position-absolute"
              :style="{ left: `${winRate + drawRate}%` }"
          ></v-progress-linear>
        </v-progress-linear>

        <v-row class="mt-2 text-center">
            <v-col cols="4">
                <span class="text-green font-weight-bold">{{ props.usuario.partidasGanadas }} Ganadas</span>
            </v-col>
            <v-col cols="4">
                <span class="text-yellow font-weight-bold">{{ props.usuario.partidasEmpatadas }} Empatadas</span>
            </v-col>
            <v-col cols="4">
                <span class="text-red font-weight-bold">{{ props.usuario.partidasPerdidas }} Perdidas</span>
            </v-col>
        </v-row>

        -->
  <v-row>
      <v-col cols="12">
          <AgCharts :options="chartOptions"></AgCharts>
      </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect, defineProps } from "vue";
import { AgCharts } from "ag-charts-vue3";
import { UsuarioDataDTO } from "@/interfaces/Usuario";

const props = defineProps<{ usuario: UsuarioDataDTO }>();

const defaultUsuario = {
  partidasGanadas: 0,
  partidasPerdidas: 0,
  partidasEmpatadas: 0
};
const usuarioData = computed(() => props.usuario ?? defaultUsuario);

const player = ref({
    name: "Aragorn, Rey de Gondor",
    clan: "Hijos de Númenor",
    location: "Minas Tirith",
    gamesPlayed: props.usuario.numeroPartidasJugadas,
    rank: "Capitán",
    level: 12,
    experience: 750,
    experienceToNextLevel: 1000,
});

const winRate = computed(() => ((usuarioData.value.partidasGanadas) / player.value.gamesPlayed) * 100);
const lossRate = computed(() => ((usuarioData.value.partidasPerdidas) / player.value.gamesPlayed) * 100);
const drawRate = computed(() => ((usuarioData.value.partidasEmpatadas) / player.value.gamesPlayed) * 100);

const onSliceClick = (event: any) => {
  console.log("Categoría seleccionada:", event.datum.categoria);
  console.log("Cantidad:", event.datum.cantidad);
  alert(`Has hecho clic en ${event.datum.categoria}: ${event.datum.cantidad}`);
};

const myTheme = {
  palette: {
    fills: ["#145c17", "#dbba00", "#751710",],
    strokes: ["#145c17", "#dbba00", "#751710"],
  },
  overrides: {
    common: {
      title: {
        color: "#ffffff" // 🔹 Cambia el color del título del gráfico a blanco
      }
    },
    axis: {
      category: {
        label: { color: "#ffffff" }, // 🔹 Cambia el color de las etiquetas del eje X
        line: { stroke: "#ffffff" }  // 🔹 Color de la línea del eje X
      },
      number: {
        label: { color: "#ffffff" }, // 🔹 Cambia el color de las etiquetas del eje Y
        line: { stroke: "#ffffff" }  // 🔹 Color de la línea del eje Y
      }
    }
  }
};

// Configuración básica del gráfico
const chartOptions = ref({
    background: { fill: "#212121" }, // Color de fondo personalizado (ejemplo: gris oscuro)
  data: [
    { categoria: `Ganadas ${winRate.value}%`, cantidad: usuarioData.value.partidasGanadas, color: "green" },
    { categoria: `Empatadas ${drawRate.value}%`, cantidad: usuarioData.value.partidasEmpatadas, color: "yellow" },
    { categoria: `Perdidas ${lossRate.value}%`, cantidad: usuarioData.value.partidasPerdidas, color: "red" }
  ],
  theme: myTheme,
  series: [
    {
        type: "donut",
        calloutLabelKey: "categoria",
        angleKey: "cantidad",
        innerRadiusRatio: 0.5,
        listeners: {
          nodeClick: onSliceClick // ⬅️ Detecta la pulsación en cada sector
        },
    },
  ],
  title: { text: `Partidas Jugadas ${props.usuario.numeroPartidasJugadas}`, fontSize: 18 }
});

// Asegurar que los datos sean reactivos
watchEffect(() => {
  chartOptions.value = {
    background: { fill: "#212121" }, // Color de fondo personalizado (ejemplo: gris oscuro)
    data: [
    { categoria: `Ganadas ${winRate.value}%`, cantidad: usuarioData.value.partidasGanadas, color: "green" },
    { categoria: `Empatadas ${drawRate.value}%`, cantidad: usuarioData.value.partidasEmpatadas, color: "yellow" },
    { categoria: `Perdidas ${lossRate.value}%`, cantidad: usuarioData.value.partidasPerdidas, color: "red" }
  ],
  theme: myTheme,
  series: [
    {
      type: "donut",
      calloutLabelKey: "categoria",
      angleKey: "cantidad",
      innerRadiusRatio: 0.5,
      listeners: {
        nodeClick: onSliceClick // ⬅️ Detecta la pulsación en cada sector
      },
    
    },
  ],
  title: { text: `Partidas Jugadas ${props.usuario.numeroPartidasJugadas}`, fontSize: 18 }
  }
});
</script>