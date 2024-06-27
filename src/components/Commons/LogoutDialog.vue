<template>
  <v-dialog v-model="internalVisible" max-width="400">
    <v-card>
      <v-card-title class="headline">{{ titulo }}</v-card-title>
      <v-card-text>{{ mensaje }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="cancelar">{{
          textoCancelar
        }}</v-btn>
        <v-btn color="blue darken-1" text @click="confirmar">{{
          textoConfirmar
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  titulo: {
    type: String,
    default: "Confirmar",
  },
  mensaje: {
    type: String,
    default: "¿Estás seguro de que quieres proceder?",
  },
  textoConfirmar: {
    type: String,
    default: "Sí",
  },
  textoCancelar: {
    type: String,
    default: "No",
  },
});

const emits = defineEmits(["update:isVisible", "confirmar", "cancelar"]);

const internalVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newVal) => {
    internalVisible.value = newVal;
  }
);

const confirmar = () => {
  emits("confirmar");
  internalVisible.value = false;
  emits("update:isVisible", false);
};

const cancelar = () => {
  emits("cancelar");
  internalVisible.value = false;
  emits("update:isVisible", false);
};
</script>

<style scoped></style>
