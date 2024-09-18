<!-- ModalPuntos.vue -->
<template>
  <v-dialog v-model="isModalLiderVisible" max-width="400">
    <v-card>
      <v-card-title> ¿Has matado al líder enemigo? </v-card-title>
      <v-card-text>
        <v-form>
          <v-radio-group v-model="lider" :mandatory="true">
            <v-radio label="Sí" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn small variant="tonal" color="primary" @click="confirmarLider">
          Confirmar
        </v-btn>
        <v-btn
          small
          variant="tonal"
          color="secondary"
          @click="cerrarModalLider"
        >
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
const isModalLiderVisible = ref(true);
const lider = ref<boolean | null>(null);

// Cerrar el modal
const cerrarModalLider = () => {
  emit("cerrar");
};

// Confirmar los puntos y cerrar el modal
const confirmarLider = () => {
  if (lider.value !== null) {
    emit("confirmar", lider.value);
    cerrarModalLider();
  } else {
    alert("Por favor selecciona una opción.");
  }
};

// Monitorea cambios en la visibilidad del modal
watch(
  () => props.isVisible,
  (newVal) => {
    isModalLiderVisible.value = newVal;
  }
);
</script>
