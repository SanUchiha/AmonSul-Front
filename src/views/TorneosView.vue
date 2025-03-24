<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading">
          <LoadingGandalf />
        </div>
        <div v-else>          
          <v-tabs v-model="tab" color="primary" grow>
            <v-tab value="proximos"> Próximos </v-tab>
            <v-tab value="pasados"> Pasados </v-tab>
          </v-tabs>
          <v-window v-model="tab" >
            <v-window-item value="proximos" >
              <div v-if="torneosFuturos.length < 1">
                No hay torneos próximos...
              </div>
              <v-row v-else dense>
                <v-col
                  v-for="torneo in torneosFuturos"
                  :key="torneo.idTorneo"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <TorneoCard 
                    :torneo="torneo" 
                    :verClasificacion=false
                  />
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item value="pasados">
              <div v-if="torneosPasados.length < 1">
                No hay torneos pasados...
              </div>
              <v-row v-else dense>
                <!-- Barra de herramientas con búsqueda -->
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="8" offset-sm="2" >
                      <v-text-field
                        v-model="searchQuery"
                        label="Buscar torneo"
                        clearable
                        outlined
                        dense
                        append-icon="mdi-magnify"
                        class="elevated-search"
                        @input="resetPage"
                      />
                    </v-col>
                  </v-row>
                </v-container>
                <v-col
                  v-for="torneo in paginatedTorneos"
                  :key="torneo.idTorneo"
                  cols="12"
                  sm="8" 
                  md="6"
                  lg="4"
                >
                  <TorneoCard 
                    :torneo="torneo" 
                    :verClasificacion=true
                  />
                </v-col>
              </v-row>

              <div class="pagination-container">
                <v-pagination
                  v-model="currentPage"
                  :length="totalPages"
                  class="mt-4 justify-center"
                  size="large"
                  color="primary"
                  variant="tonal"
                  :disabled="filteredTorneos.length === 0"
                />
                <p class="text-center mt-2">
                  Página {{ currentPage }} de {{ totalPages }}
                </p>
              </div>

              <!-- Mensaje si no hay torneos encontrados -->
              <div v-if="filteredTorneos.length === 0" class="text-center mt-4">
                <p>No se encontraron torneos que coincidan con la búsqueda.</p>
              </div>
            </v-window-item>
          </v-window>
        </div>
      </v-col>
    </v-row>
  </v-container>

</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { getTorneos } from "@/services/TorneosService";
import { ref, computed, onMounted } from "vue";
import TorneoCard from "@/components/Torneos/TorneoCard.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";

const listaTorneos = ref<Torneo[]>([]);
const torneosFuturos = ref<Torneo[]>([]);
const torneosPasados = ref<Torneo[]>([]);
const isLoading = ref(true);
const tab = ref(0);
const searchQuery = ref<string>("");
const currentPage = ref<number>(1);
const itemsPerPage = 6;

onMounted(async () => {
  isLoading.value = true;

  const responseTorneos = await getTorneos();
  listaTorneos.value = responseTorneos.data;

  const now = new Date().getTime();

  torneosFuturos.value = listaTorneos.value
    .filter((torneo) => new Date(torneo.fechaInicioTorneo).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.fechaInicioTorneo).getTime() -
        new Date(b.fechaInicioTorneo).getTime()
    );

  torneosPasados.value = listaTorneos.value.filter(
    (torneo) => new Date(torneo.fechaInicioTorneo).getTime() <= now
  ).toSorted((a,b)=>{
    return b.fechaInicioTorneo.localeCompare(a.fechaInicioTorneo);
  });

  isLoading.value = false;
});

const filteredTorneos = computed(() => {
  if (!searchQuery.value) {
    return torneosPasados.value; // Si el campo está vacío o null, devolver todos los torneos
  }
  return torneosPasados.value.filter((torneo) =>
    torneo.nombreTorneo.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Computed para obtener los torneos de la página actual
const totalPages = computed(() =>
  Math.ceil(filteredTorneos.value.length / itemsPerPage)
);

const paginatedTorneos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTorneos.value.slice(start, start + itemsPerPage);
});

// Función para resetear la página a 1 cuando se empieza a escribir
const resetPage = () => {
  currentPage.value = 1;
};
</script>

<style scoped>
.active-pointer {
  color: #ffb74d;
}
.inactive-pointer {
  color: gray;
}
</style>
