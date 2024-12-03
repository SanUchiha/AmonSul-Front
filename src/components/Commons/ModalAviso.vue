<template>
  <v-dialog v-model="showModal" max-width="500">
    <v-card>
      <v-card-title class="text-h4 text-center"
        >¡Una nueva era comienza!</v-card-title
      >
      <v-card-text class="text-center">
        ¡Héroe de la Tierra Media!.
      </v-card-text>
      <v-card-text class="text-center">
        El <strong>1 de enero de 2025</strong>, los ecos del cuerno de Gondor
        marcarán el inicio de una nueva era y los nuevos ejercitos estarán
        disponibles para la batalla
      </v-card-text>
      <v-card-text class="text-center">
        Con la llegada de la nueva edición del juego, las contadores de ELO
        serán reseteados. A partir de esa fecha, solo las partidas libradas en
        torneos de <strong>16 jugadores o más</strong> tendrán peso y contarán
        para ELO.
      </v-card-text>
      <v-card-text class="text-center">
        <strong
          >Las escaramuzas amistosas no contribuirán al registro del
          ELO.</strong
        >
        Solo los valientes que midan su fuerza en las grandes arenas serán
        recordados en las crónicas y dominanaran las clasificaciones de la Tiera
        Media.
      </v-card-text>
      <v-card-text class="text-center">
        <strong
          >¡Afila tu espada, tensa tu arco, reúnete con compañeros, y prepárate
          para las épicas batallas que vendrán!</strong
        >
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="tonal"
          color="blue darken-1"
          size="large"
          @click="closeModal"
          >¡Entendido!</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const showModal = ref(true);

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped></style>
