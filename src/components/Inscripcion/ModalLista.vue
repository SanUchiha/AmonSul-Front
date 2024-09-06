<template>
  <v-dialog v-model="internalIsVisible" max-width="500">
    <v-card>
      <v-card-title class="headline">Tu lista</v-card-title>
      <v-card-text>
        <div v-if="isLoading" class="loading-container">
          <!-- Indicador de carga -->
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
        <div v-else>
          <div v-if="imageBase64">
            <img
              :src="imageBase64"
              alt="Lista cargada"
              class="uploaded-image"
            />
          </div>
          <div v-else>
            <v-file-input
              ref="fileInput"
              label="Selecciona una imagen"
              @change="onImageSelected"
              accept="image/*"
            ></v-file-input>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div v-if="imageBase64">
          <v-btn color="primary" @click="cambiarImagen">Cambiar</v-btn>
          <v-btn color="primary" @click="enviarLista">Enviar</v-btn>
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
const isLoading = ref(false);

const imageBase64 = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const onImageSelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      imageBase64.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const cambiarImagen = () => {
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  imageBase64.value = null;
  internalIsVisible.value = true;
};

watch(
  () => props.isVisible,
  (newVal) => {
    internalIsVisible.value = newVal;
  }
);

watch(
  () => props.hasLista,
  async (newVal) => {
    if (newVal) {
      const response = await getlista(props.idInscripcion);
      imageBase64.value = response.data.listaData;
    }
  }
);

const emit = defineEmits(["update:isVisible", "enviarLista", "modificarLista"]);

const close = () => {
  emit("update:isVisible", false);
  internalIsVisible.value = false;
};

const enviarLista = () => {
  if (props.hasLista) emit("modificarLista", imageBase64.value);
  else emit("enviarLista", imageBase64.value);
};

onMounted(async () => {
  if (props.hasLista) {
    isLoading.value = true;
    try {
      const response = await getlista(props.idInscripcion);
      imageBase64.value = response.data.listaData;
    } catch {
      console.error("No se ha podido cargar la imagen");
    } finally {
      isLoading.value = false;
    }
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
  height: 150px; /* Ajusta la altura según sea necesario */
}
</style>
