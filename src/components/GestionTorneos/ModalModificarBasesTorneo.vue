<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Modificar bases</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form ref="form" v-model="isValid" lazy-validation>
          <v-file-input
            clearable
            label="Bases del torneo"
            required
            accept="application/pdf"
            @change="onFileChange"
          ></v-file-input>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center" class="my-4 ga-5">
          <v-btn
            :disabled="isGenerating"
            @click="confirmarConfiguracion"
            color="primary"
            variant="tonal"
            >Subir</v-btn
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
    message="Bases subidas correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se han podido subir las bases. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { ModificarBasesTorneoDTO, Torneo } from "@/interfaces/Torneo";
import { ModificarBasesTorneoAsync } from "@/services/TorneosService";

const props = defineProps<{
  isVisible: boolean;
  torneo: Torneo;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);
const isValid = ref(true);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const byteArrayBases = ref<Uint8Array | null>(null);
const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        byteArrayBases.value = new Uint8Array(arrayBuffer);
      }
    };

    reader.readAsArrayBuffer(file);
  }
};

const confirmarConfiguracion = async () => {
  const basesTorneoBase64 = byteArrayBases.value
    ? btoa(
        new Uint8Array(byteArrayBases.value).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )
    : "";

  const modificarBaess: ModificarBasesTorneoDTO = {
    basesTorneo: basesTorneoBase64,
    idTorneo: props.torneo?.idTorneo,
  };
  try {
    isGenerating.value = true;
    await ModificarBasesTorneoAsync(modificarBaess);
    showSuccessModal.value = true;
  } catch (error) {
    showErrorModal.value = true;
    console.error(error);
  } finally {
    isGenerating.value = false;
  }

  emit("confirm");
  closeModal();
};
</script>
<style scoped>
.remove-btn {
  background-color: transparent;
  color: red;
  margin-left: 16px; /* Espacio entre el texto y el botón */
  padding: 0;
  min-width: auto;
  display: flex;
  align-items: center;
}

.remove-btn .v-icon {
  font-size: 18px; /* Tamaño del ícono */
}

.emparejamientos-container {
  display: flex;
  flex-direction: column;
}

.emparejamiento-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.emparejamiento-text {
  flex-grow: 1;
}

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
