<template>
  <div v-if="loading" class="center">
    <ProgressCircular />
  </div>
  <div v-else class="center">
    <v-card class="jugador-card">
      <v-card-title class="title">
        <div class="title">
          <h3 v-if="usuario.nick.length <= 26">{{ usuario.nick }}</h3>
          <h3 v-else>{{ usuario.nick.substring(0, 23) + "..." }}</h3>
          <p class="subtitle">{{ nombreFaccionSelected }}</p>
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
          </v-row>
        </div>
      </v-card-text>
      <!-- <v-card-actions class="center">
        <v-btn color="primary" variant="outlined" @click="goToDetalle">
          Ver Detalle
        </v-btn>
      </v-card-actions> -->
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { defineProps, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Faccion } from "@/interfaces/Faccion";
import { getFacciones } from "@/services/FaccionesService";
import ProgressCircular from "../Commons/ProgressCircular.vue";

const props = defineProps<{ usuario: ViewUsuarioPartidaDTO }>();
const router = useRouter();
const loading = ref(true);

const nombreFaccionSelected = ref<string | undefined>("");

const goToDetalle = () => {
  router.push(`/detalle-jugador/${props.usuario.nick}`);
};

onMounted(async () => {
  try {
    var rawListaFacciones: Faccion[] = await getFacciones();
    nombreFaccionSelected.value = await rawListaFacciones.find(
      (u) => u.idFaccion == props.usuario.idFaccion
    )?.nombreFaccion;
  } catch (error) {
    console.error("Error al obtener la facción:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.jugador-card {
  max-width: 100%;
  min-width: 300px;
  margin: 16px;
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
