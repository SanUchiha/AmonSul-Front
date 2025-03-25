<template>
  <div v-if="isLoading" class="center">
    <ProgressCircular />
  </div>
  <div v-else class="center">
    <v-card class="mb-0 pl-4 pr-4 text-center">
      <v-card-title class="ringbearer">Mis inscripciones</v-card-title>

      <v-divider class="mt-3"></v-divider>

      <v-tabs v-model="tab" background-color="primary" dark grow>
        <v-tab value="sin-disputar">Sin disputar</v-tab>
        <v-tab value="disputados">Disputados</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
          <!-- Torneos sin disputar -->
          <v-tabs-window-item value="sin-disputar" v-if="tab === 'sin-disputar'">
            <v-card-text>
              <TablaInscripcionesTorneoIndividual
                :isLoading="isLoading"
                :listaTorneos="(inscripcionesIndividual ?? []).filter(torneo => new Date(torneo.torneo.fechaFinTorneo) >= new Date())"
                :idUsuario="idUsuario"
                :disputado=false
              />
            </v-card-text>
            <v-card-text>
              <TablaInscripcionesTorneoEquipo
                :isLoading="isLoading"
                :listaTorneos="(inscripcionesEquipo ?? []).filter(torneo => new Date(torneo.torneo.fechaFinTorneo) >= new Date())"
                :idUsuario="idUsuario"
                :disputado=false
              />
            </v-card-text>
          </v-tabs-window-item>
          <!-- Torneos disputados -->
          <v-tabs-window-item value="disputados" v-if="tab === 'disputados'">
            <v-card-text>
              <TablaInscripcionesTorneoIndividual
                :isLoading="isLoading"
                :listaTorneos="(inscripcionesIndividual ?? []).filter(torneo => new Date(torneo.torneo.fechaFinTorneo) < new Date())"
                :idUsuario="idUsuario"
                :disputado=true
              />
            </v-card-text>
            <v-card-text>
              <TablaInscripcionesTorneoEquipo
                :isLoading="isLoading"
                :listaTorneos="(inscripcionesEquipo ?? []).filter(torneo => new Date(torneo.torneo.fechaFinTorneo) < new Date())"
                :idUsuario="idUsuario"
                :disputado=true
              />
            </v-card-text>
          </v-tabs-window-item>
      </v-tabs-window>
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
const tab = ref("sin-disputar");
  
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
