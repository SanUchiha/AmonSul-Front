<template>
  <v-card outlined class="jugador-card">
    <v-card-title>
      <p>{{ jugador.nick }}</p>
    </v-card-title>
    <v-card-text>
      <p>{{ jugador.email }}</p>
    </v-card-text>
    <v-card-actions>
      <v-btn color="blue darken-1" variant="outlined" @click="goToDetalle"
        >Ver Detalle</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Jugador } from "@/interfaces/Usuario";
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ jugador: Jugador }>();
const router = useRouter();

const goToDetalle = () => {
  router.push(`/detalle-jugador/${props.jugador.nick}`);
};
</script>

<style scoped>
.jugador-card {
  max-width: 100%;
  min-width: 300px;
  margin: 16px;
}
</style>
