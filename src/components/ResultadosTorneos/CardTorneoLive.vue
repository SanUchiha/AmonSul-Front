<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else>
    <!-- Barra de herramientas con búsqueda -->
    <v-container class="mb-4">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8">
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

    <!-- Lista de torneos como tarjetas -->
    <v-container>
      <v-row>
        <v-col
          v-for="torneo in paginatedTorneos"
          :key="torneo.idTorneo"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="hover-card"
            tonal
            @click="verTorneo(torneo.idTorneo)"
            role="button"
            tabindex="0"
          >
            <v-img :src="torneo.cartelTorneo" height="200" cover></v-img>
            <v-card-title class="text-wrap justify-center text-center">
              {{ torneo.nombreTorneo }}
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import router from "@/router";
import { getTorneos } from "@/services/TorneosService";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";
import { Torneo } from "@/interfaces/Torneo";

const listaTorneos = ref<Torneo[]>([]);
const isLoading = ref<boolean>(false);
const searchQuery = ref<string>("");
const currentPage = ref<number>(1);
const itemsPerPage = 6;

// Llamada a la API para obtener los torneos
onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await getTorneos();
    listaTorneos.value = response.data;
    listaTorneos.value = listaTorneos.value.reverse();
  } catch (error) {
    console.error("Error al cargar los torneos:", error);
  } finally {
    isLoading.value = false;
  }
});

const filteredTorneos = computed(() => {
  if (!searchQuery.value) {
    return listaTorneos.value; // Si el campo está vacío o null, devolver todos los torneos
  }
  return listaTorneos.value.filter((torneo) =>
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

// Navegar al detalle del torneo
const verTorneo = (idTorneo: number) => {
  router.push({ name: "detalle-torneo-live", params: { idTorneo } });
};

// Función para resetear la página a 1 cuando se empieza a escribir
const resetPage = () => {
  currentPage.value = 1;
};
</script>

<style scoped>
/* Espaciado entre tarjetas */
.hover-card {
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
.elevated-search .v-text-field__control {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.v-img {
  border-radius: 8px;
}
</style>
