<template>
  <div v-if="isLoading" class="center">
    <ProgressCircular />
  </div>
  <div v-else class="center">
    <v-card class="mb-0 pb-0 text-center">
      <v-card-title class="ringbearer">Mis inscripciones</v-card-title>

      <v-card-text>
        <TablaInscripcionesTorneo
          :isLoading="isLoading"
          :listaTorneos="inscripciones || []"
          :idUsuario="idUsuario"
        />
      </v-card-text>

      <v-card-text class="d-flex justify-center"> </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import ProgressCircular from "../Commons/ProgressCircular.vue";
import { getInscripcionesUser } from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import TablaInscripcionesTorneo from "../Inscripcion/TablaInscripcionesTorneo.vue";
import { InscripcionUsuarioDTO } from "@/interfaces/Inscripcion";

const isLoading = ref<boolean>(false);
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string>(getidUsuario.value || "");
const inscripciones = ref<InscripcionUsuarioDTO[]>();
const idUsuario = ref<number>(parseInt(idUsuarioLogger.value));

onMounted(async () => {
  if (idUsuarioLogger.value) {
    try {
      isLoading.value = true;
      const response = await getInscripcionesUser(idUsuarioLogger.value);
      inscripciones.value = response.data;
    } catch (error) {
      console.error(
        "Error al obtener las inscripciones de un torneo de un usuario: ",
        error
      );
    } finally {
      isLoading.value = false;
    }
  }
});
</script>

<style scoped></style>
