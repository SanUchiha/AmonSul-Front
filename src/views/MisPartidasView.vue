<template>
  <v-container class="text-center">
    <div>Vista mis partidas</div>

    <!-- Boton partidas -->
    <v-btn
      class="mt-2"
      variant="tonal"
      size="large"
      color="blue darken-1"
      @click="handleFormCreateMatch"
      >Registrar partida</v-btn
    >
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const handleFormCreateMatch = () => {
  router.push({ name: "registrar-partida" });
};
</script>

<style scoped></style>
