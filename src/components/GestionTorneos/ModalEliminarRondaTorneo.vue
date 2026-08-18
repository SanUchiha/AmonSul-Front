<template>
  <v-dialog v-model="isModalEliminarVisible" max-width="400">
    <v-card>
      <v-card-title>Eliminar ronda</v-card-title>
      <v-card-text>
        ¿Estás seguro que deseas eliminar la ronda {{ idRonda }}? Esta acción
        eliminará todas las partidas de la ronda y no se puede deshacer.
      </v-card-text>
      <v-card-actions>
        <v-row justify="center" class="my-4 ga-5">
          <v-btn variant="tonal" color="error" @click="confirmar" large>
            Eliminar
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
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { deleteRonda } from "@/services/TorneosService";

//eslint-disable-next-line no-undef
const props = defineProps<{
  isVisible: boolean;
  idTorneo: number;
  idRonda: number;
}>();

//eslint-disable-next-line no-undef
const emit = defineEmits(["confirm", "cerrar", "error"]);

const isModalEliminarVisible = ref<boolean>(props.isVisible);
const isGenerating = ref<boolean>(false);

const cerrarModal = () => {
  emit("cerrar");
};

watch(
  () => props.isVisible,
  newVal => {
    isModalEliminarVisible.value = newVal;
  }
);

const confirmar = async () => {
  try {
    isGenerating.value = true;
    const response = await deleteRonda(props.idTorneo, props.idRonda);
    emit("confirm", response.data as string);
  } catch (err: any) {
    const mensaje = err.response?.data ?? "No se ha podido eliminar la ronda";
    emit("error", mensaje);
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
