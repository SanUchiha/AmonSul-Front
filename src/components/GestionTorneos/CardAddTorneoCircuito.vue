<template>
  <v-card variant="outlined" class="pa-3 text-left circuitos">
    <div class="d-flex align-center ga-2 mb-1">
      <v-icon icon="mdi-trophy-outline" color="primary" />
      <span class="text-subtitle-1 font-weight-bold">Circuitos</span>
    </div>
    <p class="text-caption text-medium-emphasis mb-3">
      {{ capitalizar(textos.el) }} suma para la clasificación de los
      circuitos en los que esté.
    </p>

    <!-- Los asociados como chips. La x es propia: la de "closable" esconde el chip aunque se cancele -->
    <div v-if="circuitosAsociados.length > 0" class="d-flex flex-wrap ga-2 mb-3">
      <v-chip
        v-for="circuito in circuitosAsociados"
        :key="circuito.idCircuito"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-trophy"
      >
        {{ circuito.nombreCircuito }}
        <template #append>
          <v-icon
            icon="mdi-close-circle"
            size="small"
            class="ms-1"
            role="button"
            :aria-label="`Quitar de ${circuito.nombreCircuito}`"
            @click.stop="pedirQuitar(circuito)"
          />
        </template>
      </v-chip>
    </div>
    <p v-else class="text-body-2 text-medium-emphasis mb-3">
      Aún no está en ningún circuito.
    </p>

    <div class="d-flex align-center ga-2">
      <v-autocomplete
        v-model="circuitoSelected"
        :items="circuitosDisponibles"
        item-title="nombreCircuito"
        return-object
        label="Añadir a un circuito"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-magnify"
        hide-details
        clearable
        no-data-text="No quedan circuitos por añadir"
        :disabled="circuitosDisponibles.length === 0"
        class="flex-grow-1"
      />
      <v-btn
        icon="mdi-plus"
        color="primary"
        variant="tonal"
        aria-label="Añadir al circuito"
        :disabled="isGenerating || !circuitoSelected"
        @click="confirmar"
      />
    </div>
  </v-card>

  <!-- Quitar de un circuito -->
  <v-dialog v-model="showQuitar" max-width="420">
    <v-card>
      <v-card-title class="text-wrap">
        ¿Quitar {{ textos.el }} de
        {{ circuitoQuitar?.nombreCircuito }}?
      </v-card-title>
      <v-card-text>
        Dejará de contar para la clasificación de ese circuito. Puedes volver a
        añadirlo cuando quieras.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="showQuitar = false">
          Cancelar
        </v-btn>
        <v-btn color="error" variant="tonal" @click="quitar">Quitar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" persistent width="200">
    <v-card class="pa-6 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" size="60" />
    </v-card>
  </v-dialog>

  <!-- Modal éxito -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    :message="mensajeExito"
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
import { computed, ref, defineProps, onMounted } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import {
  addTorneoToCircuitoAsync,
  deleteCircuitoTorneoAsync,
  getCircuitosAsociadosATorneoAsync,
  getCircuitosNoTorneoAsync,
} from "@/services/CircuitosService";
import { AddCircuitoTorneoDTO, CircuitoDTO } from "@/interfaces/Circuito";
import { textosEvento } from "@/Constant/FormatoTorneo";

const props = defineProps<{
  idTorneo: number;
  // Solo cambia los textos
  formato?: string | null;
}>();

// Los textos hablan del tipo de evento: torneo, liga o copa
const textos = computed(() => textosEvento(props.formato));
const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

const circuitosDisponibles = ref<CircuitoDTO[]>([]);
const circuitosAsociados = ref<CircuitoDTO[]>([]);
const isGenerating = ref(false);
const showErrorModal = ref(false);
const showSuccessModal = ref(false);
const mensajeExito = ref("");
const circuitoSelected = ref<CircuitoDTO | null>(null);
const showQuitar = ref(false);
const circuitoQuitar = ref<CircuitoDTO | null>(null);

// Los más nuevos primero
const masNuevoPrimero = (a: CircuitoDTO, b: CircuitoDTO) =>
  b.idCircuito - a.idCircuito;

const cargarCircuitos = async () => {
  try {
    const [noAsociadosRes, asociadosRes] = await Promise.all([
      getCircuitosNoTorneoAsync(props.idTorneo),
      getCircuitosAsociadosATorneoAsync(props.idTorneo),
    ]);

    circuitosDisponibles.value = [...noAsociadosRes.data].sort(masNuevoPrimero);
    circuitosAsociados.value = [...asociadosRes.data].sort(masNuevoPrimero);
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
    mensajeExito.value = `${capitalizar(textos.value.el)} se ha añadido a ${circuitoSelected.value.nombreCircuito}.`;
    showSuccessModal.value = true;
    circuitoSelected.value = null;
    await cargarCircuitos();
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
  }
};

function pedirQuitar(circuito: CircuitoDTO) {
  circuitoQuitar.value = circuito;
  showQuitar.value = true;
}

const quitar = async () => {
  showQuitar.value = false;
  if (!circuitoQuitar.value) return;
  try {
    isGenerating.value = true;
    await deleteCircuitoTorneoAsync(props.idTorneo, circuitoQuitar.value.idCircuito);
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
.circuitos {
  border-radius: 10px;
}
</style>
