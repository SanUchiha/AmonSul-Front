<template>
  <v-container>
    <v-row>
      <v-col v-for="liga in ligas" :key="liga.idLiga" cols="12" sm="6" md="4">
        <v-card @click="openDialog(liga)">
          <v-card-title>{{ liga.nombreLiga }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <ModalLiga
      :liga="selectedLiga"
      :showModalLiga="showModalLiga"
      @update:showModalLiga="showModalLiga = $event"
    />
  </v-container>
</template>

<script lang="ts" setup>
import ModalLiga from "@/components/Liga/ModalLiga.vue";
import { LigaDTO } from "@/interfaces/Liga";
import { getLigas } from "@/services/LigasService";
import { ref, onMounted } from "vue";

const showModalLiga = ref<boolean>(false);
const selectedLiga = ref<LigaDTO | null>(null);

// Referencia para almacenar las ligas
const ligas = ref<LigaDTO[]>([]);
const loading = ref<boolean>(false);

// Función para cargar las ligas
const loadLigas = async () => {
  loading.value = true;
  try {
    const response = await getLigas();
    ligas.value = response.data;
    console.log(response.data);
  } catch (error) {
    console.error("Error al cargar ligas:", error);
  } finally {
    loading.value = false;
  }
};

// Función para abrir el modal con los detalles de la liga seleccionada
const openDialog = (liga: LigaDTO) => {
  selectedLiga.value = liga;
  console.log(selectedLiga.value);
  showModalLiga.value = true;
};

// Cargar ligas cuando el componente esté montado
onMounted(() => {
  loadLigas();
});
</script>

<style lang="scss" scoped>
.v-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
}
</style>
