<template>
  <v-dialog v-model="internalIsVisible" max-width="500">
    <v-card>
      <v-card-title class="headline">Lista</v-card-title>
      <v-card-text>
        <div v-if="!hasLista">
          <v-textarea
            v-model="internalLista"
            label="Ingrese la lista"
            rows="10"
            clear-icon="mdi-close-circle"
            clearable
          ></v-textarea>
        </div>
        <div v-else>
          <v-textarea
            v-model="internalLista"
            label="Tu lista"
            rows="10"
            clear-icon="mdi-close-circle"
            clearable
          ></v-textarea>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div v-if="!hasLista">
          <v-btn color="primary" @click="enviarLista">Enviar</v-btn>
        </div>
        <div v-else>
          <v-btn color="primary" @click="modificarLista">Modificar</v-btn>
        </div>
        <v-btn color="secondary" @click="close">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { getlista } from "@/services/ListasService";
import { defineProps, defineEmits, ref, watch, onMounted } from "vue";

const props = defineProps<{
  isVisible: boolean;
  hasLista: boolean;
  idInscripcion: number;
}>();

const internalIsVisible = ref(props.isVisible);
const internalLista = ref();

watch(
  () => props.isVisible,
  (newVal) => {
    internalIsVisible.value = newVal;
  }
);

const emit = defineEmits(["update:isVisible", "enviarLista", "modificarLista"]);

const close = () => {
  emit("update:isVisible", false);
  internalIsVisible.value = false;
};

const enviarLista = () => {
  emit("enviarLista", internalLista.value);
};

const modificarLista = () => {
  emit("modificarLista", internalLista.value);
};

onMounted(async () => {
  try {
    const response = await getlista(props.idInscripcion);
    internalLista.value = response.data.listaData;
  } catch {
    //
  }
});
</script>
