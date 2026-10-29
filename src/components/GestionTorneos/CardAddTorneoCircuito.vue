<template>
  <v-card class="border" elevation="2">
    <v-card-text>
      <v-select
        label="Selecciona un circuito"
        :items="circuitosDisponibles"
        v-model="circuitoSelected"
        item-title="nombreCircuito"
        item-value="idCircuito"
        return-object
        variant="outlined"
        single-line
        clearable
        :disabled="circuitosDisponibles.length === 0"
      />
      <v-card-actions>
        <v-spacer class="my-4"></v-spacer>
        <v-btn
          :disabled="isGenerating || !circuitoSelected"
          @click="confirmar"
          color="primary"
          variant="tonal"
        >
          Añadir
        </v-btn>
      </v-card-actions>

      <v-divider class="my-4" />

      <div v-if="circuitosAsociados.length > 0">
        <h4 class="text-subtitle-1 font-weight-medium">Circuitos asociados:</h4>
        <v-list density="compact">
          <v-list-item v-for="circuito in circuitosAsociados" :key="circuito.idCircuito">
            <template #prepend>
              <v-icon icon="mdi-trophy" />
            </template>
            <v-list-item-title>{{ circuito.nombreCircuito }}</v-list-item-title>
            <template #append>
              <v-btn
                icon="mdi-close"
                size="small"
                color="red"
                variant="text"
                @click="eliminarCircuito(circuito.idCircuito)"
              />
            </template>
          </v-list-item>
        </v-list>
      </div>
      <div v-else class="text-medium-emphasis text-body-2">
        No hay circuitos asociados aún.
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
    message="Torneo añadido al circuito con éxito."
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
  addTorneoToCircuitoAsync,
  deleteCircuitoTorneoAsync,
  getCircuitosAsociadosATorneoAsync,
  getCircuitosNoTorneoAsync,
} from "@/services/CircuitosService";
import { AddCircuitoTorneoDTO, CircuitoDTO } from "@/interfaces/Circuito";

const props = defineProps<{
  idTorneo: number;
}>();

const circuitosDisponibles = ref<CircuitoDTO[]>([]);
const circuitosAsociados = ref<CircuitoDTO[]>([]);
const isGenerating = ref(false);
const showErrorModal = ref(false);
const showSuccessModal = ref(false);
const circuitoSelected = ref<CircuitoDTO>();

const cargarCircuitos = async () => {
  try {
    const [noAsociadosRes, asociadosRes] = await Promise.all([
      getCircuitosNoTorneoAsync(props.idTorneo),
      getCircuitosAsociadosATorneoAsync(props.idTorneo),
    ]);

    circuitosDisponibles.value = noAsociadosRes.data;
    circuitosAsociados.value = asociadosRes.data;
  } catch (error) {
    console.error("Error al cargar circuitos:", error);
    showErrorModal.value = true;
  }
};

const confirmar = async () => {
  if (!circuitoSelected.value || props.idTorneo === 0) return;

  try {
    isGenerating.value = true;

    const request: AddCircuitoTorneoDTO = {
      idCircuito: circuitoSelected.value.idCircuito,
      idTorneo: props.idTorneo,
    };

    await addTorneoToCircuitoAsync(request);
    showSuccessModal.value = true;
    circuitoSelected.value = undefined;
    await cargarCircuitos();
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
  }
};

const eliminarCircuito = async (idCircuito: number) => {
  try {
    isGenerating.value = true;
    await deleteCircuitoTorneoAsync(props.idTorneo, idCircuito);
    await cargarCircuitos();
  } catch (error) {
    console.error("Error al eliminar circuito del torneo", error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
  }
};

onMounted(async () => {
  if (props.idTorneo !== 0) {
    await cargarCircuitos();
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
