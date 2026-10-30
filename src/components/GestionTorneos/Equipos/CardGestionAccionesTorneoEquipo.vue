<template>
  <!-- Justo encima de los equipos, como Añadir jugador en individual. Generar la ronda 1 y el sorteo se piden
       desde la tarjeta de gestión, debajo de Descargar listas -->
  <div v-if="torneo" class="px-3 pt-3">
    <v-btn block variant="tonal" color="secondary" @click="openAddEquipo">
      {{ esParejas ? "Añadir pareja" : "Añadir equipo" }}
    </v-btn>

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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, defineProps, defineExpose } from "vue";
import ModalSorteo from "../ModalSorteo.vue";
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";
import ModalAddEquipo from "./ModalAddEquipo.vue";
import ModalParametrosPrimeraRondaEquipo from "./ModalParametrosPrimeraRondaEquipo.vue";

const props = defineProps<{
  torneo: TorneoEquipoGestionInfoDTO | null;
  rondaGenerada: boolean;
}>();

const esParejas = computed(() => props.torneo?.torneo.tipoTorneo === "Parejas");
const isLoading = ref<boolean>(true);
const isGenerating = ref<boolean>(false);
const showConfigModal = ref<boolean>(false);
const showSorteoModal = ref<boolean>(false);
const showModalAddEquipo = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const nicks = ref<string[]>([]);

const openConfigModal = async () => {
  // Con la ronda 1 ya generada no se vuelve a generar
  if (!props.torneo || props.rondaGenerada || isGenerating.value) return;
  isGenerating.value = true;

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

defineExpose({ abrirGenerarRonda1: openConfigModal, abrirSorteo: openSorteo });

watch(
  () => showSuccessModal.value,
  (newValue) => {
    if (!newValue) {
      window.location.reload();
    }
  }
);
</script>
