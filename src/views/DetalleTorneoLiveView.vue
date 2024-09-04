<template>
  <div>Resultados del torneo con ID: {{ idTorneo }}</div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const idTorneo = Number(route.params.idTorneo); // Asegúrate de convertir a número si es necesario
</script>

<style scoped></style>
