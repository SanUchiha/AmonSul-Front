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
              <div v-if="!partidas.length > 0">
                <p>Aún no se ha generado ninguna ronda</p>
              </div>

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
                <!-- División en dos zonas a a partir de la ronda 3 -->
                <div v-if="idTorneo === 7">
                  <div
                    v-if="
                      clasificacionZona1.length > 0 &&
                      clasificacionZona2.length > 0
                    "
                  >
                    <!-- Valinor -->
                    <h3>Válinor</h3>
                    <v-table
                      v-if="activeTab == tabClasificacion"
                      density="compact"
                    >
                      <thead>
                        <tr>
                          <th class="text-center">Posición</th>
                          <th class="text-center">Jugador</th>
                          <th class="text-center">Victorias</th>
                          <th class="text-center">Puntos a favor</th>
                          <th class="text-center">Puntos en contra</th>
                          <th class="text-center">Diferencia de puntos</th>
                          <th class="tect-center">Líder</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(jugador, index) in clasificacionZona1"
                          :key="jugador.nick"
                        >
                          <td>{{ index + 1 }}</td>
                          <td>{{ jugador.nick }}</td>
                          <td>
                            {{ jugador.victorias }}
                          </td>
                          <td>{{ jugador.puntosFavor }}</td>
                          <td>
                            {{ jugador.puntosContra }}
                          </td>
                          <td>{{ jugador.diferenciaPuntos }}</td>
                          <td>
                            {{ jugador.lider }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>

                    <v-divider class="my-5"></v-divider>

                    <!-- Arda -->
                    <h3>Arda</h3>
                    <v-table
                      v-if="activeTab == tabClasificacion"
                      density="compact"
                    >
                      <thead>
                        <tr>
                          <th class="text-center">Posición</th>
                          <th class="text-center">Jugador</th>
                          <th class="text-center">Victorias</th>
                          <th class="text-center">Puntos a favor</th>
                          <th class="text-center">Puntos en contra</th>
                          <th class="text-center">Diferencia de puntos</th>
                          <th class="tect-center">Líder</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(jugador, index) in clasificacionZona2"
                          :key="jugador.nick"
                        >
                          <td>{{ index + 1 }}</td>
                          <td>{{ jugador.nick }}</td>
                          <td>
                            {{ jugador.victorias }}
                          </td>
                          <td>{{ jugador.puntosFavor }}</td>
                          <td>
                            {{ jugador.puntosContra }}
                          </td>
                          <td>{{ jugador.diferenciaPuntos }}</td>
                          <td>
                            {{ jugador.lider }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                  <div v-else><p>Esperando resultados...</p></div>
                </div>
                <!-- Para todo lo demás -->
                <div v-else>
                  <div v-if="clasificacion.length > 0">
                    <v-table
                      v-if="activeTab == tabClasificacion"
                      density="compact"
                    >
                      <thead>
                        <tr>
                          <th class="text-center">Posición</th>
                          <th class="text-center">Jugador</th>
                          <th class="text-center">Victorias</th>
                          <th class="text-center">Puntos a favor</th>
                          <th class="text-center">Puntos en contra</th>
                          <th class="text-center">Diferencia de puntos</th>
                          <th class="tect-center">Líder</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(jugador, index) in clasificacion"
                          :key="jugador.nick"
                        >
                          <td>{{ index + 1 }}</td>
                          <td>{{ jugador.nick }}</td>
                          <td>
                            {{ jugador.victorias }}
                          </td>
                          <td>{{ jugador.puntosFavor }}</td>
                          <td>
                            {{ jugador.puntosContra }}
                          </td>
                          <td>{{ jugador.diferenciaPuntos }}</td>
                          <td>
                            {{ jugador.lider }}
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                  <div v-else><p>Esperando resultados...</p></div>
                </div>
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
import { Clasificacion, UpdatePartidaTorneoDTO } from "@/interfaces/Live";
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
const partidas = ref<PartidaTorneoDTO[]>([]);
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
const clasificacion = ref<Clasificacion[]>([]);
const jugadoresZona1 = ref<Clasificacion[]>([]);
const jugadoresZona2 = ref<Clasificacion[]>([]);
const clasificacionDividida = ref<Clasificacion[]>([]);
const clasificacionZona1 = ref<Clasificacion[]>([]);
const clasificacionZona2 = ref<Clasificacion[]>([]);

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

    calcularClasificacion();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const calcularClasificacion = () => {
  const ranking: Record<
    number,
    {
      nick: string;
      victorias: number;
      puntosFavor: number;
      puntosContra: number;
      diferenciaPuntos: number;
      lider: number;
      idUsuario: number;
    }
  > = {};
  const rankingDividido: Record<
    number,
    {
      nick: string;
      victorias: number;
      puntosFavor: number;
      puntosContra: number;
      diferenciaPuntos: number;
      lider: number;
      idUsuario: number;
    }
  > = {};

  // Filtramos hasta la ronda 2 para dividir el grupo
  const partidasFiltradas = partidas.value?.filter(
    (partida) => partida.numeroRonda <= 2
  );

  partidasFiltradas?.forEach((partida) => {
    // Verifica que la partida esté validada por ambos usuarios
    if (partida.partidaValidadaUsuario1 && partida.partidaValidadaUsuario2) {
      const puntosUsuario1 = partida.resultadoUsuario1 ?? 0;
      const puntosUsuario2 = partida.resultadoUsuario2 ?? 0;
      const liderMuertoUsuario1 = partida.liderMuertoUsuario1 ? 1 : 0;
      const liderMuertoUsuario2 = partida.liderMuertoUsuario2 ? 1 : 0;

      // Inicializamos los jugadores si no están en el ranking
      if (!rankingDividido[partida.idUsuario1]) {
        rankingDividido[partida.idUsuario1] = {
          nick: partida.nick1,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario1,
        };
      }
      if (!rankingDividido[partida.idUsuario2]) {
        rankingDividido[partida.idUsuario2] = {
          nick: partida.nick2,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario2,
        };
      }

      // Actualizamos puntos a favor y en contra
      rankingDividido[partida.idUsuario1].puntosFavor += puntosUsuario1;
      rankingDividido[partida.idUsuario1].puntosContra += puntosUsuario2;
      rankingDividido[partida.idUsuario2].puntosFavor += puntosUsuario2;
      rankingDividido[partida.idUsuario2].puntosContra += puntosUsuario1;

      // Actualizamos la diferencia de puntos
      rankingDividido[partida.idUsuario1].diferenciaPuntos =
        rankingDividido[partida.idUsuario1].puntosFavor -
        rankingDividido[partida.idUsuario1].puntosContra;
      rankingDividido[partida.idUsuario2].diferenciaPuntos =
        rankingDividido[partida.idUsuario2].puntosFavor -
        rankingDividido[partida.idUsuario2].puntosContra;

      // Actualizamos las victorias
      if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
        rankingDividido[partida.idUsuario1].victorias += 1;
      } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
        rankingDividido[partida.idUsuario2].victorias += 1;
      }

      // Lider muerto primero
      if (liderMuertoUsuario1) {
        rankingDividido[partida.idUsuario1].lider += 1;
      } else if (liderMuertoUsuario2) {
        rankingDividido[partida.idUsuario2].lider += 1;
      }
    }
  });

  clasificacionDividida.value = Object.values(rankingDividido).sort((a, b) => {
    // 1. Ordenar por victorias
    if (b.victorias !== a.victorias) {
      return b.victorias - a.victorias;
    }
    // 2. Ordenar por diferencia de puntos (puntos a favor - puntos en contra)
    if (b.diferenciaPuntos !== a.diferenciaPuntos) {
      return b.diferenciaPuntos - a.diferenciaPuntos;
    }
    // 3. Ordenar por puntos a favor
    if (b.puntosFavor !== a.puntosFavor) {
      return b.puntosFavor - a.puntosFavor;
    }
    // 4. Ordenar por quién ha matado al líder primero
    return b.lider - a.lider;
  });

  dividirClasificacionEnZonas();

  // Clasificacion normal
  partidas.value?.forEach((partida) => {
    // Verifica que la partida esté validada por ambos usuarios
    if (partida.partidaValidadaUsuario1 && partida.partidaValidadaUsuario2) {
      const puntosUsuario1 = partida.resultadoUsuario1 ?? 0;
      const puntosUsuario2 = partida.resultadoUsuario2 ?? 0;
      const liderMuertoUsuario1 = partida.liderMuertoUsuario1 ? 1 : 0;
      const liderMuertoUsuario2 = partida.liderMuertoUsuario2 ? 1 : 0;

      // Inicializamos los jugadores si no están en el ranking
      if (!ranking[partida.idUsuario1]) {
        ranking[partida.idUsuario1] = {
          nick: partida.nick1,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario1,
        };
      }
      if (!ranking[partida.idUsuario2]) {
        ranking[partida.idUsuario2] = {
          nick: partida.nick2,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario2,
        };
      }

      // Actualizamos puntos a favor y en contra
      ranking[partida.idUsuario1].puntosFavor += puntosUsuario1;
      ranking[partida.idUsuario1].puntosContra += puntosUsuario2;
      ranking[partida.idUsuario2].puntosFavor += puntosUsuario2;
      ranking[partida.idUsuario2].puntosContra += puntosUsuario1;

      // Actualizamos la diferencia de puntos
      ranking[partida.idUsuario1].diferenciaPuntos =
        ranking[partida.idUsuario1].puntosFavor -
        ranking[partida.idUsuario1].puntosContra;
      ranking[partida.idUsuario2].diferenciaPuntos =
        ranking[partida.idUsuario2].puntosFavor -
        ranking[partida.idUsuario2].puntosContra;

      // Actualizamos las victorias
      if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
        ranking[partida.idUsuario1].victorias += 1;
      } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
        ranking[partida.idUsuario2].victorias += 1;
      }

      // Lider muerto primero
      if (liderMuertoUsuario1) {
        ranking[partida.idUsuario1].lider += 1;
      } else if (liderMuertoUsuario2) {
        ranking[partida.idUsuario2].lider += 1;
      }
    }
  });

  clasificacion.value = Object.values(ranking).sort((a, b) => {
    // 1. Ordenar por victorias
    if (b.victorias !== a.victorias) {
      return b.victorias - a.victorias;
    }
    // 2. Ordenar por diferencia de puntos (puntos a favor - puntos en contra)
    if (b.diferenciaPuntos !== a.diferenciaPuntos) {
      return b.diferenciaPuntos - a.diferenciaPuntos;
    }
    // 3. Ordenar por puntos a favor
    if (b.puntosFavor !== a.puntosFavor) {
      return b.puntosFavor - a.puntosFavor;
    }
    // 4. Ordenar por quién ha matado al líder primero
    return b.lider - a.lider;
  });

  // Clasificacion por zonas
  clasificacionZona1.value = clasificacion.value.filter((jugador) =>
    jugadoresZona1.value.some((z) => z.idUsuario === jugador.idUsuario)
  );

  clasificacionZona2.value = clasificacion.value.filter((jugador) =>
    jugadoresZona2.value.some((z) => z.idUsuario === jugador.idUsuario)
  );
};

const dividirClasificacionEnZonas = () => {
  const totalJugadores = clasificacionDividida.value.length;
  const esImpar = totalJugadores % 2 !== 0;

  const mitad = Math.floor(totalJugadores / 2);
  const zona1Size = esImpar ? mitad + 1 : mitad;

  jugadoresZona1.value = clasificacionDividida.value.slice(0, zona1Size);
  jugadoresZona2.value = clasificacionDividida.value.slice(zona1Size);
};

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
