<template>
  <v-dialog v-model="visible" max-width="500">
    <v-card>
      <v-card-title class="headline">Enviar lista</v-card-title>

      <v-card-text>
        <v-combobox
          v-model="ejercitoSelected"
          :items="listadoEjercitos"
          item-title="name"
          label="¿Cuál es tu ejército?"
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
        <v-file-input
          label="Selecciona una imagen"
          @change="onImageSelected"
          accept="image/*"
        ></v-file-input>

        <div v-if="isLoading" class="loading-container">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>

        <div v-if="imageBase64">
          <img :src="imageBase64" alt="Lista cargada" class="uploaded-image" />
        </div>
      </v-card-text>

      <v-card-actions style="display: flex; justify-content: flex-end">
        <v-btn
          variant="tonal"
          color="primary"
          @click="enviarLista"
          :disabled="!imageBase64"
        >
          Enviar
        </v-btn>
        <v-btn variant="tonal" color="secondary" @click="close">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ArmyDTO } from "@/interfaces/Army";
import { RequesListaDTO } from "@/interfaces/Lista";
import { appsettings } from "@/settings/appsettings";
import { defineProps, defineEmits, ref, computed, watch } from "vue";

const props = defineProps<{
  isVisible: boolean;
  hasLista: boolean;
  idInscripcion: number;
  idUsuario: number;
  nick?: string;
}>();

const emit = defineEmits<{
  (e: "update:isVisible", value: boolean): void;
  (e: "enviarLista", newLista: RequesListaDTO): void;
  (e: "modificarLista", newLista: RequesListaDTO): void;
}>();

// Computed reactividad con v-model
const visible = computed({
  get: () => props.isVisible,
  set: (val: boolean) => emit("update:isVisible", val),
});

const isLoading = ref(false);
const imageBase64 = ref<string | null>(null);

const ejercitoSelected = ref<ArmyDTO>();
const listadoEjercitos = ref<ArmyDTO[]>([]);
const loadingEjercitos = ref<boolean>(false);

const onImageSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imageBase64.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const rules = {
  required: (value: string | null) => !!value || "El ejército es obligatorio.",
};

const loadEjercitos = async () => {
  isLoading.value = true;
  loadingEjercitos.value = true;

  listadoEjercitos.value = appsettings.armies;

  isLoading.value = false;
  loadingEjercitos.value = false;
};

const enviarLista = () => {
  if (imageBase64.value && ejercitoSelected.value) {
    const newLista: RequesListaDTO = {
      listaData: imageBase64.value,
      ejercito: ejercitoSelected.value,
      idUsuario: props.idUsuario,
      nick: "",
    };

    if (props.hasLista) {
      emit("modificarLista", newLista);
    } else {
      emit("enviarLista", newLista);
    }
    close();
  }
};

const close = () => {
  emit("update:isVisible", false);
};

// Reset de datos al abrir modal (opcional)
watch(visible, (newVal) => {
  if (newVal) {
    ejercitoSelected.value = undefined;
    imageBase64.value = null;
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
