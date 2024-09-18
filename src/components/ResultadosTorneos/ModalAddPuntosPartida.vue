<!-- ModalPuntos.vue -->
<template>
  <v-dialog v-model="isModalPuntosVisible" max-width="400">
    <v-card>
      <v-card-title> Ingresar Puntos </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="puntos"
            label="Puntos"
            type="number"
            min="0"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn small variant="tonal" color="primary" @click="confirmarPuntos">
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
const isModalPuntosVisible = ref(true);
const puntos = ref<number>(0);

// Cerrar el modal
const cerrarModal = () => {
  emit("cerrar");
};

// Confirmar los puntos y cerrar el modal
const confirmarPuntos = () => {
  emit("confirmar", puntos.value);
  cerrarModal();
};

// Monitorea cambios en la visibilidad del modal
watch(
  () => props.isVisible,
  (newVal) => {
    isModalPuntosVisible.value = newVal;
  }
);
</script>
