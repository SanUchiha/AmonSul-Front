<!-- eslint-disable vue/no-unused-vars -->
<template>
  <v-container class="text-center">
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading" class="center">
          <LoadingGandalf />
        </div>
        <div v-else class="center">
          <v-card class="mx-auto" max-width="800">
            <!-- TABS -->
            <v-tabs v-model="activeTab" grow center-active fixed-tabs>
              <v-tab
                v-for="n in numeroRondas"
                :key="n"
                :text="`Ronda ${n}`"
                :value="n"
              >
              </v-tab>
              <v-tab
                :key="tabClasificacion"
                :text="`Clasificación`"
                :value="tabClasificacion"
              ></v-tab>
            </v-tabs>

            <!-- Contenido de las Tabs -->
            <v-tabs-window v-model="activeTab">
              <!-- tab dinamicas -->
              <v-tabs-item
                v-for="(partida, index) in partidasPorRonda[activeTab!]"
                :key="partida.idPartidaTorneo"
                :value="activeTab"
              >
                <div class="card-container">
                  <v-card class="ma-3 bordered-card" max-width="400">
                    <v-card-title class="underlined-title"
                      >Mesa {{ index + 1 }}</v-card-title
                    >
                    <v-card-subtitle> </v-card-subtitle>
                    <v-divider></v-divider>

                    <v-card-text>
                      <!-- Partida completada -->
                      <div v-if="partida.resultadoUsuario1">
                        <div class="player-container">
                          <div class="player-details">
                            <!-- validar 1 -->
                            <div
                              class="player-info"
                              v-if="
                                partida.partidaValidadaUsuario1 === null &&
                                partida.idUsuario1 == idUsuario
                              "
                            >
                              <span>
                                <v-btn
                                  class="mt-2"
                                  variant="tonal"
                                  color="primary"
                                  size="small"
                                  @click="
                                    abrirModalValidar(
                                      partida.idPartidaTorneo,
                                      1
                                    )
                                  "
                                >
                                  Validar
                                </v-btn>
                              </span>
                            </div>
                            <!-- nick 1 -->
                            <div class="player-info">
                              <span
                                :class="{
                                  highlight: partida.idUsuario1 === idUsuario,
                                }"
                              >
                                {{ partida.nick1 }}
                              </span>
                            </div>
                            <!-- resultado 1 -->
                            <div class="player-info">
                              <span> {{ partida.resultadoUsuario1 }}</span>
                            </div>
                            <!-- lider muerto 1 -->
                            <div class="player-info">
                              <span>
                                ¿Líder?
                                {{
                                  partida.liderMuertoUsuario1 === true
                                    ? "Sí"
                                    : partida.liderMuertoUsuario1 === false
                                    ? "No"
                                    : "..."
                                }}
                              </span>
                            </div>
                            <!-- lista 1 -->
                            <!-- <div class="player-info">
                          <v-icon>mdi-shield-outline</v-icon>
                          <span>{{ partida.ejercitoUsuario1 ?? "N/A" }}</span>
                        </div> -->
                            <!-- <div class="player-info">
                          <v-btn
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="
                              verLista(
                                partida.idUsuario1,
                                partida.idTorneo,
                                partida.nick1
                              )
                            "
                          >
                            Lista
                          </v-btn>
                        </div> -->
                          </div>

                          <v-divider vertical class="divider"></v-divider>

                          <div class="player-details">
                            <!-- validar 2 -->
                            <div
                              class="player-info"
                              v-if="
                                partida.partidaValidadaUsuario2 === null &&
                                partida.idUsuario2 == idUsuario
                              "
                            >
                              <span>
                                <v-btn
                                  class="mt-2"
                                  variant="tonal"
                                  color="primary"
                                  size="small"
                                  @click="
                                    abrirModalValidar(
                                      partida.idPartidaTorneo,
                                      2
                                    )
                                  "
                                >
                                  Validar
                                </v-btn>
                              </span>
                            </div>
                            <!-- nick 2 -->
                            <div class="player-info">
                              <span
                                :class="{
                                  highlight: partida.idUsuario2 === idUsuario,
                                }"
                              >
                                {{ partida.nick2 }}
                              </span>
                            </div>
                            <!-- resultado 2 -->
                            <div class="player-info">
                              <span>{{ partida.resultadoUsuario2 }}</span>
                            </div>
                            <!-- lider muerto 2 -->
                            <div class="player-info">
                              <span>
                                ¿Líder?
                                {{
                                  partida.liderMuertoUsuario2 === true
                                    ? "Sí"
                                    : partida.liderMuertoUsuario2 === false
                                    ? "No"
                                    : "..."
                                }}
                              </span>
                            </div>
                            <!-- lista 2 -->
                            <!-- <div class="player-info">
                          <v-icon>mdi-shield-outline</v-icon>
                          <span>{{ partida.ejercitoUsuario2 ?? "N/A" }}</span>
                        </div> -->
                            <!-- <div class="player-info">
                          <v-btn
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="
                              verLista(
                                partida.idUsuario2,
                                partida.idTorneo,
                                partida.nick2
                              )
                            "
                          >
                            Lista
                          </v-btn>
                        </div> -->
                          </div>
                        </div>
                        <v-divider></v-divider>
                        <v-list class="centered-list">
                          <!-- ganador -->
                          <v-list-item>
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-icon>mdi-trophy</v-icon>
                                {{ getGanador(partida) }}
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                          <!-- fecha -->
                          <v-list-item>
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-icon>mdi-calendar</v-icon>
                                {{ formatDate(partida.fechaPartida) }}
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                          <!-- escenario -->
                          <v-list-item v-if="partida.escenarioPartida">
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-icon>mdi-map-marker</v-icon>
                                {{ partida.escenarioPartida }}
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </div>
                      <!-- Partida sin completar -->
                      <div v-else>
                        <div class="player-container">
                          <div class="player-details">
                            <!-- nick 1 -->
                            <div class="player-info">
                              <span
                                :class="{
                                  highlight: partida.idUsuario1 === idUsuario,
                                }"
                              >
                                {{ partida.nick1 }}
                              </span>
                            </div>
                            <!-- lista 1 -->
                            <!-- <div class="player-info">
                          <v-icon>mdi-shield-outline</v-icon>
                          <span>{{ partida.ejercitoUsuario1 ?? "N/A" }}</span>
                        </div> -->
                            <!-- <div class="player-info">
                          <v-btn
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="
                              verLista(
                                partida.idUsuario1,
                                partida.idTorneo,
                                partida.nick1
                              )
                            "
                          >
                            Lista
                          </v-btn>
                        </div> -->
                          </div>

                          <v-divider vertical class="divider"></v-divider>

                          <div class="player-details">
                            <!-- nick 2 -->
                            <div class="player-info">
                              <span
                                :class="{
                                  highlight: partida.idUsuario2 === idUsuario,
                                }"
                              >
                                {{ partida.nick2 }}
                              </span>
                            </div>
                            <!-- lista 2 -->
                            <!-- <div class="player-info">
                          <v-icon>mdi-shield-outline</v-icon>
                          <span>{{ partida.ejercitoUsuario2 ?? "N/A" }}</span>
                        </div> -->
                            <!-- <div class="player-info">
                          <v-btn
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="
                              verLista(
                                partida.idUsuario2,
                                partida.idTorneo,
                                partida.nick2
                              )
                            "
                          >
                            Lista
                          </v-btn>
                        </div> -->
                          </div>
                        </div>
                        <v-divider></v-divider>
                        <v-list class="centered-list">
                          <!-- fecha -->
                          <v-list-item>
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-icon>mdi-calendar</v-icon>
                                {{ formatDate(partida.fechaPartida) }}
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                          <!-- editar partida -->
                          <v-list-item
                            v-if="
                              partida.idUsuario1 == idUsuario ||
                              partida.idUsuario2 == idUsuario
                            "
                          >
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-btn
                                  variant="tonal"
                                  color="primary"
                                  @click="editPartida(partida, idUsuario)"
                                  large
                                  >Subir resultados</v-btn
                                >
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                          <v-list-item v-else>
                            <v-list-item-content>
                              <v-list-item-title>
                                <p>Esperando resultados</p>
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-tabs-item>
              <!-- Tab clasificacion -->
              <v-tabs-window-item
                :value="tabClasificacion"
                :key="tabClasificacion"
              >
                Contenido de la tab clasificacion
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Modal Lista -->
    <ModalListaResultadoTorneo
      v-if="isModalListaVisible"
      :listaData="listaData"
      :nickJugador="nickJugador"
      @close="isModalListaVisible = false"
    />

    <!-- Spinner Modal -->
    <v-dialog v-model="isLoadingImage" persistent width="300">
      <v-card>
        <v-card-text
          class="d-flex justify-center align-center"
          style="height: 150px"
        >
          <v-progress-circular
            indeterminate
            color="blue-lighten-3"
            :size="57"
          ></v-progress-circular>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal validar -->
    <ModalValidarPartida
      v-if="isModalValidarVisible"
      :isVisible="isModalValidarVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      @confirmar="confirmarValidar"
      @cerrar="cerrarModalValidar"
    />

    <!-- Modal editar -->
    <ModalEditarPartida
      v-if="isModalEditarPartidaVisible"
      :isVisible="isModalEditarPartidaVisible"
      :partida="partidaSelected"
      :idUsuario="idUsuarioSelected"
      @confirmar="confirmarEditarPartida"
      @cerrar="cerrarModalEditarPartida"
    />
  </v-container>
</template>

<script setup lang="ts">
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import ModalEditarPartida from "@/components/ResultadosTorneos/ModalEditarPartida.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalValidarPartida from "@/components/ResultadosTorneos/ModalValidarPartida.vue";
import { useAuth } from "@/composables/useAuth";
import { ListaTorneoRequestDTO } from "@/interfaces/Lista";
import { UpdatePartidaTorneoDTO } from "@/interfaces/Live";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { Torneo } from "@/interfaces/Torneo";
import { getlistaTorneo } from "@/services/ListasService";
import { updatePartidaTorneo } from "@/services/PartidaTorneoService";
import { getPartidasTorneo, getTorneo } from "@/services/TorneosService";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const idTorneo = ref<number>(Number(route.params.idTorneo));
const isLoading = ref<boolean>(false);
const isLoadingImage = ref<boolean>(false);

const torneo = ref<Torneo>();
const partidas = ref<PartidaTorneoDTO[]>();
const numeroRondas = ref<number[]>([]);
const activeTab = ref(1);
const partidasPorRonda = ref<Record<number, PartidaTorneoDTO[]>>({});

const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const idUsuario = ref<number>();
const isModalListaVisible = ref<boolean>(false);
const listaData = ref<string>("");
const nickJugador = ref<string>("");
const idPartidaSeleccionada = ref<number>();
const idUsuarioSelected = ref<number>(0);

const usuarioSeleccionado = ref<1 | 2>();
const isModalValidarVisible = ref<boolean>(false);
const isModalEditarPartidaVisible = ref<boolean>(false);
const partidaSelected = ref<PartidaTorneoDTO>({
  ejercitoUsuario1: null,
  ejercitoUsuario2: null,
  escenarioPartida: null,
  fechaPartida: "",
  ganadorPartidaTorneo: null,
  idPartidaTorneo: 0,
  idTorneo: 0,
  idUsuario1: 0,
  idUsuario2: 0,
  liderMuertoUsuario1: null,
  liderMuertoUsuario2: null,
  nick1: "",
  nick2: "",
  numeroRonda: 0,
  partidaValidadaUsuario1: null,
  partidaValidadaUsuario2: null,
  resultadoUsuario1: null,
  resultadoUsuario2: null,
});

const tabClasificacion = ref<number>(1);

onMounted(async () => {
  if (idUsuarioLogger.value) idUsuario.value = parseInt(idUsuarioLogger.value);
  isLoading.value = true;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneo.value = responseTorneo.data;

    const responsePartidas = await getPartidasTorneo(idTorneo.value);
    partidas.value = responsePartidas.data;

    if (torneo.value) {
      numeroRondas.value = Array.from(
        { length: torneo.value.numeroPartidas },
        (_, index) => index + 1
      );
    }
    if (partidas.value) {
      partidasPorRonda.value = partidas.value.reduce((acc, partida) => {
        const { numeroRonda } = partida;
        if (!acc[numeroRonda]) {
          acc[numeroRonda] = [];
        }
        acc[numeroRonda].push(partida);
        return acc;
      }, {} as Record<number, PartidaTorneoDTO[]>);
    }

    tabClasificacion.value = numeroRondas.value.length + 1;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const getGanador = (partida: PartidaTorneoDTO) => {
  if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
    return partida.nick1;
  } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
    return partida.nick2;
  } else {
    return "Empate";
  }
};

const verLista = async (idUsuario: number, idTorneo: number, nick: string) => {
  isLoadingImage.value = true;
  if (idTorneo && idUsuario && nick) {
    const body: ListaTorneoRequestDTO = {
      idTorneo: idTorneo,
      idUsuario: idUsuario,
    };

    try {
      const listaResponse = await getlistaTorneo(body);
      listaData.value = listaResponse.data;
      nickJugador.value = nick;
      isModalListaVisible.value = true;
    } catch (error) {
      console.error(error);
      isModalListaVisible.value = false;
      isLoadingImage.value = false;
    } finally {
      isLoadingImage.value = false;
    }
  }
};

const abrirModalValidar = (idPartida: number, usuario: 1 | 2) => {
  idPartidaSeleccionada.value = idPartida;
  usuarioSeleccionado.value = usuario;
  isModalValidarVisible.value = true;
};

const editPartida = (partida: PartidaTorneoDTO, idUsuario: number) => {
  partidaSelected.value = partida;

  if (idUsuario === partida.idUsuario1) idUsuarioSelected.value = 1;
  else idUsuarioSelected.value = 2;

  isModalEditarPartidaVisible.value = true;
};

const confirmarValidar = async () => {
  if (idPartidaSeleccionada.value) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: idPartidaSeleccionada.value,
    };

    if (usuarioSeleccionado.value === 1) body.partidaValidadaUsuario1 = true;
    else body.partidaValidadaUsuario2 = true;

    try {
      await updatePartidaTorneo(body);
    } catch (error) {
      console.error(error);
    } finally {
      isModalValidarVisible.value = false;
      window.location.reload();
    }
  }
};

const confirmarEditarPartida = async (partida: PartidaTorneoDTO) => {
  if (partida) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: partida.idPartidaTorneo,
      resultadoUsuario1: partida.resultadoUsuario1,
      resultadoUsuario2: partida.resultadoUsuario2,
      escenarioPartida: partida.escenarioPartida,
      liderMuertoUsuario1: partida.liderMuertoUsuario1,
      liderMuertoUsuario2: partida.liderMuertoUsuario2,
    };

    if (partida.partidaValidadaUsuario1) body.partidaValidadaUsuario1 = true;
    else body.partidaValidadaUsuario2 = true;

    try {
      await updatePartidaTorneo(body);
    } catch (error) {
      console.error(error);
    } finally {
      isModalEditarPartidaVisible.value = false;
      window.location.reload();
    }
  }
};

const cerrarModalValidar = () => {
  isModalValidarVisible.value = false;
};
const cerrarModalEditarPartida = () => {
  isModalEditarPartidaVisible.value = false;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.player-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
  position: relative;
}

.player-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 40%; /* Limita el ancho de cada jugador */
  text-align: center;
}

.player-info {
  display: flex;
  align-items: center;
  margin: 0.5em 0;
}

.player-info span {
  max-width: 100%;
  white-space: nowrap; /* Evita que el texto ocupe más de una línea */
  overflow: hidden;
  text-overflow: ellipsis; /* Añade "..." al final si el texto es muy largo */
}

.divider {
  height: 80px; /* Ajusta según sea necesario */
  margin: 0 10px; /* Espaciado horizontal */
  align-self: center;
}

.versus {
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-list-item-subtitle {
  font-size: large;
}

.centered-list {
  text-align: center;
}

.highlight {
  color: rgb(224, 175, 13);
  font-weight: bold;
}

.bordered-card {
  border: 1px solid #ccc; /* Borde para cada card */
  border-radius: 8px; /* Bordes redondeados */
}

.underlined-title {
  text-decoration: underline; /* Subrayar el título MESA X */
  font-weight: bold;
}
</style>
