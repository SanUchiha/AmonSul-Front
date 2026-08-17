<template>
  <v-card flat class="pa-4">
    <!-- Fecha e info general -->
    <div class="d-flex flex-column align-start ga-2 mb-2">
      <span class="text-subtitle-1">Fecha del torneo: {{ formatFecha(resumen.fecha) }}</span>
      <div class="d-flex align-center ga-2">
        <v-chip
          size="small"
          :color="resumen.listasVisibles ? 'primary' : 'default'"
          :style="resumen.listasVisibles ? 'cursor:pointer' : ''"
          @click="resumen.listasVisibles && emit('go-listas')"
        >
          Listas {{ resumen.listasVisibles ? 'visibles' : 'ocultas' }}
        </v-chip>
        <div
          v-if="resumen.listasVisibles"
          class="d-flex align-center ga-2"
        >
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="primary"
            :loading="isDownloading"
            :disabled="isDownloading"
            @click="descargarListas"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </div>
      </div>
      <v-chip
        size="small"
        :color="isLoadingPartidas ? 'grey' : (resumen.clasificacionVisible ? 'primary' : 'default')"
        :prepend-icon="isLoadingPartidas ? 'mdi-loading' : undefined"
        :style="!isLoadingPartidas && resumen.clasificacionVisible ? 'cursor:pointer' : ''"
        @click="!isLoadingPartidas && resumen.clasificacionVisible && emit('go-clasificacion')"
      >
        Clasificación {{ isLoadingPartidas ? '...' : (resumen.clasificacionVisible ? 'visible' : 'oculta') }}
      </v-chip>
    </div>

    <v-divider class="mb-3" />

    <!-- Estado de rondas -->
    <p class="text-subtitle-2 mb-2">Rondas</p>
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-chip
        v-for="(generada, i) in resumen.rondas"
        :key="i"
        :color="isLoadingPartidas ? 'grey' : (generada ? 'primary' : 'grey')"
        :prepend-icon="isLoadingPartidas ? 'mdi-loading' : (generada ? 'mdi-check-circle' : 'mdi-clock-outline')"
        :style="!isLoadingPartidas && generada ? 'cursor:pointer' : ''"
        variant="tonal"
        @click="!isLoadingPartidas && generada && emit('go-ronda', i + 1)"
      >
        Ronda {{ i + 1 }}
      </v-chip>
    </div>

    <!-- Ganadores -->
    <!-- Torneo individual: un podio -->
    <div v-if="!isTeamTournament && resumen.ganadores.length > 0">
      <v-divider class="mb-3" />
      <p class="text-subtitle-2 mb-2">Podio</p>
      <v-list density="compact">
        <v-list-item
          v-for="(ganador, i) in resumen.ganadores"
          :key="i"
          :prepend-icon="medalIcon(i)"
        >
          <v-list-item-title :style="{ color: medalColor(i) }">
            {{ ganador }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </div>

    <!-- Torneo por equipos: podio individual + podio equipos -->
    <template v-if="isTeamTournament">
      <div v-if="resumen.ganadores.length > 0">
        <v-divider class="mb-3" />
        <p class="text-subtitle-2 mb-2">Podio Individual</p>
        <v-list density="compact">
          <v-list-item
            v-for="(ganador, i) in resumen.ganadores"
            :key="i"
            :prepend-icon="medalIcon(i)"
          >
            <v-list-item-title :style="{ color: medalColor(i) }">
              {{ ganador }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <v-divider class="mb-3 mt-2" />
      <p class="text-subtitle-2 mb-2">Podio Equipos</p>
      <div v-if="isLoadingPartidas" class="d-flex align-center ga-2">
        <v-progress-circular indeterminate color="primary" size="20" width="2" />
        <span class="text-body-2 text-medium-emphasis">Cargando clasificación...</span>
      </div>
      <v-list v-else-if="podioEquipos && podioEquipos.length > 0" density="compact">
        <v-list-item
          v-for="(equipo, i) in podioEquipos"
          :key="i"
          :prepend-icon="medalIcon(i)"
        >
          <v-list-item-title :style="{ color: medalColor(i) }">
            {{ equipo }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <p v-else class="text-body-2 text-medium-emphasis">Sin resultados aún</p>
    </template>
  </v-card>

  <ModalError
    :isVisible="showErrorModal"
    message="No se han podido descargar las listas. Inténtalo de nuevo."
    @update:isVisible="showErrorModal = $event"
  />
  <LoadingLOTR
    :isVisible="isDownloading"
    mensaje="Generando PDF, por favor espera..."
  >
    <template #default>
      <div v-if="isDownloading" style="margin-top: 10px; text-align: center; font-size: 12px">
        {{ progressPDF }}%
      </div>
    </template>
  </LoadingLOTR>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ListaCompletaDTO } from "@/interfaces/Lista";
import { getListasTorneoAsync } from "@/services/TorneosService";
import { ResumenTorneoDTO } from "@/interfaces/Torneo";
import { descargarListasPDF } from "@/utils/descargarListas";
import LoadingLOTR from "@/components/Commons/LoadingLOTR.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const props = defineProps<{
  resumen: ResumenTorneoDTO;
  isLoadingPartidas?: boolean;
  tipoTorneo?: string;
  podioEquipos?: string[];
  idTorneo: number;
  nombreTorneo?: string;
}>();

const emit = defineEmits<{
  (e: "go-listas"): void;
  (e: "go-clasificacion"): void;
  (e: "go-ronda", n: number): void;
}>();

const isDownloading = ref(false);
const progressPDF = ref(0);
const showErrorModal = ref(false);

const isTeamTournament = computed(() =>
  ["Parejas", "Equipos_4", "Equipos_6"].includes(props.tipoTorneo ?? "")
);

function medalIcon(index: number): string {
  if (index === 0) return "mdi-medal";
  if (index === 1) return "mdi-medal";
  return "mdi-medal";
}

function medalColor(index: number): string {
  if (index === 0) return "#FFD700";
  if (index === 1) return "#C0C0C0";
  return "#CD7F32";
}

function formatFecha(fecha: string): string {
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

const descargarListas = async () => {
  try {
    isDownloading.value = true;
    const response = await getListasTorneoAsync(props.idTorneo);
    const listas: ListaCompletaDTO[] = response.data;
    await descargarListasPDF(
      listas,
      props.nombreTorneo ?? "",
      undefined,
      (current, total) => { progressPDF.value = Math.round((current / total) * 100); }
    );
  } catch (error) {
    console.error("Error descargando las listas:", error);
    showErrorModal.value = true;
  } finally {
    isDownloading.value = false;
    progressPDF.value = 0;
    showErrorModal.value = false;
  }
};
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
/* Aplica rotación al icono mdi-loading dentro de cualquier chip */
:deep(.mdi-loading) {
  animation: spin 1s linear infinite;
}
</style>
