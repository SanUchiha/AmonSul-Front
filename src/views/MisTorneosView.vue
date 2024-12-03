<template>
  <v-container class="text-center">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <div v-else>
      <!-- Titulo -->
      <CardTitleMisTorneos />
      <v-spacer class="my-4"></v-spacer>
      <!-- Resumen partidas -->
      <v-row justify="center">
        <v-col cols="12" md="12">
          <v-row dense>
            <v-col cols="12" md="12" class="text-center">
              <CardInscripcionesUsuarioTorneo :usuario="usuarioData" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" md="12" class="text-center">
              <SparklineElo :email="usuarioData.email" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" md="12" class="text-center">
              <CardResumenPartidas :usuario="usuarioData" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-divider class="my-3"></v-divider>

      <v-divider class="my-3"></v-divider>

      <!-- partidas validades -->
      <div v-if="!isLoadingMatches && matches.length > 0">
        <ValidadasMatchCard
          v-for="match in matches"
          :key="match.idPartidaAmistosa"
          :idUsuario="parseInt(idUsuarioLogger!)"
          :match="match"
          class="mb-4"
        />
      </div>
      <div v-else>
        <h3>No tienes partidas en torneos</h3>
      </div>
      <v-divider class="my-3"></v-divider>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import CardResumenPartidas from "@/components/PartidaAmistosa/CardResumenPartidas.vue";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";
import CardInscripcionesUsuarioTorneo from "@/components/PartidasTorneo/CardInscripcionesUsuarioTorneo.vue";
import CardTitleMisTorneos from "@/components/PartidasTorneo/CardTitleMisTorneos.vue";
import { useAuth } from "@/composables/useAuth";
import { FaccionDTO } from "@/interfaces/Faccion";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { getFaccionByIdUser } from "@/services/FaccionesService";
import { getTournamentMatches } from "@/services/PartidaTorneoService";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isLoading = ref(true);
const { getidUsuario, getUser } = useAuth();
const router = useRouter();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const emailOwner = ref<string | null>(getUser.value);
const matches = ref<ViewPartidaAmistosaDTO[]>([]);
const isLoadingMatches = ref<boolean>(false);
const faccionDTO = ref<FaccionDTO>({
  idFaccion: 0,
  nombreFaccion: "",
});
const usuarioData = ref<UsuarioDataDTO>({
  idUsuario: 0,
  nick: "",
  email: "",
  faccion: faccionDTO.value,
  partidasValidadas: [],
  partidasPendientes: [],
  elos: [],
  inscripcionesTorneo: [],
  clasificacionElo: 0,
  puntuacionElo: 0,
  numeroPartidasJugadas: 0,
  partidasGanadas: 0,
  partidasEmpatadas: 0,
  partidasPerdidas: 0,
  proteccionDatos: null,
  PartidasTorneo: [],
  ClasificacionTorneos: [],
});

const initializeComponent = async () => {
  if (idUsuarioLogger.value && emailOwner.value) {
    isLoading.value = true;
    isLoadingMatches.value = true;
    try {
      const response = await getTournamentMatches(
        parseInt(idUsuarioLogger.value)
      );
      matches.value = response.data;

      loadComunidad(parseInt(idUsuarioLogger.value));
      usuarioData.value.email = emailOwner.value;

      loadResume(matches.value);
    } catch (error) {
      console.error(error);
      router.push({ name: "error" });
    } finally {
      isLoading.value = false;
      isLoadingMatches.value = false;
    }
  }
};

const loadResume = async (matches: ViewPartidaAmistosaDTO[]) => {
  usuarioData.value.numeroPartidasJugadas = matches.length;

  let contadorGanadas = 0;
  let contadorEmpatadas = 0;
  let contadorPerdidas = 0;

  matches.forEach((element) => {
    if (element.ganadorPartida == parseInt(idUsuarioLogger.value!))
      contadorGanadas++;
    else if (
      element.ganadorPartida != parseInt(idUsuarioLogger.value!) &&
      element.ganadorPartida != null
    )
      contadorPerdidas++;
    else contadorEmpatadas++;
  });

  usuarioData.value.partidasGanadas = contadorGanadas;
  usuarioData.value.partidasEmpatadas = contadorEmpatadas;
  usuarioData.value.partidasPerdidas = contadorPerdidas;
};

onMounted(initializeComponent);

const loadComunidad = async (idUser: number) => {
  try {
    const response = await getFaccionByIdUser(idUser);
    usuarioData.value.faccion.nombreFaccion = response.data;
  } catch (error) {
    console.error("Error al obtener las comunidades: ", error);
  }
};
</script>

<style scoped></style>
