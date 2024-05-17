<template>
  <v-card outlined class="torneo-card">
    <v-card-title>
      {{ torneo.Nombre_Torneo }}
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
    </v-card-text>
    <v-card-actions>
      <v-btn variant="tonal" @click="goToDetalle">Ver Detalle</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ torneo: Torneo }>();
const router = useRouter();

const goToDetalle = () => {
  router.push(`/detalle-torneo/${props.torneo.ID_Torneo}`);
};
const formatDate = (date: Date) => {
  const options = { year: "numeric", month: "numeric", day: "numeric" };
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
