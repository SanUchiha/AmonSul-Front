<template>
  <v-card-actions class="px-4 py-3">
    <v-btn variant="text" @click="$emit('close')">Cerrar</v-btn>
    <v-spacer />
    <v-btn color="primary" variant="flat" @click="$emit('ver-clasificacion')">Clasificación</v-btn>
  </v-card-actions>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue";

defineEmits<{
  (event: "ver-clasificacion"): void;
  (event: "close"): void;
}>();
</script>
