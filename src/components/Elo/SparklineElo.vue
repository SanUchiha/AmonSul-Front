<template>
  <div v-if="loading" class="center">
    <ProgressCircular />
  </div>
  <div v-else class="center">
    <v-card class="mx-auto text-center">
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
          ></v-sparkline>
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
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import ProgressCircular from "../Commons/ProgressCircular.vue";

const props = defineProps<{ email: any }>();

const { getUser } = useAuth();
const router = useRouter();
const error = ref<string | null>(null);
const loading = ref(true);

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
const gradient = ref<string>(gradients.value[5]);
const gradientDirection = ref<string>("top");
const fill = ref<boolean>(false);
const type = ref<string>("trend");
const autoLineWidth = ref<boolean>(false);

const mejorResultado = ref<number>();
const peorResultado = ref<number>();
const resultadoActual = ref<number>();

onMounted(async () => {
  try {
    const email: any = await getUser.value;
    if (!email) {
      error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
      router.push("error");
      return;
    }
    const response = await getEloUsuario(props.email);
    const elos = response.elos.map(
      (elo: { puntuacionElo: unknown }) => elo.puntuacionElo
    );

    value.value = elos;

    mejorResultado.value = Math.max(...elos);
    peorResultado.value = Math.min(...elos);
    resultadoActual.value = await elos[elos.length - 1];
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped></style>
