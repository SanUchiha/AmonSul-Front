<template>
  <div v-if="isLoading" class="center">
    <ProgressCircular />
  </div>
  <div v-else class="center">
    <v-card class="mx-auto text-center">
      <v-card-title>Mis inscripciones</v-card-title>

      <v-card-text>
        <TablaInscripcionesTorneoIndividual
          :isLoading="isLoading"
          :listaTorneos="inscripcionesIndividual || []"
          :idUsuario="idUsuario"
        />
      </v-card-text>
      <v-card-text>
        <TablaInscripcionesTorneoEquipo
          :isLoading="isLoading"
          :listaTorneos="inscripcionesEquipo || []"
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
import { useAuth } from "@/composables/useAuth";
import {
  getInscripcionesEquipoByUser,
  getInscripcionesIndividualByUser,
} from "@/services/InscripcionesService";
import {
  InscripcionUsuarioEquipoDTO,
  InscripcionUsuarioIndividualDTO,
} from "@/interfaces/Inscripcion";
import TablaInscripcionesTorneoEquipo from "../Inscripcion/TablaInscripcionesTorneoEquipo.vue";
import TablaInscripcionesTorneoIndividual from "../Inscripcion/TablaInscripcionesTorneoIndividual.vue";

const isLoading = ref<boolean>(false);
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string>(getidUsuario.value || "");
const inscripcionesIndividual = ref<InscripcionUsuarioIndividualDTO[]>();
const inscripcionesEquipo = ref<InscripcionUsuarioEquipoDTO[]>();

const idUsuario = ref<number>(parseInt(idUsuarioLogger.value));

onMounted(async () => {
  if (idUsuarioLogger.value) {
    try {
      isLoading.value = true;
      const responseIndividual = await getInscripcionesIndividualByUser(
        idUsuarioLogger.value
      );
      inscripcionesIndividual.value = responseIndividual.data;

      const responseEquipo = await getInscripcionesEquipoByUser(
        parseInt(idUsuarioLogger.value)
      );
      inscripcionesEquipo.value = responseEquipo.data;
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
