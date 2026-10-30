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
            :label-size="11"
            auto-draw
          >
            <!-- Con muchos cambios los números se pisan: solo los que importan -->
            <template v-slot:label="item">
              {{ indicesConEtiqueta.has(item.index) ? item.value : "" }}
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
import { computed, defineProps, onMounted, ref, watch } from "vue";
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
// Con margen: las etiquetas de los extremos no se cortan
const padding = ref<number>(16);
const lineCap = ref<string>("round");
const gradient = ref<string[]>(gradients.value[5]);
const gradientDirection = ref<string>("top");
const fill = ref<boolean>(false);
const type = ref<string>("trend");
const autoLineWidth = ref<boolean>(false);

const mejorResultado = ref<number>();
const peorResultado = ref<number>();
const resultadoActual = ref<number>();

// Las etiquetas que se enseñan: el actual, el mejor, el peor y el primero, por ese orden, y ninguna demasiado cerca
// de otra ya puesta
const indicesConEtiqueta = computed(() => {
  const elos = value.value;
  const elegidos = new Set<number>();
  if (elos.length === 0) return elegidos;
  const separacion = Math.max(1, Math.floor(elos.length / 8));
  const candidatos = [
    elos.length - 1,
    elos.indexOf(Math.max(...elos)),
    elos.indexOf(Math.min(...elos)),
    0,
  ];
  for (const indice of candidatos)
    if ([...elegidos].every(otro => Math.abs(otro - indice) >= separacion))
      elegidos.add(indice);
  return elegidos;
});

async function cargar() {
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
}

onMounted(cargar);
// En la ficha de jugador la vista se reutiliza al pasar de uno a otro
watch(
  () => props.idUsuario,
  (nuevo, anterior) => {
    if (nuevo !== anterior) cargar();
  }
);
</script>

<style scoped></style>
