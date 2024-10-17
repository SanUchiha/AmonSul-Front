<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Realizar sorteo</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form>
          <v-row justify="center" class="my-4 ga-5">
            <v-btn variant="tonal" color="primary" @click="sortear" large
              >Sortear</v-btn
            >
            <v-btn variant="tonal" color="secondary" @click="closeModal" large
              >Cancelar</v-btn
            >
          </v-row>
        </v-form>
      </v-card-text>
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
  <ModalSorteoSuccess
    :isVisible="showSuccessModal"
    :message="ganador"
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido realizar el sorteo. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import ModalError from "../Commons/ModalError.vue";
import ModalSorteoSuccess from "./ModalSorteoSuccess.vue";

const props = defineProps<{
  isVisible: boolean;
  participantes: string[] | undefined;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const ganador = ref<string>();

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const isGenerating = ref<boolean>(false);

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const sortear = async () => {
  try {
    isGenerating.value = true;
    const participantes = props.participantes;
    if (participantes === undefined)
      throw new Error("No hay participantes para el sorteo.");
    if (participantes.length === 0)
      throw new Error("No hay participantes para el sorteo.");

    const randomIndex = Math.floor(Math.random() * participantes.length);
    ganador.value = participantes[randomIndex];

    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    closeModal();
  }
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
</style>
