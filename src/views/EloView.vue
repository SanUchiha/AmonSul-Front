<template>
  <v-container>
    <SparklineElo class="separated" />
    <TablaClasificacionElo class="separated" />
  </v-container>
</template>

<script setup lang="ts">
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import TablaClasificacionElo from "@/components/Elo/TablaClasificacionElo.vue";
</script>

<style scoped>
.separated {
  margin-bottom: 20px; /* Ajusta el valor según tus necesidades */
}
</style>
