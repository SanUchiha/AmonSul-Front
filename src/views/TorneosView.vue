<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <v-tabs v-model="tab" color="primary" grow>
          <v-tab value="proximos"> Próximos </v-tab>
          <v-tab value="pasados"> Pasados </v-tab>
        </v-tabs>
        <v-container>
          <v-row>
            <v-col cols="12" sm="8" offset-sm="2">
              <v-text-field
                v-model="searchQuery"
                label="Buscar torneo"
                clearable
                tonal
                dense
                append-icon="mdi-magnify"
                class="elevated-search"
                @input="resetPage"
              />
            </v-col>
          </v-row>
        </v-container>
        <div class="pagination-container">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            class="mb-4 justify-center"
            :size="tab === 'proximos' ? 'large' : 'small'"
            color="primary"
            variant="tonal"
            :disabled="
              (tab === 'proximos'
                ? paginatedTorneosProximos.length
                : paginatedTorneosPasados.length) === 0
            "
          />
          <p class="text-center mb-2">
            Página {{ currentPage }} de {{ totalPages }}
          </p>
        </div>
        <div style="position: relative; min-height: 120px">
          <LoadingGandalf
            v-if="isLoading"
            style="position: absolute; left: 0; right: 0; z-index: 2"
          />
          <template v-else>
            <template v-if="tab === 'proximos'">
              <div v-if="paginatedTorneosProximos.length < 1">
                No hay torneos próximos...
              </div>
              <v-row v-else dense>
                <v-col
                  v-for="torneo in paginatedTorneosProximos"
                  :key="torneo.idTorneo"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <TorneoCard :torneo="torneo" :verClasificacion="false" />
                </v-col>
              </v-row>
            </template>
            <template v-else>
              <div v-if="paginatedTorneosPasados.length < 1">
                No se encontraron torneos que coincidan con la búsqueda.
              </div>
              <v-row v-else dense>
                <v-col
                  v-for="torneo in paginatedTorneosPasados"
                  :key="torneo.idTorneo"
                  cols="12"
                  sm="8"
                  md="6"
                  lg="4"
                >
                  <TorneoCard :torneo="torneo" :verClasificacion="true" />
                </v-col>
              </v-row>
            </template>
          </template>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import debounce from "lodash/debounce";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import {
  getTorneosPasadosPaginadosAsync,
  getTorneosProximosPaginadosAsync,
  buscarTorneosPorNombreAsync,
} from "@/services/TorneosService";
import { Torneo } from "@/interfaces/Torneo";

const isLoading = ref(true);
const tab = ref("proximos");
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(6);

// Estado para próximos
const torneosProximos = ref<Torneo[]>([]);
const totalPagesProximos = ref(1);
const totalCountProximos = ref(0);

// Estado para pasados
const torneosPasados = ref<Torneo[]>([]);
const totalPagesPasados = ref(1);
const totalCountPasados = ref(0);

const fetchTorneosProximos = async () => {
  isLoading.value = true;
  try {
    if (searchQuery.value) {
      const res = await buscarTorneosPorNombreAsync(searchQuery.value);
      torneosProximos.value = res.data.filter(
        (t: { fechaInicioTorneo: string | number | Date }) =>
          new Date(t.fechaInicioTorneo) >= new Date()
      );
      totalPagesProximos.value = Math.max(
        1,
        Math.ceil(torneosProximos.value.length / pageSize.value)
      );
      totalCountProximos.value = torneosProximos.value.length;
    } else {
      const res = await getTorneosProximosPaginadosAsync(
        currentPage.value,
        pageSize.value
      );
      torneosProximos.value = res.data.items;
      totalPagesProximos.value = res.data.totalPages;
      totalCountProximos.value = res.data.totalCount;
    }
  } finally {
    isLoading.value = false;
  }
};

const fetchTorneosPasados = async () => {
  isLoading.value = true;
  try {
    if (searchQuery.value) {
      const res = await buscarTorneosPorNombreAsync(searchQuery.value);
      torneosPasados.value = res.data.filter(
        (t: { fechaInicioTorneo: string | number | Date }) =>
          new Date(t.fechaInicioTorneo) < new Date()
      );
      totalPagesPasados.value = Math.max(
        1,
        Math.ceil(torneosPasados.value.length / pageSize.value)
      );
      totalCountPasados.value = torneosPasados.value.length;
    } else {
      const res = await getTorneosPasadosPaginadosAsync(
        currentPage.value,
        pageSize.value
      );
      torneosPasados.value = res.data.items;
      totalPagesPasados.value = res.data.totalPages;
      totalCountPasados.value = res.data.totalCount;
    }
  } finally {
    isLoading.value = false;
  }
};

// Watchers para recargar según pestaña y página
watch(tab, async newTab => {
  currentPage.value = 1;
  if (newTab === "proximos") {
    await fetchTorneosProximos();
  } else {
    await fetchTorneosPasados();
  }
});

watch(currentPage, async () => {
  if (tab.value === "proximos") {
    await fetchTorneosProximos();
  } else {
    await fetchTorneosPasados();
  }
});

// Búsqueda reactiva con debounce
const debouncedBuscar = debounce(async () => {
  currentPage.value = 1;
  if (tab.value === "proximos") {
    await fetchTorneosProximos();
  } else {
    await fetchTorneosPasados();
  }
}, 400);

watch(searchQuery, () => {
  debouncedBuscar();
});

// Inicialización
onMounted(async () => {
  if (tab.value === "proximos") {
    await fetchTorneosProximos();
  } else {
    await fetchTorneosPasados();
  }
});

// Computed para búsqueda solo sobre la página actual de pasados
const filteredTorneosPasados = computed(() => {
  if (!searchQuery.value) return torneosPasados.value;
  return torneosPasados.value.filter(torneo =>
    torneo.nombreTorneo.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const resetPage = () => {
  currentPage.value = 1;
};

// Computed para la paginación y datos actuales
const paginatedTorneosProximos = computed(() => torneosProximos.value);
const paginatedTorneosPasados = computed(() => filteredTorneosPasados.value);
const totalPages = computed(() =>
  tab.value === "proximos" ? totalPagesProximos.value : totalPagesPasados.value
);
</script>

<style scoped>
.active-pointer {
  color: #ffb74d;
}
.inactive-pointer {
  color: gray;
}
</style>
