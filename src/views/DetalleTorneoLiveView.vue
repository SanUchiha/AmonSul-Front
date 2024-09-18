<!-- eslint-disable vue/no-unused-vars -->
<template>
  <v-container class="text-center">
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading" class="center">
          <LoadingGandalf />
        </div>
        <div v-else class="center">
          <!-- Tabs dinámicas basadas en el número de rondas -->
          <v-card class="mx-auto" max-width="800">
            <!-- Usamos el índice de la tab seleccionada -->
            <v-tabs v-model="activeTab" grow>
              <!-- Mostramos el número de la ronda en la tab -->
              <v-tab v-for="n in numeroRondas" :key="n"> Ronda {{ n }} </v-tab>

              <v-tab value="Clasificación"> Clasificación </v-tab>
            </v-tabs>

            <!-- Mostrar las partidas correspondientes a la ronda seleccionada -->
            <v-tabs-window v-model="activeTab">
              <v-tab-item
                v-for="(partida, index) in partidasPorRonda[activeTab + 1]"
                :key="partida.idPartidaTorneo"
              >
                <v-card class="ma-3 bordered-card" max-width="400">
                  <v-card-title class="underlined-title"
                    >Mesa {{ index + 1 }}</v-card-title
                  >
                  <v-card-subtitle> </v-card-subtitle>
                  <v-divider></v-divider>

                  <v-card-text>
                    <div class="player-container">
                      <div class="player-details">
                        <div class="player-info">
                          <span
                            :class="{
                              highlight: partida.idUsuario1 === idUsuario,
                            }"
                          >
                            {{ partida.nick1 }}
                          </span>
                        </div>
                        <div class="player-info">
                          <span
                            v-if="
                              partida.resultadoUsuario1 === null &&
                              partida.idUsuario1 == idUsuario
                            "
                          ></span>
                          <span v-else>{{
                            partida.resultadoUsuario1 ?? "Esperando resultado"
                          }}</span>
                          <v-btn
                            v-if="
                              partida.resultadoUsuario1 === null &&
                              partida.idUsuario1 == idUsuario
                            "
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="
                              abrirModalPuntos(partida.idPartidaTorneo, 1)
                            "
                          >
                            Puntos
                          </v-btn>
                        </div>
                        <div class="player-info">
                          <span
                            v-if="
                              partida.liderMuertoUsuario1 === null &&
                              partida.idUsuario1 == idUsuario
                            "
                          ></span>
                          <span v-else>
                            ¿Mató al lider?
                            {{
                              partida.liderMuertoUsuario1 === true
                                ? "Sí"
                                : partida.liderMuertoUsuario1 === false
                                ? "No"
                                : "..."
                            }}
                          </span>

                          <v-btn
                            v-if="
                              partida.liderMuertoUsuario1 === null &&
                              partida.idUsuario1 == idUsuario
                            "
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="abrirModalLider(partida.idPartidaTorneo, 1)"
                          >
                            Lider
                          </v-btn>
                        </div>
                        <div class="player-info">
                          <v-icon>mdi-shield-outline</v-icon>
                          <span>{{ partida.ejercitoUsuario1 ?? "N/A" }}</span>
                        </div>
                        <div class="player-info">
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
                        </div>
                      </div>
                      <div class="versus">
                        <v-icon>mdi-vs</v-icon>
                      </div>
                      <!-- <v-divider vertical class="divider"></v-divider> -->
                      <div class="player-details">
                        <div class="player-info">
                          <span
                            :class="{
                              highlight: partida.idUsuario2 === idUsuario,
                            }"
                          >
                            {{ partida.nick2 }}
                          </span>
                        </div>
                        <div class="player-info">
                          <span
                            v-if="
                              partida.resultadoUsuario2 === null &&
                              partida.idUsuario2 == idUsuario
                            "
                          ></span>
                          <span v-else>{{
                            partida.resultadoUsuario2 ?? "Esperando resultado"
                          }}</span>
                          <v-btn
                            v-if="
                              partida.resultadoUsuario2 === null &&
                              partida.idUsuario2 == idUsuario
                            "
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="
                              abrirModalPuntos(partida.idPartidaTorneo, 2)
                            "
                          >
                            Puntos
                          </v-btn>
                        </div>

                        <div class="player-info">
                          <span
                            v-if="
                              partida.liderMuertoUsuario2 === null &&
                              partida.idUsuario2 == idUsuario
                            "
                          ></span>
                          <span v-else>
                            ¿Mató al lider?
                            {{
                              partida.liderMuertoUsuario2 === true
                                ? "Sí"
                                : partida.liderMuertoUsuario2 === false
                                ? "No"
                                : "..."
                            }}
                          </span>

                          <v-btn
                            v-if="
                              partida.liderMuertoUsuario2 === null &&
                              partida.idUsuario2 == idUsuario
                            "
                            class="mt-2"
                            variant="tonal"
                            color="primary"
                            size="small"
                            @click="abrirModalLider(partida.idPartidaTorneo, 2)"
                          >
                            Lider
                          </v-btn>
                        </div>

                        <div class="player-info">
                          <v-icon>mdi-shield-outline</v-icon>
                          <span>{{ partida.ejercitoUsuario2 ?? "N/A" }}</span>
                        </div>
                        <div class="player-info">
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
                        </div>
                      </div>
                    </div>
                    <v-divider></v-divider>
                    <v-list class="centered-list">
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            <v-icon>mdi-trophy</v-icon>
                            {{ getGanador(partida) }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            <v-icon>mdi-calendar</v-icon>
                            {{ partida.fechaPartida }}
                            <!-- TODO: format fecha -->
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title v-if="partida.escenarioPartida">
                            <v-icon>mdi-map-marker</v-icon>
                            {{ partida.escenarioPartida }}
                          </v-list-item-title>
                          <v-list-item-title v-else>
                            <v-btn
                              v-if="
                                partida.idUsuario1 == idUsuario ||
                                partida.idUsuario2 == idUsuario
                              "
                              class="mt-2"
                              variant="tonal"
                              color="primary"
                              size="small"
                              @click="
                                abrirModalEscenario(partida.idPartidaTorneo)
                              "
                            >
                              Escenario
                            </v-btn>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item
                v-if="
                  !partidasPorRonda[activeTab + 1] ||
                  !partidasPorRonda[activeTab + 1].length
                "
              >
                <p>No hay partidas de esta ronda aún.</p>
              </v-tab-item>
            </v-tabs-window>
            <v-tabs-window value="clasificacion"> </v-tabs-window>
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

    <ModalAddPuntosPartida
      v-if="isModalPuntosVisible"
      :isVisible="isModalPuntosVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      :usuario="usuarioSeleccionado"
      @confirmar="confirmarPuntos"
      @cerrar="cerrarModal"
    />

    <ModalLiderPartida
      v-if="isModalLiderVisible"
      :isVisible="isModalLiderVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      :usuario="usuarioSeleccionado"
      @confirmar="confirmarLider"
      @cerrar="cerrarModalLider"
    />

    <ModalAddEscenarioPartida
      v-if="isModalEscenarioVisible"
      :isVisible="isModalEscenarioVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      @confirmar="confirmarEscenario"
      @cerrar="cerrarModalEscenario"
    />
  </v-container>
</template>

<script setup lang="ts">
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import ModalAddEscenarioPartida from "@/components/ResultadosTorneos/ModalAddEscenarioPartida.vue";
import ModalAddPuntosPartida from "@/components/ResultadosTorneos/ModalAddPuntosPartida.vue";
import ModalLiderPartida from "@/components/ResultadosTorneos/ModalLiderPartida.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
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
const activeTab = ref(0);
const partidasPorRonda = ref<Record<number, PartidaTorneoDTO[]>>({});

const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);
const idUsuario = ref<number>();
const isModalListaVisible = ref<boolean>(false);
const listaData = ref<string>("");
const nickJugador = ref<string>("");
const idPartidaSeleccionada = ref<number>();
const usuarioSeleccionado = ref<1 | 2>();
const isModalPuntosVisible = ref(false);
const isModalLiderVisible = ref(false);
const isModalEscenarioVisible = ref(false);

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
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }

  console.log(partidas.value);
});

const getGanador = (partida: PartidaTorneoDTO) => {
  if (partida.ganadorPartidaTorneo === 1) {
    return partida.nick1;
  } else if (partida.ganadorPartidaTorneo === 2) {
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

const abrirModalPuntos = (idPartida: number, usuario: 1 | 2) => {
  idPartidaSeleccionada.value = idPartida;
  usuarioSeleccionado.value = usuario;
  isModalPuntosVisible.value = true;
};

const abrirModalLider = (idPartida: number, usuario: 1 | 2) => {
  idPartidaSeleccionada.value = idPartida;
  usuarioSeleccionado.value = usuario;
  isModalLiderVisible.value = true;
};

const abrirModalEscenario = (idPartida: number) => {
  idPartidaSeleccionada.value = idPartida;
  isModalEscenarioVisible.value = true;
};

const confirmarPuntos = async (puntos: number) => {
  if (idPartidaSeleccionada.value && usuarioSeleccionado.value !== null) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: idPartidaSeleccionada.value,
    };

    if (usuarioSeleccionado.value === 1) body.resultadoUsuario1 = puntos;
    else body.resultadoUsuario2 = puntos;

    try {
      await updatePartidaTorneo(body);
    } catch (error) {
      console.error(error);
    } finally {
      isModalPuntosVisible.value = false;
      window.location.reload();
    }
  }
};

const confirmarLider = async (lider: boolean) => {
  if (idPartidaSeleccionada.value && usuarioSeleccionado.value !== null) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: idPartidaSeleccionada.value,
    };

    if (usuarioSeleccionado.value === 1) body.liderMuertoUsuario1 = lider;
    else body.liderMuertoUsuario2 = lider;

    try {
      await updatePartidaTorneo(body);
    } catch (error) {
      console.error(error);
    } finally {
      isModalLiderVisible.value = false;
      window.location.reload();
    }
  }
};

const confirmarEscenario = async (escenario: string) => {
  if (idPartidaSeleccionada.value) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: idPartidaSeleccionada.value,
    };

    body.escenarioPartida = escenario;

    try {
      await updatePartidaTorneo(body);
    } catch (error) {
      console.error(error);
    } finally {
      isModalEscenarioVisible.value = false;
      window.location.reload();
    }
  }
};

// Cerrar modal
const cerrarModal = () => {
  isModalPuntosVisible.value = false;
};

// Cerrar modal lider
const cerrarModalLider = () => {
  isModalLiderVisible.value = false;
};

// Cerrar modal lider
const cerrarModalEscenario = () => {
  isModalEscenarioVisible.value = false;
};
</script>

<style scoped>
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
