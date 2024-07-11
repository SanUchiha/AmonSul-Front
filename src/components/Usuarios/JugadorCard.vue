<template>
  <div v-if="loading" class="center">
    <ProgressCircular />
  </div>
  <div v-else class="center">
    <v-card class="jugador-card">
      <v-card-title class="title">
        <div class="ml-4">
          <h2>{{ usuario.nick }}</h2>
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
              <v-icon color="blue">mdi-star</v-icon> ELO:
              {{ usuario.puntuacionElo }}
            </v-col>
            <v-col class="stat-item">
              <v-icon color="purple">mdi-medal</v-icon> Posición ELO:
              {{ usuario.clasificacionElo }}
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
  font-size: 20px;
  color: rgb(207, 199, 199);
}

.stats-container {
  margin: 16px 0;
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
