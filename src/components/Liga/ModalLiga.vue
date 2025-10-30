<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card class="elevation-2 rounded">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="headline">{{ props.liga?.nombreLiga }}</span>
        <v-btn 
          icon 
          size="small" 
          variant="text"
          @click="close"
          class="close-button"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <LigaTorneosList :torneos="torneos" />
      </v-card-text>
      
      <v-divider class="my-3"></v-divider>

      <LigaModalActions 
        @ver-clasificacion="abrirModalClasificacion"
        @close="close"
      />
    </v-card>
  </v-dialog>

  <!-- Modal de clasificación -->
  <ModalClasificacion 
    v-model="showModalClasificacion"
    :liga-nombre="props.liga?.nombreLiga || ''"
    :clasificacion="clasificacion"
    :loading="loadingClasificacion"
  />
</template>
<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import { LigaDTO } from "@/interfaces/Liga";
import { useLigaData } from "@/composables/useLigaData";
import LigaTorneosList from "./components/LigaTorneosList.vue";
import LigaModalActions from "./components/LigaModalActions.vue";
import ModalClasificacion from "./components/ModalClasificacion.vue";

const props = defineProps<{
  liga: LigaDTO | null;
  showModalLiga: boolean;
}>();

const emit = defineEmits<{ (event: "close"): void }>();

const show = ref<boolean>(true);
const showModalClasificacion = ref<boolean>(false);
const loadingClasificacion = ref<boolean>(false);

// Usar el composable para la lógica de datos
const { torneos, clasificacion, loadTorneos, prepareClasificacion } = useLigaData();

const close = () => {
  show.value = false;
  emit("close");
};

const abrirModalClasificacion = async () => {
  loadingClasificacion.value = true;
  showModalClasificacion.value = true;
  try {
    await prepareClasificacion();
  } catch (error) {
    console.error("Error al cargar la clasificación:", error);
  } finally {
    loadingClasificacion.value = false;
  }
};

watch(show, (newValue) => {
  if (!newValue) {
    emit("close");
  }
});

// Observa los cambios en props.liga para recargar torneos
watch(
  () => props.liga,
  (newLiga) => {
    if (newLiga) {
      loadTorneos(newLiga);
    }
  },
  { immediate: true }
);
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
</style>
