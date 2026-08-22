<template>
  <v-window-item :value="tabClasificacion" :key="tabClasificacion">
    <template v-if="mostrarClasificacion !== false">
      <h3 class="text-h6 my-2">Clasificación por Equipos</h3>
      <TablaClasificacionEquipos :clasificacion="clasificacionEquipos" />
    </template>
    <v-alert v-else type="info" variant="tonal" class="ma-4">La clasificación está oculta</v-alert>
  </v-window-item>
</template>

// ...
<script setup lang="ts">
import { EquipoDTO } from "@/interfaces/Inscripcion";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { ClasificacionEquipo, Torneo } from "@/interfaces/Torneo";
import { ref, watch } from "vue";
import { generarClasificacionEquipos } from "@/utils/clasificacionEquipos";
import TablaClasificacionEquipos from "./TablaClasificacionEquipos.vue";

const props = defineProps<{
  tabClasificacion: number | undefined;
  activeTab: number;
  torneo: Torneo | undefined;
  partidas: PartidaTorneoDTO[];
  equipos: EquipoDTO[] | null | undefined;
  mostrarClasificacion?: boolean;
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
