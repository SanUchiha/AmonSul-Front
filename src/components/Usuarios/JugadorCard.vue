<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <v-card v-else class="jugador-card">
    <v-card-title class="title">
      <div class="title">
        <h3 @click="goToDetalle">
          {{
            usuario.nick.length <= 26
              ? usuario.nick
              : usuario.nick.substring(0, 23) + "..."
          }}
        </h3>
        <p class="subtitle">
          {{ usuario.faccion?.nombreFaccion || "Sin comunidad" }}
        </p>
      </div>
    </v-card-title>
    <v-card-text>
      <v-divider></v-divider>
      <div class="stats-container">
        <v-row>
          <v-col class="stat-item">
            <v-icon color="primary">mdi-gamepad-variant</v-icon>
            <p>{{ usuario.numeroPartidasJugadas }}</p>
          </v-col>
          <v-col class="stat-item">
            <v-icon color="green">mdi-trophy</v-icon>
            <p class="victoria">{{ usuario.partidasGanadas }}</p>
          </v-col>
          <v-col class="stat-item">
            <v-icon color="yellow">mdi-handshake</v-icon>
            <p class="empate">{{ usuario.partidasEmpatadas }}</p>
          </v-col>
          <v-col class="stat-item">
            <v-icon color="red">mdi-alert-circle</v-icon>
            <p class="derrota">{{ usuario.partidasPerdidas }}</p>
          </v-col>
        </v-row>
      </div>
      <v-divider></v-divider>
      <div class="stats-container">
        <v-row>
          <v-col class="stat-item">
            <v-icon color="blue">mdi-star</v-icon>
            <p>{{ usuario.puntuacionElo }}</p>
          </v-col>
          <v-col class="stat-item">
            <v-icon color="purple">mdi-medal</v-icon>
            <p>Puesto: {{ usuario.clasificacionElo }}</p>
          </v-col>
          <v-col class="stat-item">
            <v-icon color="orange">mdi-percent</v-icon>
            <p>Victorias: {{ porcentajeVictorias }}%</p>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { computed, defineProps, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { FaccionDTO } from "@/interfaces/Faccion";
import { getFacciones } from "@/services/FaccionesService";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";

const props = defineProps<{ usuario: UsuarioDataDTO }>();
const router = useRouter();
const isLoading = ref(true);

const rawListaFacciones = ref<Array<FaccionDTO> | undefined>();

const goToDetalle = () => {
  router.push({
    name: "detalle-jugador",
    params: { idUsuario: props.usuario.idUsuario },
  });
};

const porcentajeVictorias = computed(() => {
  return props.usuario.numeroPartidasJugadas > 0
    ? (
        (props.usuario.partidasGanadas / props.usuario.numeroPartidasJugadas) *
        100
      ).toFixed(2)
    : "0";
});

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await getFacciones();
    rawListaFacciones.value = response.data;
  } catch (error) {
    console.error("Error al obtener la facción:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.jugador-card {
  max-width: 100%;
  min-width: 300px;
}

.subtitle {
  font-size: 18px;
  color: rgb(207, 199, 199);
}

.stats-container {
  margin: 16px 0;
  display: flex;
  justify-content: center; /* Centra los elementos horizontalmente */
  align-items: center; /* Centra los elementos verticalmente */
}

.stat-item {
  display: flex; /* Hace que el contenedor use flexbox */
  flex-direction: column; /* Apila los elementos verticalmente */
  align-items: center; /* Centra los elementos horizontalmente */
  text-align: center; /* Centra el texto */
}

.stat-item p {
  margin: 5px 0;
  font-size: 18px;
}

.resultado-container {
  display: flex;
  justify-content: space-between;
}

.victoria {
  color: green;
}

.empate {
  color: yellow;
}

.derrota {
  color: red;
}
</style>
