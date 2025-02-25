<template>
    <v-card class="section-card stats-section">
        <h3>Estadísticas</h3>
        <v-divider></v-divider>
        <v-row class="mt-2 mb-2 text-left">
        <v-col cols="4">
            <span class="font-weight-bold">{{ player.gamesPlayed }} partidas jugadas</span>
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
                <span class="text-green font-weight-bold">{{ player.wins }} Ganadas</span>
            </v-col>
            <v-col cols="4">
                <span class="text-blue font-weight-bold">{{ player.draws }} Empatadas</span>
            </v-col>
            <v-col cols="4">
                <span class="text-red font-weight-bold">{{ player.losses }} Perdidas</span>
            </v-col>
        </v-row>
        <!--<v-row>
            <v-col>
                <AgCharts :options="chartOptions"></AgCharts>
            </v-col>
        </v-row>-->
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { AgCharts } from "ag-charts-vue3";

const player = ref({
    name: "Aragorn, Rey de Gondor",
    clan: "Hijos de Númenor",
    location: "Minas Tirith",
    gamesPlayed: 150,
    wins: 90,
    losses: 40,
    draws: 20,
    rank: "Capitán",
    level: 12,
    experience: 750,
    experienceToNextLevel: 1000,
});

const winRate = computed(() => (player.value.wins / player.value.gamesPlayed) * 100);
const lossRate = computed(() => (player.value.losses / player.value.gamesPlayed) * 100);
const drawRate = computed(() => (player.value.draws / player.value.gamesPlayed) * 100);

// Configuración básica del gráfico
const chartOptions = ref({
    background: { fill: "#1e1e1e" }, // Color de fondo personalizado (ejemplo: gris oscuro)
  data: [
    { categoria: "Ganadas", cantidad: 10, color: "green" },
    { categoria: "Empatadas", cantidad: 5, color: "yellow" },
    { categoria: "Perdidas", cantidad: 7, color: "red" }
  ],
  theme: {
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
  },
  series: [
    {
        type: "donut",
        calloutLabelKey: "asset",
        angleKey: "amount",
        innerRadiusRatio: 0.7,
    },
],
  axes: [
    { type: "category", position: "bottom" },
    { type: "number", position: "left" }
  ],
  title: { text: "Partidas Jugadas", fontSize: 18 }
});

// Asegurar que los datos sean reactivos
watchEffect(() => {
  chartOptions.value = {
    background: { fill: "#1e1e1e" }, // Color de fondo personalizado (ejemplo: gris oscuro)
    data: [
    { categoria: "Ganadas", cantidad: 10, color: "green" },
    { categoria: "Empatadas", cantidad: 5, color: "yellow" },
    { categoria: "Perdidas", cantidad: 7, color: "red" }
  ],
  theme: {
    overrides: {
        donut:{
            series: {
                calloutLabel: {
                    color: "#ffffff" // 🔹 Cambia el color de los labels dentro del gráfico
                },
                sectorLabel: {
                    color: "#ffffff" // 🔹 Cambia el color de los valores dentro del gráfico
                }
            }
        },
        common: {
            title: {
            color: "#ffffff" // Color del título
            },
            legend: {
                item: {
                    label: {
                        color: "#ffffff" // 🔹 Cambia el color de las etiquetas en la leyenda
                    }
                }
            }
        },
    }
  },
  series: [
    {
        type: "donut",
        calloutLabelKey: "categoria",
        angleKey: "cantidad",
        innerRadiusRatio: 0.7,
    },
],
  axes: [
    { type: "category", position: "bottom" },
    { type: "number", position: "left" }
  ],
  title: { text: "Partidas Jugadas", fontSize: 18 }
  }
});
</script>