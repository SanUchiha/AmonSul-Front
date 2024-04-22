<template>
  <div class="detalle-jugador">
    <DetalleJugador />
    <div>
      <router-link :to="{ name: 'jugadores' }" class="volver-atras">Volver atrás</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">

import DetalleJugador from '@/components/DetalleJugador.vue';

</script>

<style scoped>

</style>
