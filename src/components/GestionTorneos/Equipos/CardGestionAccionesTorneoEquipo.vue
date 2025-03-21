<template>
  <v-card v-if="torneo" class="mb-4">
    <!-- boton para generar los pairing pasandole el id del torneo -->
    <v-row justify="center" class="my-4 ga-5">
      <v-btn
        variant="tonal"
        @click="openAddJugadorModal"
        color="secondary"
        size="large"
        disabled
      >
        Añadir Equipo
      </v-btn>
      <v-btn
        variant="tonal"
        @click="openConfigModal"
        color="primary"
        size="large"
        disabled
      >
        Generar Ronda 1
      </v-btn>

      <v-btn variant="tonal" @click="openSorteo" color="primary" size="large">
        Sorteo
      </v-btn>
    </v-row>

    <ModalParametrosPrimeraRondaEquipo
      :isVisible="showConfigModal"
      :torneo="torneo"
      @close="closeConfigModal"
      @confirm="handleConfigConfirm"
    />
    <ModalAddEquipo
      :isVisible="showAddJugadorModal"
      :torneo="torneo"
      @close="closeAddJugadorModal"
      @confirm="handleAddJugadorConfirm"
    />
    <ModalSorteo
      :isVisible="showSorteoModal"
      :participantes="nicks"
      @close="closeSorteoModal"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { defineProps } from "vue";
import {
  InscripcionTorneoCreadoDTO,
  TorneoGestionInfoDTO,
} from "@/interfaces/Torneo";
import { getInfoTorneoCreado } from "@/services/TorneosService";
import ModalSorteo from "../ModalSorteo.vue";
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";
import ModalAddEquipo from "./ModalAddEquipo.vue";
import ModalParametrosPrimeraRondaEquipo from "./ModalParametrosPrimeraRondaEquipo.vue";

const props = defineProps<{ torneo: TorneoEquipoGestionInfoDTO | null }>();
const localInscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);
const isLoading = ref<boolean>(true);
const showConfigModal = ref<boolean>(false);
const showSorteoModal = ref<boolean>(false);
const showAddJugadorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const localTorneo = ref<TorneoGestionInfoDTO>();
const nicks = ref<string[]>();

const openConfigModal = async () => {
  isLoading.value = true;
  try {
    if (props.torneo?.torneo.idTorneo) {
      const responseTorneo = await getInfoTorneoCreado(
        props.torneo?.torneo.idTorneo
      );
      localTorneo.value = responseTorneo.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  showConfigModal.value = true;
};

const openSorteo = async () => {
  isLoading.value = true;
  try {
    nicks.value = localInscripciones.value
      .map((x) => x.nick)
      .filter((nick): nick is string => nick !== null && nick !== undefined);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  showSorteoModal.value = true;
};

const closeSorteoModal = () => {
  showSorteoModal.value = false;
};

const openAddJugadorModal = async () => {
  await props.torneo;
  showAddJugadorModal.value = true;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
  window.location.reload();
};

const closeAddJugadorModal = () => {
  showAddJugadorModal.value = false;
};

const handleConfigConfirm = () => {
  closeConfigModal();
};

const handleAddJugadorConfirm = () => {
  showAddJugadorModal.value = false;
  showSuccessModal.value = false;
  window.location.reload();
};

watch(
  () => showSuccessModal.value,
  (newValue) => {
    if (!newValue) {
      window.location.reload();
    }
  }
);
</script>
