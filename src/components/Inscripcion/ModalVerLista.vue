<template>
  <v-dialog v-model="visible" max-width="500">
    <v-card>
      <v-card-title class="headline">Lista de {{ nick }}</v-card-title>
      <v-card-text>
        <div v-if="isLoading" class="loading-container">
          <v-progress-circular indeterminate color="primary" />
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

            <img :src="imageBase64" alt="Lista cargada" class="uploaded-image" />
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
import { ref, defineProps, defineEmits, computed, watch } from "vue";

const props = defineProps<{
  isVisible: boolean;
  listaJugador: ListaJugador;
}>();

const emit = defineEmits<{
  (e: "update:isVisible", value: boolean): void;
}>();

const visible = computed({
  get: () => props.isVisible,
  set: (val: boolean) => emit("update:isVisible", val),
});

const isLoading = ref(false);
const imageBase64 = ref<string>();
const nick = ref<string>();
const ejercito = ref<string>();

const cargarLista = () => {
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

const close = () => {
  emit("update:isVisible", false);
};

// Re-cargar datos cada vez que se abre el modal
watch(visible, (newVal) => {
  if (newVal) {
    cargarLista();
  }
});
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
