<template>
  <v-container class="text-center">
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading">
          <ProgressCircular />
        </div>
        <div v-else>
          <!-- tabs
           1. info usuario / 2. partidas / 3. torneos jugador -->

          <v-tabs v-model="tab" color="primary" grow>
            <v-tab value="one">
              <v-icon icon="mdi-star-face"></v-icon>
            </v-tab>
            <v-tab value="two">
              <v-icon icon="mdi-gamepad-variant-outline"></v-icon>
            </v-tab>
            <v-tab value="three">
              <v-icon icon="mdi-trophy-variant-outline"></v-icon>
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <!-- Tab 1. 
             spark
           Jugador card -->
            <v-tabs-window-item value="one">
              <v-row justify="center">
                <v-col cols="12" md="12">
                  <v-row dense>
                    <v-col cols="12" md="12" class="text-center">
                      <SparklineElo :email="usuarioData.email" />
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="12" class="text-center">
                      <JugadorCard :usuario="usuarioData" />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <!-- tab 2. (partidas)
           Lista de partidas -->
            <v-tabs-window-item value="two">
              <v-divider class="my-3"></v-divider>

              <div v-if="!isLoading && validMatches.length > 0">
                <ValidadasMatchCard
                  v-for="match in validMatches"
                  :key="match.idPartidaAmistosa"
                  :match="match"
                  :idUsuario="usuarioData.idUsuario"
                  class="mb-4"
                  @partidaValidada="cargarPartidasValidadas"
                />
              </div>
              <div v-else>
                <h3>No tienes partidas validadas</h3>
              </div>
            </v-tabs-window-item>
            <!-- tab 3. 
           Inscription a los tornoes (mis torneos)
           Lista de partidas -->
            <v-tabs-window-item value="three">
              <TablaInscripcionesTorneo
                :isLoading="isLoading"
                :listaTorneos="usuarioData.inscripcionesTorneo"
                :idUsuario="usuarioData.idUsuario"
              />
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </v-col>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn
            color="orange"
            variant="outlined"
            class="login-form__button"
            @click="goBack"
          >
            Volver
          </v-btn>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import JugadorCard from "@/components/Usuarios/JugadorCard.vue";
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";
import {
  getPartidasPendientesValidar,
  getPartidasValidadas,
} from "@/services/PartidasAmistosasService";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { getUsuarioData } from "@/services/UsuariosService";
import TablaInscripcionesTorneo from "@/components/Inscripcion/TablaInscripcionesTorneo.vue";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";

const tab = ref<string>("one");

const isLoading = ref(true);
const router = useRouter();
const route = useRoute();
const usuarioData = ref<UsuarioDataDTO>({
  idUsuario: 0,
  nick: "",
  faccion: {
    idFaccion: 0,
    nombreFaccion: "",
  },
  inscripcionesTorneo: [],
  clasificacionElo: 0,
  puntuacionElo: 0,
  numeroPartidasJugadas: 0,
  partidasGanadas: 0,
  partidasEmpatadas: 0,
  partidasPerdidas: 0,
  email: "",
  partidasValidadas: [],
  partidasPendientes: [],
  elos: [],
});

const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const validMatches = ref<ViewPartidaAmistosaDTO[]>([]);

const ultimaPartida = ref<ViewPartidaAmistosaDTO | null>(null);

const cargarPartidasValidadas = async () => {
  try {
    isLoading.value = true;
    const responseValidadas = await getPartidasValidadas(
      usuarioData.value.email
    );

    ultimaPartida.value = responseValidadas[responseValidadas.length - 1];
  } catch (error) {
    console.error("Error al obtener las partidas validadas:", error);
  } finally {
    isLoading.value = false;
  }
};

const initializeComponent = async () => {
  isLoading.value = true;
  try {
    const idRecibido = String(route.params.idUsuario);
    const usuarioResponse = await getUsuarioData(parseInt(idRecibido));

    // Verifica la estructura de usuarioResponse
    if (usuarioResponse) {
      usuarioData.value = usuarioResponse;
      validMatches.value = usuarioResponse.partidasValidadas;
      pendingMatches.value = usuarioResponse.partidasPendientes;
    }
  } catch (error) {
    console.error(error);
    router.push("error");
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeComponent);

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.separated {
  margin-bottom: 20px;
}

.login-form {
  position: relative;

  @media screen and (max-width: 720px) {
    height: 100%;
  }

  &__button {
    @media screen and (max-width: 720px) {
      width: calc(100% - 24px);
    }
  }
}
</style>
