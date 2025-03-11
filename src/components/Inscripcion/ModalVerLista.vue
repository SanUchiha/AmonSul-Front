<template>
  <v-dialog v-model="internalIsVisible" max-width="500">
    <v-card>
      <v-card-title class="headline">Lista de {{ nick }} </v-card-title>
      <v-card-text>
        <div v-if="isLoading" class="loading-container">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <div v-else>
          <div v-if="imageBase64">
            <v-list dense>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">
                  {{ ejercito }}
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <img
              :src="imageBase64"
              alt="Lista cargada"
              class="uploaded-image"
            />
          </div>
          <div v-else>No se encontró una lista.</div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="tonal" color="secondary" @click="close">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ListaJugador } from "@/interfaces/Lista";
import { ref, watch, defineProps, defineEmits, onMounted } from "vue";

const props = defineProps<{
  isVisible: boolean;
  listaJugador: ListaJugador;
}>();
const emit = defineEmits(["update:isVisible"]);

const internalIsVisible = ref(props.isVisible);
const isLoading = ref(false);
const imageBase64 = ref<string>();
const nick = ref<string>();
const ejercito = ref<string>();

const cargarLista = async () => {
  isLoading.value = true;
  try {
    imageBase64.value = props.listaJugador.listaData;
    nick.value = props.listaJugador.nick;
    ejercito.value = props.listaJugador.nombreEjercito;
  } catch (error) {
    console.error("Error al cargar la lista", error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.isVisible,
  (newVal) => {
    internalIsVisible.value = newVal;
    if (newVal) cargarLista();
  }
);

const close = () => {
  emit("update:isVisible", false);
  internalIsVisible.value = false;
};

onMounted(cargarLista);
</script>

<style scoped>
.uploaded-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}
</style>
