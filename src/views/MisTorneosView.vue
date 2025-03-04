<template>
  <v-container class="text-center">
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <div v-else>
      <!-- Titulo -->
      <CardTitleMisTorneos />

      <!-- Resumen partidas -->
      <v-row justify="center">
        <v-col cols="12" md="12">
          <v-row dense>
            <v-col cols="12" md="12" class="text-center">
              <CardInscripcionesUsuarioTorneo :usuario="usuarioData" />
            </v-col>
          </v-row>
          <v-row dense>
            
          </v-row>
          <v-row dense>
            <v-col cols="12" sm="6" class="text-center">
              <!-- Resumen partidas -->
              <v-card class="section-card stats-section pt-0 mt-0">
                <v-col cols="12"><p class="text-h5 ringbearer">Estadísticas</p></v-col>
                <v-divider></v-divider>
                <v-col cols="12" md="12" class="text-center">
                  <!--<CardResumenPartidas :usuario="usuarioData" />-->
                  <CardEstadisticas :usuario="usuarioData" />
                </v-col>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" class="text-center">
              <SparklineElo :email="usuarioData.email" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- partidas validades -->
      <div v-if="!isLoadingMatches && matches.length > 0">
        <v-card class="section-card stats-section pt-0 mt-0">
          <v-col cols="12"><p class="text-h5 ringbearer">Partidas de torneo</p></v-col>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="12" sm="6" md="6" lg="4" xl="4" class="pb-0" v-for="match in matches" :key="match.idPartidaTorneo">
            <CardPartidaTorneo              
              :idUsuario="parseInt(idUsuarioLogger!)"
              :match="match"
              class="mb-4"
            />
            </v-col>
          </v-row>        
        </v-card>
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
import CardPartidaTorneo from "@/components/PartidasTorneo/CardPartidaTorneo.vue";
import CardInscripcionesUsuarioTorneo from "@/components/PartidasTorneo/CardInscripcionesUsuarioTorneo.vue";
import CardTitleMisTorneos from "@/components/PartidasTorneo/CardTitleMisTorneos.vue";
import { useAuth } from "@/composables/useAuth";
import { FaccionDTO } from "@/interfaces/Faccion";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { getRankingEloByIdUser } from "@/services/EloService";
import { getFaccionByIdUser } from "@/services/FaccionesService";
import { getTournamentMatches } from "@/services/PartidaTorneoService";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import CardEstadisticas from "@/components/Perfil/CardEstadisticas.vue";
import { getUsuarioData } from "@/services/UsuariosService";

const isLoading = ref(true);
const { getidUsuario, getUser } = useAuth();
const router = useRouter();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const emailOwner = ref<string | null>(getUser.value);
const matches = ref<ViewPartidaTorneoDTO[]>([]);
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
  InscripcionesIndividualTorneo: [],
  InscripcionesEquipoTorneo: [],
  clasificacionElo: 0,
  puntuacionElo: 0,
  numeroPartidasJugadas: 0,
  partidasGanadas: 0,
  partidasEmpatadas: 0,
  partidasPerdidas: 0,
  proteccionDatos: null,
  PartidasTorneo: [],
  ClasificacionTorneos: [],
  rankingElo: 0,
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

      loadRankingElo(parseInt(idUsuarioLogger.value));
    } catch (error) {
      console.error(error);
      router.push({ name: "error" });
    } finally {
      isLoading.value = false;
      isLoadingMatches.value = false;
    }
  }
};

const loadResume = async (matches: ViewPartidaTorneoDTO[]) => {
  usuarioData.value.numeroPartidasJugadas = matches.length;

  let contadorGanadas = 0;
  let contadorEmpatadas = 0;
  let contadorPerdidas = 0;

  matches.forEach((element) => {
    if (element.ganadorPartidaTorneo == parseInt(idUsuarioLogger.value!))
      contadorGanadas++;
    else if (
      element.ganadorPartidaTorneo != parseInt(idUsuarioLogger.value!) &&
      element.ganadorPartidaTorneo != null
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

const loadRankingElo = async (idUser: number) => {
  try {
    const response = await getUsuarioData(idUser);
//TODO Arreglo getRankingEloByIdUser
    //const response = await getRankingEloByIdUser(idUser);
    usuarioData.value.rankingElo = response.data.clasificacionElo;
  } catch (error) {
    console.error("Error al obtener el ranking del jugador: ", error);
  }
};
</script>

<style scoped>
  .section-card {
    margin-bottom: 20px;
    padding: 20px;
    background: #212121;
    color: white;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  }
</style>
