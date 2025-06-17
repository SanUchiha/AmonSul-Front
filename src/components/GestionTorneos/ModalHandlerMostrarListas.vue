<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>
        {{ torneo?.mostrarListas ? "Ocultar listas" : "Mostrar listas" }}
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="text-center my-4">
        ¿Estás seguro de que quieres
        {{ torneo?.mostrarListas ? "ocultar" : "mostrar" }} las listas de los
        jugadores?
      </v-card-text>
      <v-card-actions>
        <v-row justify="center" class="my-4 ga-5">
          <v-btn
            :disabled="isGenerating"
            @click="confirmarConfiguracion"
            color="primary"
            variant="tonal"
          >
            {{ torneo?.mostrarListas ? "Ocultar" : "Mostrar" }}</v-btn
          >
          <v-btn variant="tonal" color="secondary" @click="closeModal" large
            >Cancelar</v-btn
          >
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
      ></v-progress-circular>
    </v-card>
  </v-dialog>

  <!-- Modal response eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    :message="successMessage"
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    :message="errorMessage"
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { HandlerMostarListasDTO, Torneo } from "@/interfaces/Torneo";
import { HandlerMostarListasAsync } from "@/services/TorneosService";

const props = defineProps<{
  isVisible: boolean;
  torneo: Torneo | undefined;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

const successMessage = ref<string>("");
const errorMessage = ref<string>("");

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const confirmarConfiguracion = async () => {
  const mostrar = !props.torneo?.mostrarListas;
  const request: HandlerMostarListasDTO = {
    mostrarListas: mostrar,
    idTorneo: props.torneo?.idTorneo,
  };
  try {
    isGenerating.value = true;
    await HandlerMostarListasAsync(request);
    successMessage.value = mostrar
      ? "Las listas son visibles."
      : "Las listas se han ocultado.";
    showSuccessModal.value = true;
    emit("confirm", mostrar);
  } catch (error) {
    errorMessage.value = mostrar
      ? "Hubo un error al intentar mostrar las listas."
      : "Hubo un error al intentar ocultar las listas.";
    showErrorModal.value = true;
    console.error(error);
  } finally {
    isGenerating.value = false;
  }

  closeModal();
};
</script>
<style scoped>
.progress-card {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
