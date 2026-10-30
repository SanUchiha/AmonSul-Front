<template>
  <v-container>
    <v-card class="elevation-2 rounded">
      <v-card-title>
        <v-icon color="primary" class="mr-2">mdi-trophy-variant</v-icon>
        Circuitos
      </v-card-title>
      
      <v-card-text>
        <div class="circuitos-header">
          <v-icon size="small" color="primary" class="mr-1">mdi-format-list-bulleted</v-icon>
          <span class="circuitos-count">{{ numeroCircuitos }} {{ numeroCircuitos === 1 ? 'circuito disponible' : 'circuitos disponibles' }}</span>
        </div>
        
        <div v-if="circuitos.length > 0" class="circuitos-container">
          <div 
            v-for="circuito in circuitos" 
            :key="circuito.idCircuito"
            class="circuito-item"
            @click="openDialog(circuito)"
          >
            <v-icon x-small color="secondary" class="mr-1">mdi-shield-crown</v-icon>
            <span class="circuito-name">{{ circuito.nombreCircuito }}</span>
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
          No hay circuitos disponibles en este momento.
        </v-alert>
        
        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </v-card-text>
    </v-card>

    <ModalCircuito v-if="showModalCircuito" :circuito="selectedCircuito" :showModalCircuito="showModalCircuito" @close="closeModal" />
  </v-container>
</template>

<script lang="ts" setup>
import ModalCircuito from "@/components/Circuito/ModalCircuito.vue";
import { CircuitoDTO } from "@/interfaces/Circuito";
import { getCircuitos } from "@/services/CircuitosService";
import { ref, onMounted, computed } from "vue";

const showModalCircuito = ref<boolean>(false);
const selectedCircuito = ref<CircuitoDTO | null>(null);

// Referencia para almacenar los circuitos
const circuitos = ref<CircuitoDTO[]>([]);
const loading = ref<boolean>(false);

// Computed para el número de circuitos
const numeroCircuitos = computed(() => circuitos.value.length);

// Función para cargar los circuitos
const loadCircuitos = async () => {
  loading.value = true;
  try {
    const response = await getCircuitos();
    // Los más nuevos primero, como al añadir un torneo a un circuito: en el móvil los de este año quedaban al final
    circuitos.value = [...response.data].sort((a: CircuitoDTO, b: CircuitoDTO) => b.idCircuito - a.idCircuito);
  } catch (error) {
    console.error("Error al cargar circuitos:", error);
  } finally {
    loading.value = false;
  }
};

// Función para abrir el modal con los detalles del circuito seleccionado
const openDialog = (circuito: CircuitoDTO) => {
  selectedCircuito.value = circuito;
  showModalCircuito.value = true;
};

const closeModal = () => {
  showModalCircuito.value = false;
};

// Cargar circuitos cuando el componente esté montado
onMounted(() => {
  loadCircuitos();
});
</script>

<style lang="scss" scoped>
.circuitos-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.circuitos-count {
  font-size: 0.9rem;
  font-weight: 600;
}

.circuitos-container {
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

.circuito-item {
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

.circuito-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
