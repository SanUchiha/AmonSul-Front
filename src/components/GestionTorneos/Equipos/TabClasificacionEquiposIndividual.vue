<template>
  <v-window-item :value="tabClasificacion" :key="tabClasificacion">
    <TablaClasificacionIndividual
      :clasificacion="clasificacion"
      @click-ejercito="onClickEjercito"
    />
  </v-window-item>

  <ModalDetalleActuacionTorneo
    v-model:show="showModal"
    :jugador="clasificacionSelected!"
  />
</template>

<script setup lang="ts">
import ModalDetalleActuacionTorneo from "@/components/ResultadosTorneos/ModalDetalleActuacionTorneo.vue";
import TablaClasificacionIndividual from "./TablaClasificacionIndividual.vue";
import { Clasificacion } from "@/interfaces/Live";
import { defineProps, ref } from "vue";

defineProps<{
  tabClasificacion: number | undefined;
  activeTab: number;
  clasificacion: Clasificacion[];
}>();

const showModal = ref<boolean>(false);
const clasificacionSelected = ref<Clasificacion>();

function onClickEjercito(jugador: Clasificacion) {
  if (jugador) {
    clasificacionSelected.value = jugador;
    showModal.value = true;
  }
}
</script>

<style scoped>
.jugador-cell {
  text-align: center;
  padding: 8px;
}

.jugador-contenido {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.good-bando {
  background-color: #377746;
}

.evil-bando {
  background-color: #4b2263;
}
</style>
