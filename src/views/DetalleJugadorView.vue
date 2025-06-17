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

          <!--<v-tabs v-model="tab" color="primary" grow show-arrows next-icon="mdi-arrow-right-bold-box-outline" prev-icon="mdi-arrow-left-bold-box-outline">-->
          <v-tabs v-model="tab" color="primary" grow>
            <v-tab value="1">Perfil</v-tab>
            <v-tab value="2"> Amistosas </v-tab>
            <v-tab value="3"> Torneos </v-tab>
            <v-tab value="4"
              ><v-icon icon="mdi-calendar-account-outline"></v-icon
            ></v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <!-- Tab 1.
             spark
           Jugador card -->
            <v-window-item value="1">
              <PerfilUsuarioView
                :email="usuarioData.email"
                :editable="false"
              ></PerfilUsuarioView>
            </v-window-item>

            <!-- tab 2. (partidas)
           Lista de partidas -->
            <v-window-item value="2">
              <v-divider class="my-3"></v-divider>

              <div v-if="!isLoading && validMatches.length > 0">
                <v-card class="section-card stats-section pt-0 mt-0">
                  <v-col cols="12"
                    ><p class="text-h5 ringbearer">Partidas validadas</p></v-col
                  >
                  <v-divider></v-divider>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      md="6"
                      lg="4"
                      xl="4"
                      class="pb-0"
                      v-for="match in validMatches"
                      :key="match.idPartidaAmistosa"
                    >
                      <ValidadasMatchCard
                        :idUsuario="usuarioData.idUsuario"
                        :match="match"
                        class="mb-4"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </div>
              <div v-else>
                <h3>No tienes partidas validadas</h3>
              </div>
              <v-divider class="my-3"></v-divider>
            </v-window-item>

            <!-- tab 3 (partidas torneos) -->
            <v-window-item value="3">
              <div v-if="!isLoading && tournamentMatches.length > 0">
                <v-card class="section-card stats-section pt-0 mt-0">
                  <v-col cols="12"
                    ><p class="text-h5 ringbearer">Partidas de torneo</p></v-col
                  >
                  <v-divider></v-divider>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      md="6"
                      lg="4"
                      xl="4"
                      class="pb-0"
                      v-for="match in tournamentMatches"
                      :key="match.idPartidaTorneo"
                    >
                      <CardPartidaTorneo
                        :idUsuario="usuarioData.idUsuario"
                        :match="match"
                        class="mb-4"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </div>
              <div v-else>
                <h3>No tiene partidas de torneo</h3>
              </div>
              <v-divider class="my-3"></v-divider>
            </v-window-item>

            <!-- tab 4.
           Inscription a los tornoes (mis torneos)
           Lista de partidas -->
            <v-window-item value="4">
              <TablaInscripcionesTorneoIndividual
                :isLoading="isLoading"
                :listaTorneos="usuarioData.InscripcionesIndividualTorneo"
                :idUsuario="usuarioData.idUsuario"
                :disputado="false"
              />
            </v-window-item>
          </v-window>
        </div>
      </v-col>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn
            color="orange"
            variant="tonal"
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
import PerfilUsuarioView from "@/views/PerfilUsuarioView.vue";
import {
  ViewPartidaAmistosaDTO,
  ViewPartidaTorneoDTO,
} from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from "@/store/usuarios";
import CardPartidaTorneo from "@/components/PartidasTorneo/CardPartidaTorneo.vue";
import { getTournamentMatches } from "@/services/PartidaTorneoService";
import TablaInscripcionesTorneoIndividual from "@/components/Inscripcion/TablaInscripcionesTorneoIndividual.vue";

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
