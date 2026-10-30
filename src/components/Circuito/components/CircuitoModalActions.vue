<template>
  <!-- En el móvil los dos botones no caben en una fila -->
  <v-card-actions class="d-flex flex-wrap ga-2 justify-space-between">
    <!-- Botón para ver clasificación -->
    <v-btn
      color="primary"
      variant="tonal"
      text
      @click="$emit('ver-clasificacion')"
    >
      <v-icon class="mr-2">mdi-podium</v-icon>
      Ver clasificación
    </v-btn>

    <!-- Botón para cerrar -->
    <v-btn 
      color="primary" 
      variant="tonal" 
      text 
      @click="$emit('close')"
    >
      <v-icon class="mr-2">mdi-close</v-icon>
      Cerrar
    </v-btn>
  </v-card-actions>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue";

defineEmits<{
  (event: "ver-clasificacion"): void;
  (event: "close"): void;
}>();
</script>