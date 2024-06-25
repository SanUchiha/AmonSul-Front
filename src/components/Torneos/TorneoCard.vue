<template>
  <v-card outlined class="torneo-card">
    <v-card-title>
      {{ torneo.nombreTorneo }}
    </v-card-title>
    <v-card-text>
      <p>{{ torneo.descripcionTorneo }}</p>
    </v-card-text>
    <v-card-text>
      <p>FECHA: {{ formatDate(torneo.fechaInicioTorneo) }}</p>
      <p>LUGAR: {{ torneo.lugarTorneo }}</p>
      <p>RONDAS: {{ torneo.numeroPartidas }}</p>
      <p>PUNTOS: {{ torneo.puntosTorneo }}</p>
      <p>PRECIO: {{ torneo.precioTorneo }}</p>
      <p>
        LÍMITE DE PLAZAS:
        {{ torneo.limitePlazas ? torneo.limitePlazas : "No hay límite" }}
      </p>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="tonal" @click="goToDetalle">Ver Detalle</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ITorneo } from "@/interfaces/Torneo";
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ torneo: ITorneo }>();
const router = useRouter();

const goToDetalle = () => {
  router.push(`/detalle-torneo/${props.torneo.ID_Torneo}`);
};
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.torneo-card {
  max-width: 100%;
  min-width: 300px;
  margin: 16px;
}
</style>
