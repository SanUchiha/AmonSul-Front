<template>
  <v-container>
    <CardGestionTorneos />

    <TablaInscripcionesPropioTorneo />
  </v-container>
</template>

<script setup lang="ts">
import CardGestionTorneos from "@/components/GestionTorneos/CardGestionTorneos.vue";
import TablaInscripcionesPropioTorneo from "@/components/GestionTorneos/TablaInscripcionesPropioTorneo.vue";
</script>

<style scoped></style>
