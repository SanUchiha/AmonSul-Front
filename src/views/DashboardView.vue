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
           Jugador card
           ultima partida jugada
           ultimo torneo jugado -->
            <v-tabs-window-item value="one">
              <v-row justify="center">
                <v-col cols="12" md="12">
                  <v-row dense>
                    <v-col cols="12" md="12" class="text-center">
                      <JugadorCard :usuario="usuarioData" />
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" md="12" class="text-center">
                      <v-card :class="cardClass">
                        <v-card-title>Última partida</v-card-title>
                        <v-card-text v-if="ultimaPartida">{{
                          messageUltimaPartida
                        }}</v-card-text>
                        <v-card-text v-else
                          >No tienes aún partida registrada</v-card-text
                        >
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-row dense>
                    <v-col cols="12" md="12" class="text-center">
                      <v-card>
                        <v-card-title>Último torneo</v-card-title>
                        <v-card-text>No has jugado aún torneos.</v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <!-- tab 2. (partidas)
           partidas pendientes de validar
           Lista de partidas -->
            <v-tabs-window-item value="two">
              <v-btn
                class="dashboard_button mt-2"
                variant="tonal"
                size="large"
                appendIcon="mdi-open-in-app"
                prependIcon="mdi-open-in-app"
                @click="handleFormCreateMatch"
                >Registrar partida</v-btn
              >

              <v-divider class="my-3"></v-divider>

              <div v-if="pendingMatches.length > 0">
                <PendingMatchCard
                  v-for="match in pendingMatches"
                  :key="match.idPartidaAmistosa"
                  :match="match"
                  class="mb-4"
                  @partidaValidada="cargarPartidasPendientes"
                />
              </div>
              <div v-else>
                <h3>No tienes partidas pendientes de validar</h3>
              </div>

              <v-divider class="my-3"></v-divider>

              <div v-if="!isLoading && validMatches.length > 0">
                <ValidadasMatchCard
                  v-for="match in validMatches"
                  :key="match.idPartidaAmistosa"
                  :match="match"
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
              />
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import {
  getPartidasPendientesValidar,
  getPartidasValidadas,
} from "@/services/PartidasAmistosasService";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import PendingMatchCard from "@/components/PartidaAmistosa/PendingMatchCard.vue";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "../components/Commons/ProgressCircular.vue";
import { getUsuarioData } from "@/services/UsuariosService";
import { useRouter } from "vue-router";
import JugadorCard from "@/components/Usuarios/JugadorCard.vue";
import TablaInscripcionesTorneo from "@/components/Inscripcion/TablaInscripcionesTorneo.vue";

const tab = ref<number>(0);

const isLoading = ref(true);
const { getUser, getidUsuario } = useAuth();
const router = useRouter();
const emailUsuario = ref<string>(getUser.value ?? "null");
const idUsuarioLogger = ref<string>(getidUsuario.value!);
const usuarioData = ref<UsuarioDataDTO>({
  idUsuario: 0,
  nick: "",
  faccion: {
    idFaccion: 0,
    nombreFaccion: "",
  },
  PartidasValidadas: [],
  PartidasPendientes: [],
  Elos: [],
  inscripcionesTorneo: [],
  clasificacionElo: 0,
  puntuacionElo: 0,
  numeroPartidasJugadas: 0,
  partidasGanadas: 0,
  partidasEmpatadas: 0,
  partidasPerdidas: 0,
});

const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const validMatches = ref<ViewPartidaAmistosaDTO[]>([]);

const ultimaPartida = ref<ViewPartidaAmistosaDTO | null>(null);

const messageUltimaPartida = computed(() => {
  if (!ultimaPartida.value) return null;

  const nickRival =
    ultimaPartida.value.nickUsuario1 === usuarioData.value.nick
      ? ultimaPartida.value.nickUsuario2
      : ultimaPartida.value.nickUsuario1;

  if (ultimaPartida.value.ganadorPartidaNick == null) {
    return `Empate contra ${nickRival}`;
  }

  return ultimaPartida.value.ganadorPartidaNick === nickRival
    ? `Derrota contra ${nickRival}`
    : `Victoria contra ${nickRival}`;
});

const cardClass = computed(() => {
  if (!ultimaPartida.value) return "";
  if (ultimaPartida.value.ganadorPartidaNick == null) return "empate-card";
  return ultimaPartida.value.ganadorPartidaNick === usuarioData.value.nick
    ? "victoria-card"
    : "derrota-card";
});

const cargarPartidasValidadas = async () => {
  try {
    isLoading.value = true;
    const responseValidadas = await getPartidasValidadas(emailUsuario.value);

    ultimaPartida.value = responseValidadas[responseValidadas.length - 1];
  } catch (error) {
    console.error("Error al obtener las partidas validadas:", error);
  } finally {
    isLoading.value = false;
  }
};

const cargarPartidasPendientes = async () => {
  try {
    isLoading.value = true;
    pendingMatches.value = await getPartidasPendientesValidar(
      emailUsuario.value
    );
    pendingMatches.value = pendingMatches.value.reverse();
  } catch (error) {
    console.error(
      "Error al obtener las partidas pendientes de validar:",
      error
    );
  } finally {
    isLoading.value = false;
  }
};

const initializeComponent = async () => {
  isLoading.value = true;
  try {
    usuarioData.value = await getUsuarioData(parseInt(idUsuarioLogger.value!));
    console.log(usuarioData.value.inscripcionesTorneo);
    validMatches.value = usuarioData.value?.PartidasValidadas ?? [];
    pendingMatches.value = usuarioData.value?.PartidasPendientes ?? [];
  } catch (error) {
    console.error(error);
    router.push("error");
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeComponent);

const handleFormCreateMatch = () => {
  router.push({ name: "registrar-partida" });
};
</script>

<style scoped lang="scss">
.victoria-card {
  background-color: rgb(14, 84, 14);
  color: white;
}

.empate-card {
  background-color: rgb(151, 151, 15);
  color: black;
}

.derrota-card {
  background-color: rgb(106, 12, 12);
  color: white;
}

.error {
  color: red;
  text-align: center;
}

.dashboard {
  &_button {
    background-color: #632687;

    @media screen and (max-width: 720px) {
      width: 100%;
    }
  }
}
</style>
