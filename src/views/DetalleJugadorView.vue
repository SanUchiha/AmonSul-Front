<template>
  <v-container class="text-center">
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading">
          <LoadingGandalf />
        </div>
        <div v-else>
          <!-- tabs
           1. info usuario / 2. partidas amistosas / 3. partidas torneos / 4. torneos jugador -->

          <v-tabs v-model="tab" color="primary" grow>
            <v-tab value="1">
              <v-icon icon="mdi-star-face"></v-icon>
            </v-tab>
            <v-tab value="2"> P. Amistosas </v-tab>
            <v-tab value="3"> P. Torneo </v-tab>
            <v-tab value="4">
              <v-icon icon="mdi-calendar-account-outline"></v-icon>
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <!-- Tab 1.
             spark
           Jugador card -->
            <v-tabs-window-item value="1">
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
            <v-tabs-window-item value="2">
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
              <v-divider class="my-3"></v-divider>
            </v-tabs-window-item>

            <!-- tab 3 (partidas torneos) -->
            <v-tabs-window-item value="3">
              <div v-if="tournamentMatches.length > 0">
                <div
                  v-for="match in tournamentMatches"
                  :key="match.idPartidaTorneo"
                >
                  <CardTournamentMatch
                    :match="match"
                    :idUsuario="usuarioData.idUsuario"
                  />
                </div>
              </div>
              <div v-else>
                <h3>No tiene partidas de torneo</h3>
              </div>
              <v-divider class="my-3"></v-divider>
            </v-tabs-window-item>

            <!-- tab 4.
           Inscription a los tornoes (mis torneos)
           Lista de partidas -->
            <v-tabs-window-item value="4">
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
            class="login-form__button mt-4"
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
import { ref, onMounted, computed, ComputedRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import JugadorCard from "@/components/Usuarios/JugadorCard.vue";
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import { getPartidasValidadas } from "@/services/PartidasAmistosasService";
import {
  ViewPartidaAmistosaDTO,
  ViewPartidaTorneoDTO,
} from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import TablaInscripcionesTorneo from "@/components/Inscripcion/TablaInscripcionesTorneo.vue";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from "@/store/usuarios";
import CardTournamentMatch from "@/components/PartidasTorneo/CardTournamentMatch.vue";
import { getTournamentMatches } from "@/services/PartidaTorneoService";

const tab = ref<string>("one");
const usuariosStore = useUsuariosStore();

const isLoading = ref(true);
const isLoadingTournamentMatches = ref<boolean>(false);

const router = useRouter();
const route = useRoute();
const usuarioData: ComputedRef<UsuarioDataDTO> = computed(
  () => usuariosStore.usuarioData
);

const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const validMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const tournamentMatches = ref<ViewPartidaTorneoDTO[]>([]);

const ultimaPartida = ref<ViewPartidaAmistosaDTO | null>(null);

const cargarPartidasValidadas = async () => {
  try {
    isLoading.value = true;
    const responseValidadas = await getPartidasValidadas(
      usuarioData.value.email
    );

    ultimaPartida.value =
      responseValidadas.data[responseValidadas.data.length - 1];
  } catch (error) {
    console.error("Error al obtener las partidas validadas:", error);
  } finally {
    isLoading.value = false;
  }
};

const cargarPartidasTorneos = async () => {
  try {
    isLoadingTournamentMatches.value = true;
    const response = await getTournamentMatches(usuarioData.value.idUsuario);

    tournamentMatches.value = response.data;
    tournamentMatches.value = tournamentMatches.value.sort((a, b) => {
      return (
        new Date(b.fechaPartida).getTime() - new Date(a.fechaPartida).getTime()
      );
    });
  } catch (error) {
    console.error("Error al obtener las partidas de torneo:", error);
  } finally {
    isLoadingTournamentMatches.value = false;
  }
};

const initializeComponent = async () => {
  isLoading.value = true;
  try {
    const idRecibido = String(route.params.idUsuario);
    await usuariosStore.requestUsuarioData(parseInt(idRecibido));

    // Verifica la estructura de usuarioResponse
    if (usuarioData.value.idUsuario) {
      validMatches.value = usuarioData.value.partidasValidadas.sort((a, b) => {
        return (
          new Date(b.fechaPartida).getTime() -
          new Date(a.fechaPartida).getTime()
        );
      });
      pendingMatches.value = usuarioData.value.partidasPendientes.sort(
        (a, b) => {
          return (
            new Date(b.fechaPartida).getTime() -
            new Date(a.fechaPartida).getTime()
          );
        }
      );
      cargarPartidasTorneos();
    }
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
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
