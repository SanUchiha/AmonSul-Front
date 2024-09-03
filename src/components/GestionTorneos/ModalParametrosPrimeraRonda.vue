<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Configurar Primera Ronda</v-card-title>

      <v-card-text>
        <v-form>
          <v-text-field
            v-model="numeroMesas"
            label="Número de Mesas"
            type="number"
            min="1"
            required
          ></v-text-field>

          <v-select
            v-model="tipoEmparejamiento"
            :items="tiposEmparejamiento"
            label="Tipo de Emparejamiento"
            required
          ></v-select>

          <v-checkbox
            v-model="incluirBye"
            label="Incluir 'Bye' si hay número impar de jugadores"
          ></v-checkbox>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeModal">Cancelar</v-btn>
        <v-btn @click="confirmarConfiguracion" color="primary">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";

const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const numeroMesas = ref(1);
const tipoEmparejamiento = ref("");
const incluirBye = ref(false);

const tiposEmparejamiento = ref(["Aleatorio", "Basado en Ranking", "Swiss"]);

const closeModal = () => {
  internalIsVisible.value = false;

  emit("close");
};

const confirmarConfiguracion = () => {
  const configuracion = {
    numeroMesas: numeroMesas.value,
    tipoEmparejamiento: tipoEmparejamiento.value,
    incluirBye: incluirBye.value,
  };
  emit("confirm", configuracion);
  closeModal();
};
</script>
