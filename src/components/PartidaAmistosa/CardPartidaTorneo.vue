<template>
  <v-card :class="cardColorClass" @click="goToDetallePartida()">
    <v-card-title
      >{{ match.nickUsuario1 }} - {{ match.nickUsuario2 }}</v-card-title
    >
    <v-card-text>
      Resultado: {{ match.resultadoUsuario1 }} - {{ match.resultadoUsuario2 }}
    </v-card-text>
    <v-card-text>
      <p>{{ match.puntosPartida }} puntos</p>
      Escenario: {{ match.escenarioPartida || "No disponible" }}
    </v-card-text>
    {{ resultado }}
    <v-card-text>
      <p>Fecha: {{ fechaPartidaFormateada }}</p>
    </v-card-text>
  </v-card>

  <v-spacer class="my-3"></v-spacer>

  <div v-if="error" class="error">{{ error }}</div>
  <ModalDetallePartida
    v-if="showModalDetallePartida"
    :partida="match"
    @close="closeModalDetallePartida"
  />
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, computed } from "vue";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { useRouter } from "vue-router";
import { formatFechaSpa } from "@/utils/Fecha";
import ModalDetallePartida from "@/components/PartidaAmistosa/ModalDetallePartida.vue";

const isLoading = ref(true);
const error = ref<string | null>(null);
const router = useRouter();

const resultado = ref<string>("");
const fechaPartidaFormateada = ref<string>("");

const props = defineProps<{
  match: ViewPartidaTorneoDTO;
  idUsuario: number;
}>();

const showModalDetallePartida = ref(false);

const initializeComponent = async () => {
  try {
    isLoading.value = true;
    setResultado();
    fechaPartidaFormateada.value = await formatFechaSpa(
      props.match.fechaPartida
    );
  } catch (err) {
    error.value = (err as Error).message;
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }
};

const setResultado = () => {
  if (props.match.ganadorPartidaNick == null) {
    resultado.value = "Empate";
  } else if (props.match.ganadorPartidaTorneo == props.idUsuario) {
    resultado.value = "Victoria";
  } else {
    resultado.value = "Derrota";
  }
};

const cardColorClass = computed(() => {
  switch (resultado.value) {
    case "Victoria":
      return "victoria-card";
    case "Derrota":
      return "derrota-card";
    case "Empate":
      return "empate-card";
    default:
      return "";
  }
});

const goToDetallePartida = () => {
  showModalDetallePartida.value = true;
};

const closeModalDetallePartida = () => {
  showModalDetallePartida.value = false;
};

onMounted(initializeComponent);
</script>

<style scoped>
.victoria-card {
  background-color: rgb(14, 84, 14);
  color: white;
  cursor: pointer;
}

.derrota-card {
  background-color: rgb(106, 12, 12);
  color: white;
  cursor: pointer;
}

.empate-card {
  background-color: rgb(151, 151, 15);
  color: black;
  cursor: pointer;
}

.error {
  color: red;
  text-align: center;
}
</style>
