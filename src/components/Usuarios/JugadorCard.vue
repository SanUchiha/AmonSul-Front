<template>
  <v-card>
    <v-card-title>
      <p>{{ usuario.nick }}</p>
    </v-card-title>
    <v-card-text>
      <p>Facción: {{ usuario.idFaccion }}</p>
      <p>Número de partidas: {{ usuario.numeroPartidasJugadas }}</p>
      <div class="resultado-container">
        <div>
          <p>
            Victorias:
            <span class="victoria">{{ usuario.partidasGanadas }}</span>
          </p>
        </div>
        <div>
          <p>
            Empates: <span class="empate">{{ usuario.partidasEmpatadas }}</span>
          </p>
        </div>
        <div>
          <p>
            Derrotas:
            <span class="derrota">{{ usuario.partidasPerdidas }}</span>
          </p>
        </div>
      </div>
      <p>ELO: {{ usuario.puntuacionElo }}</p>
      <p>Posición ELO: {{ usuario.clasificacionElo }}</p>
    </v-card-text>
    <!-- <v-card-actions>
      <v-btn color="blue darken-1" variant="outlined" @click="goToDetalle"
        >Ver Detalle</v-btn
      >
    </v-card-actions> -->
  </v-card>
</template>

<script setup lang="ts">
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ usuario: ViewUsuarioPartidaDTO }>();
const router = useRouter();

const goToDetalle = () => {
  router.push(`/detalle-jugador/${props.usuario.nick}`);
};
</script>

<style scoped>
.jugador-card {
  max-width: 100%;
  min-width: 300px;
  margin: 16px;
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
