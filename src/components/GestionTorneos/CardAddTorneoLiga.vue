<template>
  <v-card class="border" elevation="2">
    <v-card-text>
      <v-select
        label="Selecciona una liga"
        :items="ligasDisponibles"
        v-model="ligaSelected"
        item-title="nombreLiga"
        item-value="idLiga"
        return-object
        variant="tonal"
        clearable
        :disabled="ligasDisponibles.length === 0"
      />
      <v-card-actions>
        <v-spacer class="my-4"></v-spacer>
        <v-btn
          :disabled="isGenerating || !ligaSelected"
          @click="confirmar"
          color="primary"
          variant="tonal"
        >
          Añadir
        </v-btn>
      </v-card-actions>

      <v-divider class="my-4" />

      <div v-if="ligasAsociadas.length > 0">
        <h4 class="text-subtitle-1 font-weight-medium">Ligas asociadas:</h4>
        <v-list density="compact">
          <v-list-item v-for="liga in ligasAsociadas" :key="liga.idLiga">
            <template #prepend>
              <v-icon icon="mdi-trophy" />
            </template>
            <v-list-item-title>{{ liga.nombreLiga }}</v-list-item-title>
            <template #append>
              <v-btn
                icon="mdi-close"
                size="small"
                color="red"
                variant="text"
                @click="eliminarLiga(liga.idLiga)"
              />
            </template>
          </v-list-item>
        </v-list>
      </div>
      <div v-else class="text-medium-emphasis text-body-2">
        No hay ligas asociadas aún.
      </div>
    </v-card-text>
  </v-card>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular indeterminate color="primary" size="70" />
    </v-card>
  </v-dialog>

  <!-- Modal éxito -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Torneo añadido a la liga con éxito."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal error -->
  <ModalError
    :isVisible="showErrorModal"
    message="Ha ocurrido un error. Inténtalo de nuevo o contacta al administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import {
  addTorneoToLigaAsync,
  deleteLigaTorneoAsync,
  getLigasAsocidasATorneoAsync,
  getLigasNoTorneoAsync,
} from "@/services/LigasService";
import { AddLigaTorneoDTO, LigaDTO } from "@/interfaces/Liga";

const props = defineProps<{
  idTorneo: number;
}>();

const ligasDisponibles = ref<LigaDTO[]>([]);
const ligasAsociadas = ref<LigaDTO[]>([]);
const isGenerating = ref(false);
const showErrorModal = ref(false);
const showSuccessModal = ref(false);
const ligaSelected = ref<LigaDTO>();

const cargarLigas = async () => {
  try {
    const [noAsociadasRes, asociadasRes] = await Promise.all([
      getLigasNoTorneoAsync(props.idTorneo),
      getLigasAsocidasATorneoAsync(props.idTorneo),
    ]);

    ligasDisponibles.value = noAsociadasRes.data;
    ligasAsociadas.value = asociadasRes.data;
  } catch (error) {
    console.error("Error al cargar ligas:", error);
    showErrorModal.value = true;
  }
};

const confirmar = async () => {
  if (!ligaSelected.value || props.idTorneo === 0) return;

  try {
    isGenerating.value = true;

    const request: AddLigaTorneoDTO = {
      idLiga: ligaSelected.value.idLiga,
      idTorneo: props.idTorneo,
    };

    await addTorneoToLigaAsync(request);
    showSuccessModal.value = true;
    ligaSelected.value = undefined;
    await cargarLigas();
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
  }
};

const eliminarLiga = async (idLiga: number) => {
  try {
    isGenerating.value = true;
    await deleteLigaTorneoAsync(props.idTorneo, idLiga);
    await cargarLigas();
  } catch (error) {
    console.error("Error al eliminar liga del torneo", error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
  }
};

onMounted(async () => {
  if (props.idTorneo !== 0) {
    await cargarLigas();
  }
});
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
.border {
  border: 1px solid #dcdcdc;
  border-radius: 10px;
}
</style>
