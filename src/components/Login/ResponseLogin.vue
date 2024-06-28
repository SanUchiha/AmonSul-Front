<template>
  <v-container>
    <div class="text-center pa-4">
      <v-dialog v-model="internalVisible" width="auto" persistent>
        <v-card max-width="400" class="dialog-card">
          <v-card-title class="text-center">
            <v-icon color="success">mdi-check-circle</v-icon>
            Login completado
          </v-card-title>
          <v-card-text class="text-center">
            <img
              class="success-image"
              src="../../assets/images/PuertaMoria.jpg"
              alt="Di amigo y entra"
            />
          </v-card-text>
          <template v-slot:actions>
            <v-btn
              color="blue darken-1"
              variant="outlined"
              @click="handlerOk"
              class="mx-auto"
            >
              Di amigo y entra
            </v-btn>
          </template>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emits = defineEmits(["update:isVisible"]);
const internalVisible = ref(props.isVisible);
const router = useRouter();

watch(
  () => props.isVisible,
  (newVal) => {
    internalVisible.value = newVal;
  }
);

const handlerOk = () => {
  emits("update:isVisible", false);
  internalVisible.value = false;
  router.push("dashboard");
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    internalVisible.value = false;
    emits("update:isVisible", false);
  }
};
onUnmounted(() => {
  window.removeEventListener("keydown", handleEscapeKey);
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
