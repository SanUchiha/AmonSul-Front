<!-- ModalPuntos.vue -->
<template>
  <v-dialog v-model="isModalEscenarioVisible" max-width="400">
    <v-card>
      <v-card-title> Ingresar escenario </v-card-title>
      <v-card-text>
        <v-form>
          <v-combobox
            v-model="escenario"
            :items="listaEscenarios"
            @click="loadEscenarios"
            label="Escenario"
          ></v-combobox>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          small
          variant="tonal"
          color="primary"
          @click="confirmarEscenario"
        >
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
import { appsettings } from "@/settings/appsettings";
import { ref, defineEmits, watch, defineProps } from "vue";

// Props recibidas
const props = defineProps({
  isVisible: Boolean,
  idPartidaTorneo: Number,
});

// Emite evento para cerrar el modal y enviar los puntos
const emit = defineEmits(["confirmar", "cerrar"]);

// Variables reactivas
const isModalEscenarioVisible = ref(true);
const escenario = ref<string>();
const listaEscenarios = ref<string[]>([]);
const isLoading = ref<boolean>(false);
const loadingEscenarios = ref<boolean>(false);

// Cerrar el modal
const cerrarModal = () => {
  emit("cerrar");
};

// Confirmar los puntos y cerrar el modal
const confirmarEscenario = () => {
  emit("confirmar", escenario.value);
  cerrarModal();
};

// Monitorea cambios en la visibilidad del modal
watch(
  () => props.isVisible,
  (newVal) => {
    isModalEscenarioVisible.value = newVal;
  }
);

const loadEscenarios = async () => {
  isLoading.value = true;
  loadingEscenarios.value = true;

  listaEscenarios.value = await appsettings.escenarios;

  isLoading.value = false;
  loadingEscenarios.value = false;
};
</script>
