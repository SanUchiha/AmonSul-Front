<template>
  <v-container>
    <div v-if="isLoading" class="loading"></div>
    <div v-else>
      {{ listaTorneos }}
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { InscripcionUsuarioDTO } from "@/interfaces/Inscripcion";
import { getInscripcionesUser } from "@/services/InscripcionesService";
import { onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";

const { getUser } = useAuth();
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

const listaTorneos = ref<InscripcionUsuarioDTO[]>([]);

onMounted(async () => {
  try {
    const response = await getInscripcionesUser(7);
    listaTorneos.value = response;
    console.log("listaTorneosUsuario", listaTorneos.value);
  } catch {
    console.error("Error al obtener datos del usuario:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped></style>
