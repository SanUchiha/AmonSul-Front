<template>
  <v-card class="jugador-card">
    <v-card-title class="title">
      <span :class=props.textsize>{{ props.message }}</span>
    </v-card-title>
  </v-card>
</template>

<script setup lang="ts">
import {
  defineProps
} from "vue";

const props = defineProps<{
  message: string;
  textsize: string;
}>();
</script>

<style scoped>
.jugador-card {
  max-width: 100%;
  min-width: 300px;
}
</style>
