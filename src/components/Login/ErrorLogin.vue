<template>
  <v-container
    ><div class="text-center pa-4">
      <v-dialog v-model="internalVisible" width="auto">
        <v-card
          max-width="400"
          prepend-icon="mdi-alert"
          :text="mensaje || 'Usuario y/o contraseña incorrecta'"
          title="Error login"
        >
          <template v-slot:actions>
            <v-btn class="ms-auto" text="Ok" @click="closeDialog"></v-btn>
          </template>
        </v-card>
      </v-dialog></div
  ></v-container>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  // El que manda el servidor, p. ej. tras demasiados intentos fallidos
  mensaje: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["update:isVisible"]);
const internalVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newVal) => {
    internalVisible.value = newVal;
  }
);

const closeDialog = () => {
  emits("update:isVisible", false);
  internalVisible.value = false;
};
</script>

<style scoped></style>
