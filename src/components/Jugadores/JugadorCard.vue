<template>
  <v-card outlined class="jugador-card">
    <v-card-title>
      {{ jugador.Nombre_Torneo }}
    </v-card-title>
    <v-card-text>
      <p>{{ torneo.Descripción_Torneo }}</p>
    </v-card-text>
    <v-card-text>
      <p>FECHA: {{ formatDate(torneo.Fecha_Inicio_Torneo) }}</p>
      <p>LUGAR: {{ torneo.Lugar_Torneo }}</p>
      <p>RONDAS: {{ torneo.Numero_Partidas }}</p>
      <p>PUNTOS: {{ torneo.Puntos_Torneo }}</p>
      <p>PRECIO: {{ torneo.Precio_Torneo }}</p>
      <p>
        LÍMITE DE PLAZAS:
        {{ torneo.Limite_Plazas ? torneo.Limite_Plazas : "No hay límite" }}
      </p>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="tonal" @click="goToDetalle">Ver Detalle</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { IJugador } from "@/interfaces/Usuario";
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ jugador: IJugador }>();
const router = useRouter();

const goToDetalle = () => {
  router.push(`/detalle-jugador/${props.jugador.nick}`);
};
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.jugador-card {
  max-width: 100%;
  min-width: 300px;
  margin: 16px;
}
</style>
