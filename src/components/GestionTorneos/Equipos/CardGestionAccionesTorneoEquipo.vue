<template>
  <v-card v-if="torneo" class="mb-4 pa-4">
    <v-card-title class="text-h6 font-weight-bold">Acciones</v-card-title>

    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-btn block variant="tonal" color="secondary" @click="openAddEquipo">
            Añadir Equipo
          </v-btn>
        </v-col>
        <v-col cols="12" sm="4">
          <!-- TODO: controlar que si esta la ronda generada no pueda generarla otra vez -->
          <v-btn
            block
            variant="tonal"
            color="primary"
            @click="openConfigModal"
            :disabled="rondaGenerada || isGenerating"
          >
            Generar Ronda 1
          </v-btn>
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn block variant="tonal" color="primary" @click="openSorteo">
            Sorteo
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <ModalParametrosPrimeraRondaEquipo
      :isVisible="showConfigModal"
      :torneo="torneo"
      @close="closeConfigModal"
      @confirm="handleConfigConfirm"
    />
    <ModalAddEquipo
      :isVisible="showModalAddEquipo"
      :torneo="torneo"
      @close="closeModalAddEquipo"
      @confirm="handleAddEquipoConfirm"
    />
    <ModalSorteo
      :isVisible="showSorteoModal"
      :participantes="nicks"
      @close="closeSorteoModal"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from "vue";
import ModalSorteo from "../ModalSorteo.vue";
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";
import ModalAddEquipo from "./ModalAddEquipo.vue";
import ModalParametrosPrimeraRondaEquipo from "./ModalParametrosPrimeraRondaEquipo.vue";

const props = defineProps<{
  torneo: TorneoEquipoGestionInfoDTO | null;
  rondaGenerada: boolean;
}>();
const isLoading = ref<boolean>(true);
const isGenerating = ref<boolean>(false);
const showConfigModal = ref<boolean>(false);
const showSorteoModal = ref<boolean>(false);
const showModalAddEquipo = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const nicks = ref<string[]>([]);

const openConfigModal = async () => {
  isGenerating.value = true;
  if (!props.torneo) return;

  showConfigModal.value = true;
};

const openSorteo = async () => {
  isLoading.value = true;

  if (props.torneo) {
    nicks.value = props.torneo.equipos.flatMap((equipo) =>
      equipo.inscripciones.map((i) => i.nick)
    );
  }

  showSorteoModal.value = true;
  isLoading.value = false;
};

const closeSorteoModal = () => {
  showSorteoModal.value = false;
};

const openAddEquipo = async () => {
  showModalAddEquipo.value = true;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
  isGenerating.value = false;
};

const closeModalAddEquipo = () => {
  showModalAddEquipo.value = false;
};

const handleConfigConfirm = () => {
  closeConfigModal();
  window.location.reload();
};

const handleAddEquipoConfirm = () => {
  showModalAddEquipo.value = false;
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
