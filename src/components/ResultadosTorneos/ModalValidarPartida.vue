<template>
  <v-dialog v-model="isModalValidarVisible" max-width="400">
    <v-card>
      <v-card-title> Validar partida </v-card-title>
      <!-- Qué se da por bueno: en el móvil la ventana tapa la tarjeta de la partida -->
      <v-card-text v-if="resumen">
        ¿Das por bueno este resultado?
        <div class="text-body-1 font-weight-bold mt-2">{{ resumen }}</div>
      </v-card-text>
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
import { ref, watch } from "vue";

//eslint-disable-next-line no-undef
const props = defineProps({
  isVisible: Boolean,
  idPartidaTorneo: Number,
  usuario: Number,
  // El resultado que se valida, por ejemplo «Aragorn 11 - 7 Legolas»
  resumen: String,
});

//eslint-disable-next-line no-undef
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
  newVal => {
    isModalValidarVisible.value = newVal;
  }
);
</script>
