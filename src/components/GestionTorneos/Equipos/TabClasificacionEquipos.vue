<template>
  <v-window-item :value="tabClasificacion" :key="tabClasificacion">
    <h3 class="text-h6 my-2">Clasificación por Equipos</h3>
    <TablaClasificacionEquipos :clasificacion="clasificacionEquipos" />
  </v-window-item>
</template>

// ...
<script setup lang="ts">
import { EquipoDTO } from "@/interfaces/Inscripcion";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { ClasificacionEquipo, Torneo } from "@/interfaces/Torneo";
import { defineProps, ref, watch, defineEmits } from "vue";
import { generarClasificacionEquipos } from "@/utils/clasificacionEquipos";
import TablaClasificacionEquipos from "./TablaClasificacionEquipos.vue";

const props = defineProps<{
  tabClasificacion: number | undefined;
  activeTab: number;
  torneo: Torneo | undefined;
  partidas: PartidaTorneoDTO[];
  equipos: EquipoDTO[] | null | undefined;
}>();

const emit = defineEmits(["enviarClasificacion"]);

const clasificacionEquipos = ref<ClasificacionEquipo[]>([]);

watch(
  [() => props.equipos, () => props.partidas, () => props.torneo],
  ([equipos, partidas, torneo]) => {
    if ((equipos?.length ?? 0) > 0 && (partidas?.length ?? 0) > 0) {
      clasificacionEquipos.value = generarClasificacionEquipos({
        equipos: equipos ?? [],
        partidas: partidas ?? [],
        torneo: torneo,
      });
      emit("enviarClasificacion", clasificacionEquipos.value);
    } else {
      clasificacionEquipos.value = [];
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.good-bando {
  background-color: #e0f7fa;
}
.evil-bando {
  background-color: #ffebee;
}
</style>
