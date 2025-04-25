<template>
  <v-dialog v-model="isVisible" persistent max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <div>
          <div class="text-h6">{{ nickJugador }}</div>
          <div class="text-subtitle-2 text-grey">{{ ejercito }}</div>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <!-- Mostrar la lista en formato base64 como una imagen -->
        <v-img
          :src="listaData"
          alt="Lista de {{ nickJugador }}"
          max-height="500"
        ></v-img>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";

const props = defineProps({
  listaData: {
    type: String,
    required: true,
  },
  nickJugador: {
    type: String,
    required: true,
  },
  ejercito: {
    type: String,
  },
});

const emit = defineEmits(["close"]);

const isVisible = ref(true);

const closeModal = () => {
  isVisible.value = false;
  emit("close");
};
</script>
