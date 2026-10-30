<template>
  <!-- Victorias, empates y derrotas con su porcentaje y una barra repartida -->
  <div>
    <div class="d-flex justify-space-between text-body-2">
      <span class="font-weight-bold">{{ titulo }}</span>
      <span class="text-medium-emphasis">
        {{ balance.total }} {{ balance.total === 1 ? "partida" : "partidas" }} ·
        {{ balance.porcentaje }}% de victorias
      </span>
    </div>
    <div class="d-flex text-caption mt-1 ga-3">
      <span class="text-success">{{ balance.victorias }} V</span>
      <span class="text-medium-emphasis">{{ balance.empates }} E</span>
      <span class="text-error">{{ balance.derrotas }} D</span>
    </div>
    <div v-if="balance.total > 0" class="barra mt-1">
      <div class="bg-success" :style="{ width: ancho(balance.victorias) }" />
      <div class="bg-grey" :style="{ width: ancho(balance.empates) }" />
      <div class="bg-error" :style="{ width: ancho(balance.derrotas) }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { Balance } from "@/utils/historialJugador";

const props = defineProps<{
  titulo: string;
  balance: Balance;
}>();

const ancho = (n: number) => `${(n / props.balance.total) * 100}%`;
</script>

<style scoped>
.barra {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}
</style>
