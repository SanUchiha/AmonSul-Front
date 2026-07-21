<template>
  <v-dialog v-model="internalIsVisible" max-width="500">
    <v-card>
      <v-card-title class="headline">Tu lista</v-card-title>

      <v-card-text>
        <v-combobox
          v-model="ejercitoSelected"
          :items="listadoEjercitos"
          item-title="name"
          label="¿Cuál es tu ejército principal?"
          @click="loadEjercitos"
          :rules="[rules.required]"
          required
        ></v-combobox>
        <v-progress-linear
          v-if="loadingEjercitos"
          indeterminate
          color="primary"
          class="progress-linear-margin"
        ></v-progress-linear>
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
      <v-card-actions style="display: flex; justify-content: space-between">
        <v-spacer></v-spacer>
        <div v-if="imageBase64">
          <v-btn variant="tonal" color="primary" @click="cambiarImagen"
            >Cambiar</v-btn
          >
          <v-btn
            variant="tonal"
            color="primary"
            @click="enviarLista"
            :disabled="isSendButtonDisabled"
            style="margin-right: 10px"
            >Enviar</v-btn
          >
        </div>
        <v-btn
          variant="tonal"
          color="secondary"
          @click="close"
          style="margin-left: auto"
          >Cancelar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ArmyDTO } from "@/interfaces/Army";
import { RequesListaDTO } from "@/interfaces/Lista";
import { getlista } from "@/services/ListasService";
import { appsettings } from "@/settings/appsettings";
import { uploadImageToCloudinary } from "@/services/CloudinaryService";
import { ref, watch, onMounted, computed } from "vue";

// eslint-disable-next-line no-undef
const props = defineProps<{
  isVisible: boolean;
  hasLista: boolean;
  idInscripcion: number;
}>();

const internalIsVisible = ref(props.isVisible);
const isLoading = ref<boolean>(false);
const hasLista = ref<boolean>(false);

const imageBase64 = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const ejercitoSelected = ref<ArmyDTO>();
const listadoEjercitos = ref<ArmyDTO[]>([]);
const loadingEjercitos = ref<boolean>(false);
const isSendButtonDisabled = computed(() => {
  return (
    !ejercitoSelected.value ||
    !listadoEjercitos.value.includes(ejercitoSelected.value)
  );
});

const rules = {
  required: (value: string | null) => !!value || "Este campo es obligatorio.",
};

const loadEjercitos = async () => {
  isLoading.value = true;
  loadingEjercitos.value = true;

  listadoEjercitos.value = await appsettings.armies;

  isLoading.value = false;
  loadingEjercitos.value = false;
};

const onImageSelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    isLoading.value = true;
    try {
      imageBase64.value = await uploadImageToCloudinary(file);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    } finally {
      isLoading.value = false;
    }
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
  newVal => {
    internalIsVisible.value = newVal;
  }
);

watch(
  () => props.hasLista,
  async newVal => {
    if (newVal) {
      const response = await getlista(props.idInscripcion);
      imageBase64.value = response.data.listaData;
    }
  }
);

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:isVisible", "enviarLista", "modificarLista"]);

const close = () => {
  emit("update:isVisible", false);
  internalIsVisible.value = false;
};

const enviarLista = () => {
  if (imageBase64.value == null || ejercitoSelected.value == null) return;
  const newLista: RequesListaDTO = {
    listaData: imageBase64.value,
    ejercito: ejercitoSelected.value,
    idUsuario: 0,
    nick: "",
  };
  if (hasLista.value) emit("modificarLista", newLista);
  else emit("enviarLista", newLista);

  imageBase64.value = "";
  ejercitoSelected.value = undefined;
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await getlista(props.idInscripcion);

    imageBase64.value = response.data.listaData;
    ejercitoSelected.value = response.data.ejercito;
    if (imageBase64.value != null) hasLista.value = true;
  } catch {
    console.error("No se ha podido cargar la lista");
  } finally {
    isLoading.value = false;
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
.v-card-actions v-btn {
  margin-right: 10px !important; /* Fuerza el margen entre los botones */
}

.v-card-actions v-btn:last-child {
  margin-right: 0 !important; /* Asegura que el último botón no tenga margen */
}
</style>
