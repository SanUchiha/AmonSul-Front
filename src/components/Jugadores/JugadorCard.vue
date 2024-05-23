<template>
  <v-card outlined class="jugador-card">
    <v-card-title>
      {{ jugador.Nombre_Usuario }} {{ jugador.Primer_Apellido }}
      {{ jugador.Segundo_Apellido }}
    </v-card-title>
    <v-card-text>
      <p>{{ jugador.Nick }}</p>
    </v-card-text>
    <v-card-text>
      <p>{{ jugador.Email }}</p>
      <p>{{ jugador.Faccion }}</p>
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
  router.push(`/detalle-jugador/${props.jugador.Nick}`);
};
</script>

<style scoped>
.jugador-card {
  max-width: 100%;
  min-width: 300px;
  margin: 16px;
}
</style>
