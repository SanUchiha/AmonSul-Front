<template>
  <v-container>
    <div class="text-center pa-4">
      <v-dialog v-model="internalVisible" width="auto" persistent>
        <v-card max-width="400" class="dialog-card">
          <v-card-text class="text-center">
            <img
              class="success-image"
              src="../../assets/images/PuertaMoria.jpg"
              alt="Di amigo y entra"
            />
          </v-card-text>
          <template v-slot:actions>
            <v-btn
              ref="mellonButton"
              color="blue darken-1"
              variant="tonal"
              @click="handlerOk"
              class="mx-auto"
            >
              Mellon
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  defineProps,
  defineEmits,
  onMounted,
  onUnmounted,
} from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["update:isVisible"]);
const internalVisible = ref(props.isVisible);
const mellonButton = ref<HTMLButtonElement | null>(null);
const router = useRouter();

watch(
  () => props.isVisible,
  (newVal) => {
    internalVisible.value = newVal;

    // Enfocar el botón cuando se hace visible el modal
    if (newVal) {
      setTimeout(() => {
        if (mellonButton.value?.el) {
          mellonButton.value.$el.focus();
        }
      }, 0);
    }
  }
);

const handlerOk = () => {
  emits("update:isVisible", false);
  internalVisible.value = false;
  router.push({ name: "mis-partidas" });
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handlerOk(); // Ejecutar el handler del botón "Mellon"
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown); // Escuchar el evento de teclado
  if (internalVisible.value) {
    setTimeout(() => {
      if (mellonButton.value?.$el) {
        mellonButton.value.$el.focus();
      }
    }, 0); // Enfocar el botón al cargar
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown); // Limpiar el evento al desmontar
});
</script>

<style scoped>
.text-center {
  text-align: center;
}

.dialog-card {
  margin-bottom: 20px; /* Ajusta el margen inferior según tu preferencia */
}

.success-image {
  max-width: 100%; /* Ajusta el ancho máximo de la imagen al 100% del contenedor */
  height: auto; /* Permite que la altura se ajuste automáticamente manteniendo la proporción */
}
</style>
