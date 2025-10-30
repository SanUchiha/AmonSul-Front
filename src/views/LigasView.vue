<template>
  <v-container>
    <v-card class="elevation-2 rounded">
      <v-card-title>
        <v-icon color="primary" class="mr-2">mdi-trophy-variant</v-icon>
        Ligas
      </v-card-title>
      
      <v-card-text>
        <div class="ligas-header">
          <v-icon size="small" color="primary" class="mr-1">mdi-format-list-bulleted</v-icon>
          <span class="ligas-count">{{ numeroLigas }} {{ numeroLigas === 1 ? 'liga disponible' : 'ligas disponibles' }}</span>
        </div>
        
        <div v-if="ligas.length > 0" class="ligas-container">
          <div 
            v-for="liga in ligas" 
            :key="liga.idLiga"
            class="liga-item"
            @click="openDialog(liga)"
          >
            <v-icon x-small color="secondary" class="mr-1">mdi-shield-crown</v-icon>
            <span class="liga-name">{{ liga.nombreLiga }}</span>
            <v-icon x-small color="grey" class="ml-auto">mdi-chevron-right</v-icon>
          </div>
        </div>
        
        <v-alert
          v-else-if="!loading"
          type="info"
          density="compact"
          variant="tonal"
          icon="mdi-information-outline"
          class="my-2"
        >
          No hay ligas disponibles en este momento.
        </v-alert>
        
        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </v-card-text>
    </v-card>

    <ModalLiga v-if="showModalLiga" :liga="selectedLiga" :showModalLiga="showModalLiga" @close="closeModal" />
  </v-container>
</template>

<script lang="ts" setup>
import ModalLiga from "@/components/Liga/ModalLiga.vue";
import { LigaDTO } from "@/interfaces/Liga";
import { getLigas } from "@/services/LigasService";
import { ref, onMounted, computed } from "vue";

const showModalLiga = ref<boolean>(false);
const selectedLiga = ref<LigaDTO | null>(null);

// Referencia para almacenar las ligas
const ligas = ref<LigaDTO[]>([]);
const loading = ref<boolean>(false);

// Computed para el número de ligas
const numeroLigas = computed(() => ligas.value.length);

// Función para cargar las ligas
const loadLigas = async () => {
  loading.value = true;
  try {
    const response = await getLigas();
    ligas.value = response.data;
  } catch (error) {
    console.error("Error al cargar ligas:", error);
  } finally {
    loading.value = false;
  }
};

// Función para abrir el modal con los detalles de la liga seleccionada
const openDialog = (liga: LigaDTO) => {
  selectedLiga.value = liga;
  showModalLiga.value = true;
};

const closeModal = () => {
  showModalLiga.value = false;
};

// Cargar ligas cuando el componente esté montado
onMounted(() => {
  loadLigas();
});
</script>

<style lang="scss" scoped>
.ligas-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.ligas-count {
  font-size: 0.9rem;
  font-weight: 600;
}

.ligas-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.liga-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 0.875rem;
  line-height: 1.2;
  border-radius: 4px;
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(25, 118, 210, 0.08);
    transform: translateX(4px);
  }
}

.liga-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
