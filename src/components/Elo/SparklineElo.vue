<template>
  <div v-if="isLoading" class="center">
    <ProgressCircular />
  </div>
  <div v-else-if="value.length > 1">
    <v-card class="mb-2 mt-0 px-4 text-center">
      <v-card-text>
        <v-sheet>
          <v-sparkline
            :auto-line-width="autoLineWidth"
            :fill="fill"
            :gradient="gradient"
            :gradient-direction="gradientDirection"
            :line-width="width"
            :model-value="value"
            :padding="padding"
            :smooth="radius || false"
            :stroke-linecap="lineCap"
            :type="type"
            auto-draw
          >
            <template v-slot:label="item">
              {{ item.value }}
            </template>
          </v-sparkline>
        </v-sheet>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class="d-flex justify-center">
        <span class="mx-2">Mejor: {{ mejorResultado }}</span>
        <span class="mx-2">Peor: {{ peorResultado }}</span>
        <span class="mx-2">Actual: {{ resultadoActual }}</span>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import { getEloUsuario } from "@/services/EloService";
import ProgressCircular from "../Commons/ProgressCircular.vue";

const props = defineProps<{ idUsuario: number }>();

const isLoading = ref(true);

const gradients = ref<string[][]>([
  ["#222"],
  ["#42b3f4"],
  ["red", "orange", "yellow"],
  ["purple", "violet"],
  ["#00c6ff", "#F0F", "#FF0"],
  ["#f72047", "#ffd200", "#1feaea"],
]);

const value = ref<number[]>([]);
const width = ref<number>(2);
const radius = ref<number>(10);
const padding = ref<number>(8);
const lineCap = ref<string>("round");
const gradient = ref<string[]>(gradients.value[5]);
const gradientDirection = ref<string>("top");
const fill = ref<boolean>(false);
const type = ref<string>("trend");
const autoLineWidth = ref<boolean>(false);

const mejorResultado = ref<number>();
const peorResultado = ref<number>();
const resultadoActual = ref<number>();

onMounted(async () => {
  if (props.idUsuario != undefined) {
    try {
      isLoading.value = true;
      const response = await getEloUsuario(props.idUsuario);
      if (response.status != 200) return;
      const elos = response.data.elos.map(
        (elo: { puntuacionElo: unknown }) => elo.puntuacionElo
      );

      value.value = elos;

      mejorResultado.value = Math.max(...elos);
      peorResultado.value = Math.min(...elos);
      resultadoActual.value = await elos[elos.length - 1];
    } catch (error) {
      isLoading.value = false;
      console.error("Error al obtener datos del usuario:", error);
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
});
</script>

<style scoped></style>
