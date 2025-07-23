<template>
  <v-dialog v-model="isModalValidarVisible" max-width="400">
    <v-card>
      <v-card-title> Validar partida </v-card-title>
      <v-card-text> </v-card-text>
      <v-card-actions>
        <v-btn small variant="tonal" color="primary" @click="confirmarValidar">
          Confirmar
        </v-btn>
        <v-btn small variant="tonal" color="secondary" @click="cerrarModal">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, defineProps } from "vue";

// Props recibidas
const props = defineProps({
  isVisible: Boolean,
  idPartidaTorneo: Number,
  usuario: Number,
});

// Emite evento para cerrar el modal y enviar los puntos
const emit = defineEmits(["confirmar", "cerrar"]);

// Variables reactivas
const isModalValidarVisible = ref(true);

// Cerrar el modal
const cerrarModal = () => {
  emit("cerrar");
};

// Confirmar los puntos y cerrar el modal
const confirmarValidar = () => {
  emit("confirmar");
  cerrarModal();
};

// Monitorea cambios en la visibilidad del modal
watch(
  () => props.isVisible,
  (newVal) => {
    isModalValidarVisible.value = newVal;
  }
);
</script>
