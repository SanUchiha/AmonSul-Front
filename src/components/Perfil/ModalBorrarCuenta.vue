<template>
  <!-- Borrar la cuenta no tiene vuelta atrás: se explica qué pasa y se pide la contraseña -->
  <v-dialog v-model="visible" max-width="480">
    <v-card>
      <v-card-title class="text-wrap">¿Borrar tu cuenta?</v-card-title>
      <v-card-text>
        <p class="text-body-2 mb-2">
          Se borrarán tus datos personales: nombre, apellidos, correo, teléfono,
          fecha de nacimiento, ciudad, foto y contraseña.
        </p>
        <p class="text-body-2 mb-2">
          Tus resultados y partidas seguirán en los eventos y en las
          clasificaciones, como «Desconocido».
        </p>
        <p class="text-body-2 mb-4">
          No se puede deshacer y no podrás volver a entrar con esta cuenta.
        </p>

        <v-text-field
          v-model="contrasena"
          label="Tu contraseña"
          type="password"
          autocomplete="current-password"
          density="comfortable"
          hide-details="auto"
          @keydown.enter="borrar"
        />
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="borrando" @click="visible = false"
          >Cancelar</v-btn
        >
        <v-btn
          color="error"
          variant="tonal"
          :loading="borrando"
          :disabled="!contrasena"
          @click="borrar"
        >
          Borrar mi cuenta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import axios from "axios";
import { borrarMiCuenta } from "@/services/UsuariosService";

const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits<{
  (e: "update:isVisible", valor: boolean): void;
  (e: "borrada"): void;
}>();

const visible = computed({
  get: () => props.isVisible,
  set: valor => emit("update:isVisible", valor),
});

const contrasena = ref("");
const error = ref("");
const borrando = ref(false);

watch(
  () => props.isVisible,
  abierto => {
    if (!abierto) return;
    contrasena.value = "";
    error.value = "";
  }
);

const borrar = async () => {
  if (!contrasena.value || borrando.value) return;
  error.value = "";
  borrando.value = true;
  try {
    await borrarMiCuenta(contrasena.value);
    emit("borrada");
  } catch (e) {
    error.value =
      (axios.isAxiosError(e) && e.response?.data?.message) ||
      "No se ha podido borrar la cuenta. Prueba otra vez en un rato.";
  } finally {
    borrando.value = false;
  }
};
</script>
