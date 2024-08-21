<template>
  <v-container>
    <CardGestionTorneos />
    <v-divider class="my-3"></v-divider>
    <TablaTorneosCreados />
  </v-container>
</template>

<script setup lang="ts">
import CardGestionTorneos from "@/components/GestionTorneos/CardGestionTorneos.vue";
import TablaTorneosCreados from "@/components/GestionTorneos/TablaTorneosCreados.vue";
</script>

<style scoped></style>
