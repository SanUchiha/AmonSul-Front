<template>
  <v-dialog v-model="isVisible" persistent max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <div>
          <div class="text-h6">{{ props.nickJugador }}</div>
          <div class="text-subtitle-2 text-grey">{{ ejercito }}</div>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-skeleton-loader
          v-if="!listaData"
          type="image"
          max-height="500"
        ></v-skeleton-loader>

        <v-img
          v-else
          :src="listaData"
          alt="Lista de {{ nickJugador }}"
          max-height="500"
          class="rounded-lg"
          cover
        ></v-img>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";

const props = defineProps<{
  listaData: string;
  nickJugador: string;
  ejercito?: string;
}>();

const emit = defineEmits(["close"]);

const isVisible = ref(true);

const closeModal = () => {
  isVisible.value = false;
  emit("close");
};
</script>
