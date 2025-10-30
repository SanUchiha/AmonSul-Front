<template>
  <v-dialog v-model="show" max-width="900px">
    <v-card class="elevation-2 rounded">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="headline">
          <v-icon color="primary" class="mr-2">mdi-podium</v-icon>
          Clasificación - {{ ligaNombre }}
        </span>
        <v-btn 
          icon 
          variant="text"
          @click="close"
          class="close-button"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <div v-if="clasificacion.length > 0" class="clasificacion-container">
          <div class="clasificacion-header d-flex justify-space-between align-center mb-4">
            <span class="clasificacion-count">
              {{ clasificacionFiltrada.length }} 
              {{ clasificacionFiltrada.length === 1 ? 'jugador' : 'jugadores' }}
              {{ searchTerm ? `(filtrado de ${clasificacion.length})` : '' }}
            </span>
            
            <!-- Buscador alineado a la derecha -->
            <v-text-field
              v-model="searchTerm"
              prepend-inner-icon="mdi-magnify"
              clearable
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 180px; min-width: 160px;"
            ></v-text-field>
          </div>
          
          <div class="tabla-simple">
            <!-- Header de la tabla -->
            <div class="tabla-header">
              <div class="header-pos">#</div>
              <div class="header-nick">Nick</div>
              <div class="header-totales">Total</div>
              <div class="header-ganados">Ganados</div>
              <div class="header-puntos">Puntos</div>
            </div>
            
            <!-- Filas de datos -->
            <div 
              v-for="(jugador, index) in clasificacionFiltrada" 
              :key="`${jugador.nick}-${index}`"
              class="jugador-row"
            >
              <div class="posicion">
                <v-icon v-if="getPosicionReal(jugador) === 0" size="small" color="#FFD700">mdi-medal</v-icon>
                <v-icon v-else-if="getPosicionReal(jugador) === 1" size="small" color="#C0C0C0">mdi-medal</v-icon>
                <v-icon v-else-if="getPosicionReal(jugador) === 2" size="small" color="#CD7F32">mdi-medal</v-icon>
                <span v-else>{{ getPosicionReal(jugador) + 1 }}</span>
              </div>
              <div class="nombre">{{ jugador.nick }}</div>
              <div class="puntos">{{ jugador.totalPuntos }}</div>
              <div class="torneos">{{ jugador.torneosGanados }}</div>
              <div class="puntos-detalle">
                <span v-for="(puntos, idx) in jugador.puntosPorTorneos" :key="idx" class="punto-individual">
                  {{ puntos }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Mensaje cuando no hay resultados de búsqueda -->
          <v-alert
            v-if="clasificacionFiltrada.length === 0 && searchTerm"
            type="warning"
            density="compact"
            variant="tonal"
            icon="mdi-account-search"
            class="my-4"
          >
            No se encontraron jugadores que coincidan con "{{ searchTerm }}"
          </v-alert>
        </div>
        
        <v-alert
          v-else-if="!loading"
          type="info"
          density="compact"
          variant="tonal"
          icon="mdi-information-outline"
          class="my-2"
        >
          No hay datos de clasificación disponibles para esta liga.
        </v-alert>
        
        <div v-if="loading" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <div class="mt-3 text-body-2 text-grey">Cargando clasificación...</div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="tonal" 
          @click="close"
        >
          <v-icon class="mr-2">mdi-close</v-icon>
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import type { ClasificacionItem } from "@/composables/useLigaData";

const props = defineProps<{
  modelValue: boolean;
  ligaNombre: string;
  clasificacion: ClasificacionItem[];
  loading?: boolean;
}>();

// Estado del buscador
const searchTerm = ref("");

// Clasificación filtrada
const clasificacionFiltrada = computed(() => {
  if (!searchTerm.value.trim()) {
    return props.clasificacion;
  }
  
  return props.clasificacion.filter(jugador => 
    jugador.nick.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Función para obtener la posición real del jugador
const getPosicionReal = (jugador: ClasificacionItem): number => {
  return props.clasificacion.findIndex(j => j.nick === jugador.nick);
};

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

const show = ref<boolean>(props.modelValue);

const close = () => {
  show.value = false;
  searchTerm.value = ""; // Limpiar búsqueda al cerrar
  emit("update:modelValue", false);
};

watch(() => props.modelValue, (newValue) => {
  show.value = newValue;
});

watch(show, (newValue) => {
  if (!newValue) {
    emit("update:modelValue", false);
  }
});
</script>

<style lang="scss" scoped>
.close-button {
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.clasificacion-container {
  .clasificacion-header {
    margin-bottom: 16px;
  }

  .clasificacion-count {
    font-size: 0.875rem;
  }
}

.tabla-simple {
  max-height: 400px;
  overflow-y: auto;
}

.tabla-header {
  display: grid;
  grid-template-columns: 30px minmax(100px, 1fr) 50px 40px 70px;
  gap: 6px;
  padding: 8px 0 12px 0;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    grid-template-columns: 40px 180px 80px 70px 120px;
    gap: 16px;
  }

  .header-pos {
    text-align: center;
  }

  .header-totales, .header-ganados {
    text-align: right;
  }

  .header-ganados {
    text-align: center;
  }
}

.jugador-row {
  display: grid;
  grid-template-columns: 30px minmax(100px, 1fr) 50px 40px 70px;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  min-height: 48px;
  align-items: center;

  @media (min-width: 768px) {
    grid-template-columns: 40px 180px 80px 70px 120px;
    gap: 16px;
    height: 64px;
  }

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .posicion {
    font-weight: 500;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nombre {
    font-weight: 400;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    display: flex;
    align-items: center;
  }

  .puntos {
    font-weight: 500;
    text-align: right;
  }

  .torneos {
    font-size: 0.8rem;
    text-align: center;
  }

  .puntos-detalle {
    display: flex;
    flex-wrap: wrap;
    gap: 1px;
    font-size: 0.5rem;

    @media (min-width: 768px) {
      gap: 2px;
      font-size: 0.625rem;
    }

    .punto-individual {
      background-color: #414a5c;
      color: #ffffff;
      padding: 1px 2px;
      border-radius: 2px;
      font-size: 0.5rem;
      line-height: 1.2;
      min-width: 12px;
      text-align: center;

      @media (min-width: 768px) {
        padding: 1px 3px;
        font-size: 0.625rem;
        min-width: 16px;
      }
    }

    .mas-puntos {
      font-style: italic;
      font-size: 0.5rem;
      padding: 1px 1px;

      @media (min-width: 768px) {
        font-size: 0.625rem;
        padding: 1px 2px;
      }
    }
  }
}
</style>