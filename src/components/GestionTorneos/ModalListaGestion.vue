<template>
  <v-dialog v-model="internalIsVisible" max-width="500">
    <v-card>
      <v-card-title class="headline">Tu lista</v-card-title>

      <v-card-text>
        <v-combobox
          v-model="ejercitoSelected"
          :items="listadoEjercitos"
          item-title="name"
          label="¿Cuál es su ejército principal?"
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
          <v-file-input
            ref="fileInput"
            label="Selecciona una imagen"
            @change="onImageSelected"
            accept="image/*"
          ></v-file-input>
        </div>
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-between">
        <v-spacer></v-spacer>
        <div v-if="imageBase64">
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
import { appsettings } from "@/settings/appsettings";
import { defineProps, defineEmits, ref, watch, computed } from "vue";

const props = defineProps<{
  isVisible: boolean;
  idLista: number;
}>();

const internalIsVisible = ref(props.isVisible);
const isLoading = ref(false);

const imageBase64 = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const ejercitoSelected = ref<ArmyDTO>();
const listadoEjercitos = ref<ArmyDTO[]>([]);
const loadingEjercitos = ref(false);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 500; // Cambia esto al ancho máximo deseado
        const maxHeight = 500; // Cambia esto a la altura máxima deseada
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convertir el canvas a base64
          imageBase64.value = canvas.toDataURL("image/jpeg", 0.7); // Ajusta la calidad de 0 a 1
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

watch(
  () => props.isVisible,
  (newVal) => {
    internalIsVisible.value = newVal;
  }
);

const emit = defineEmits(["update:isVisible", "enviarLista"]);

const close = () => {
  emit("update:isVisible", false);
  internalIsVisible.value = false;
};

const enviarLista = () => {
  const newLista: RequesListaDTO = {
    listaData: imageBase64.value!,
    ejercito: ejercitoSelected.value!,
    idUsuario: 0,
    nick: "",
  };
  emit("enviarLista", newLista);
};
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
