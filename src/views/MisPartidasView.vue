<template>
  <v-container class="text-center">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <div v-else>
      <!-- Titulo -->
      <CardTitleMisPartidas />
      <v-spacer class="my-4"></v-spacer>

      <!-- Resumen partidas -->
      <v-row justify="center">
        <v-col cols="12" md="12">
          <v-row dense>
            <v-col cols="12" md="12" class="text-center">
              <CardResumenPartidas :usuario="usuarioData" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- Boton partidas -->
      <v-btn
        class="mt-2"
        variant="tonal"
        size="large"
        color="blue darken-1"
        @click="handleFormCreateMatch"
        >Registrar partida</v-btn
      >

      <v-divider class="my-3"></v-divider>

      <!-- partidas pendientes -->
      <div v-if="pendingMatches.length > 0 && !isLoadingPending">
        <PendingMatchCard
          v-for="match in pendingMatches"
          :key="match.idPartidaAmistosa"
          :match="match"
          class="mb-4"
        />
      </div>
      <div v-else>
        <h3>No tienes partidas pendientes de validar</h3>
      </div>

      <v-divider class="my-3"></v-divider>

      <!-- partidas validades -->
      <div v-if="!isLoadingValidadas && validMatches.length > 0">
        <ValidadasMatchCard
          v-for="match in validMatches"
          :key="match.idPartidaAmistosa"
          :idUsuario="parseInt(idUsuarioLogger!)"
          :match="match"
          class="mb-4"
        />
      </div>
      <div v-else>
        <h3>No tienes partidas validadas</h3>
      </div>
      <v-divider class="my-3"></v-divider>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import CardResumenPartidas from "@/components/PartidaAmistosa/CardResumenPartidas.vue";
import CardTitleMisPartidas from "@/components/PartidaAmistosa/CardTitleMisPartidas.vue";
import PendingMatchCard from "@/components/PartidaAmistosa/PendingMatchCard.vue";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";
import { useAuth } from "@/composables/useAuth";
import { FaccionDTO } from "@/interfaces/Faccion";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { getFaccionByIdUser } from "@/services/FaccionesService";
import { getPartidasAmistosasByIdUser } from "@/services/PartidasAmistosasService";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const isLoading = ref(true);
const { getidUsuario } = useAuth();
const router = useRouter();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const matches = ref<ViewPartidaAmistosaDTO[]>([]);
const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const validMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const isLoadingPending = ref<boolean>(false);
const isLoadingValidadas = ref<boolean>(false);
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
  if (idUsuarioLogger.value) {
    isLoading.value = true;
    isLoadingPending.value = true;
    isLoadingValidadas.value = true;
    try {
      const response = await getPartidasAmistosasByIdUser(
        parseInt(idUsuarioLogger.value)
      );
      matches.value = response.data;
      matches.value.forEach((element) => {
        if (element.partidaValidadaUsuario1 && element.partidaValidadaUsuario2)
          validMatches.value.push(element);
        else pendingMatches.value.push(element);
      });
      validMatches.value = validMatches.value.reverse();
      pendingMatches.value = pendingMatches.value.reverse();

      loadComunidad(parseInt(idUsuarioLogger.value));

      loadResume(validMatches.value);
    } catch (error) {
      console.error(error);
      router.push({ name: "error" });
    } finally {
      isLoading.value = false;
      isLoadingPending.value = false;
      isLoadingValidadas.value = false;
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

///TODO: Modal
const handleFormCreateMatch = () => {
  router.push({ name: "registrar-partida" });
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
