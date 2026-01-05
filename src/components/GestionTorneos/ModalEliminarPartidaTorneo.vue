<template>
  <v-dialog v-model="isModalEliminarVisible" max-width="400">
    <v-card>
      <v-card-title> Eliminar partida </v-card-title>
      <v-card-text>
        ¿Estás seguro que deseas eliminar la partida entre {{ partida.nick1 }} y
        {{ partida.nick2 }}?
      </v-card-text>
      <v-card-actions>
        <v-row justify="center" class="my-4 ga-5">
          <v-btn variant="tonal" color="primary" @click="confirmar" large>
            Confirmar
          </v-btn>

          <v-btn small variant="tonal" color="secondary" @click="cerrarModal">
            Cancelar
          </v-btn>
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
    message="Partida eliminada correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido eliminar la partida. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { UpdatePairingTorneoDTO } from "@/interfaces/Live";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { deletePartidaTorneo } from "@/services/PartidaTorneoService";

//eslint-disable-next-line no-undef
const props = defineProps<{
  isVisible: boolean;
  partida: UpdatePairingTorneoDTO;
}>();

//eslint-disable-next-line no-undef
const emit = defineEmits(["confirm", "cerrar"]);

const isModalEliminarVisible = ref<boolean>(props.isVisible);
const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

// Función para cerrar el modal
const cerrarModal = () => {
  emit("cerrar");
};

// Monitorea cambios en la visibilidad del modal
watch(
  () => props.isVisible,
  newVal => {
    isModalEliminarVisible.value = newVal;
  }
);

const confirmar = async () => {
  try {
    isGenerating.value = true;
    await deletePartidaTorneo(props.partida.idPartidaTorneo);
    showSuccessModal.value = true;
    emit("confirm", props.partida.idPartidaTorneo);
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    cerrarModal();
  }
};
</script>

<style>
.progress-card {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
</style>
