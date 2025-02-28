<template>
  <v-container class="text-center">
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading" class="center">
          <LoadingGandalf />
        </div>
        <div v-else class="center">
          <v-card class="mx-auto" max-width="800">
            <v-tabs v-model="activeTab" grow center-active fixed-tabs>
              <v-tab :key="0" :text="`Gestión`" :value="0">Gestión</v-tab>
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
              <!-- tab Gestion -->
              <v-tabs-window-item :value="0" :key="0">
                <div>
                  <CardGestionTorneo :torneo="torneoGestion" />

                  <TablaInscritos
                    :torneo="torneoGestion"
                    @inscripcionEliminada="handleInscripcionEliminada"
                  />
                </div>
              </v-tabs-window-item>

              <div
                v-if="isRondaValidada(activeTab)"
                class="ma-3 text-green-500"
              >
                Todas las partidas están validadas
                <div>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        <div class="flex-column align-items-center">
                          <v-btn
                            class="mt-2"
                            variant="tonal"
                            color="secondary"
                            @click="agregarPairing(activeTab)"
                          >
                            Añadir partida
                          </v-btn>
                        </div>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </div>
                <div v-if="ultimaRonda != activeTab" class="mt-3">
                  <div
                    v-if="partidasPorRonda[activeTab + 1] != undefined"
                    class="mt-3"
                  >
                    La ronda {{ activeTab + 1 }} ya se ha generado
                  </div>
                  <div v-else>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          <div class="flex-column align-items-center">
                            <v-btn
                              class="mt-2"
                              variant="tonal"
                              color="primary"
                              @click="generarSiguienteRonda(activeTab + 1)"
                            >
                              Generar siguiente ronda
                            </v-btn>
                          </div>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </div>
                <div v-else class="mt-3">
                  <!-- boton para cerrar el torneo -->
                  <v-btn
                    v-if="hasGanador && !wasSave"
                    class="mt-2"
                    variant="tonal"
                    color="primary"
                    @click="resultados(activeTab)"
                  >
                    Guardar resultados
                  </v-btn>
                </div>
              </div>
              <div v-else class="ma-3">
                <div
                  v-if="
                    !partidasPorRonda[activeTab] &&
                    activeTab != 0 &&
                    activeTab != numeroRondas.length + 1
                  "
                >
                  Esperando ronda...
                  <div>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          <div class="flex-column align-items-center">
                            <v-btn
                              class="mt-2"
                              variant="tonal"
                              color="secondary"
                              @click="agregarPairing(activeTab)"
                            >
                              Añadir partida
                            </v-btn>
                          </div>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </div>
                <div v-else>
                  <div v-if="partidasPorRonda[activeTab]" class="text-red-500">
                    Faltan partidas por validar
                    <div>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            <div class="flex-column align-items-center">
                              <v-btn
                                class="mt-2"
                                variant="tonal"
                                color="secondary"
                                @click="agregarPairing(activeTab)"
                              >
                                Añadir partida
                              </v-btn>
                            </div>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </div>
                  </div>
                </div>
              </div>

              <!-- tab rondas dinamicas -->
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
                      <div class="player-container">
                        <!-- jugador 1 -->
                        <div class="player-details">
                          <!-- Validar 1 -->
                          <div class="player-info">
                            <span>
                              <v-icon
                                v-if="partida.partidaValidadaUsuario1"
                                color="green"
                                >mdi-check</v-icon
                              >
                              <v-icon v-else color="red">mdi-close</v-icon>

                              <v-btn
                                class="mt-2"
                                variant="tonal"
                                color="primary"
                                size="small"
                                @click="
                                  abrirModalValidar(partida.idPartidaTorneo, 1)
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
                            <span v-if="partida.resultadoUsuario1 != null"
                              >{{ partida.resultadoUsuario1 }}
                            </span>
                            <span v-else>
                              <v-icon color="red">mdi-close</v-icon>
                            </span>
                          </div>
                          <!-- lider 1 -->
                          <div class="player-info">
                            <span v-if="partida.liderMuertoUsuario1 != null">
                              ¿Líder?
                              {{
                                partida.liderMuertoUsuario1 === true
                                  ? "Sí"
                                  : partida.liderMuertoUsuario1 === false
                                  ? "No"
                                  : "N/A"
                              }}
                            </span>
                            <span v-else>
                              ¿Líder?
                              <v-icon color="red">mdi-close</v-icon>
                            </span>
                          </div>
                          <!-- ejercito 1 -->
                          <div class="player-info">
                            <v-icon>mdi-shield-outline</v-icon>
                            <span>{{ partida.ejercitoUsuario1 ?? "N/A" }}</span>
                          </div>
                          <!-- lista 1 -->
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

                        <v-divider vertical class="divider"></v-divider>

                        <!-- jugador 2 -->
                        <div class="player-details">
                          <!-- validar 2 -->
                          <div class="player-info">
                            <span>
                              <v-icon
                                v-if="partida.partidaValidadaUsuario2"
                                color="green"
                                >mdi-check</v-icon
                              >
                              <v-icon v-else color="red">mdi-close</v-icon>

                              <v-btn
                                class="mt-2"
                                variant="tonal"
                                color="primary"
                                size="small"
                                @click="
                                  abrirModalValidar(partida.idPartidaTorneo, 2)
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
                            <span v-if="partida.resultadoUsuario2 != null"
                              >{{ partida.resultadoUsuario2 }}
                            </span>
                            <span v-else>
                              <v-icon color="red">mdi-close</v-icon>
                            </span>
                          </div>
                          <!-- lider 2 -->
                          <div class="player-info">
                            <span v-if="partida.liderMuertoUsuario2 != null">
                              ¿Líder?
                              {{
                                partida.liderMuertoUsuario2 === true
                                  ? "Sí"
                                  : partida.liderMuertoUsuario2 === false
                                  ? "No"
                                  : "N/A"
                              }}
                            </span>
                            <span v-else>
                              ¿Líder?
                              <v-icon color="red">mdi-close</v-icon>
                            </span>
                          </div>
                          <!-- ejercito 2 -->
                          <div class="player-info">
                            <v-icon>mdi-shield-outline</v-icon>
                            <span>{{ partida.ejercitoUsuario2 ?? "N/A" }}</span>
                          </div>
                          <!-- lista 2 -->
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
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              <v-icon>mdi-map-marker</v-icon>
                              {{ partida.escenarioPartida }}
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                        <!-- Modificar partida -->
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              <div class="flex-column align-items-center">
                                <v-btn
                                  class="mt-2"
                                  variant="tonal"
                                  color="secondary"
                                  @click="modificarPartida(partida)"
                                >
                                  Modificar Resultado
                                </v-btn>
                              </div>
                            </v-list-item-title>
                            <v-list-item-title>
                              <div class="flex-column align-items-center">
                                <v-btn
                                  class="mt-2"
                                  variant="tonal"
                                  color="secondary"
                                  @click="modificarPairing(partida)"
                                >
                                  Modificar Pairing
                                </v-btn>
                              </div>
                            </v-list-item-title>
                            <v-list-item-title>
                              <div class="flex-column align-items-center">
                                <v-btn
                                  class="mt-2"
                                  variant="tonal"
                                  color="error"
                                  @click="eliminarPartida(partida)"
                                >
                                  Eliminar partida
                                </v-btn>
                              </div>
                            </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
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
                <div v-if="(torneo!.idTorneo === 7)">
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
                          <th class="text-center">Puntos</th>
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
                          <th class="text-center">Puntos</th>
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
                          <th class="text-center">Puntos</th>
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
                          :class="{
                            'good-bando': jugador.bando === 'good',
                            'evil-bando': jugador.bando === 'evil',
                          }"
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

    <!-- Modal añadir puntos partida -->
    <ModalAddPuntosPartida
      v-if="isModalPuntosVisible"
      :isVisible="isModalPuntosVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      :usuario="usuarioSeleccionado"
      @confirmar="confirmarPuntos"
      @cerrar="cerrarModal"
    />

    <!-- Modal añadir lider partida -->
    <ModalLiderPartida
      v-if="isModalLiderVisible"
      :isVisible="isModalLiderVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      :usuario="usuarioSeleccionado"
      @confirmar="confirmarLider"
      @cerrar="cerrarModalLider"
    />

    <!-- Modal añadir escenario partida -->
    <ModalAddEscenarioPartida
      v-if="isModalEscenarioVisible"
      :isVisible="isModalEscenarioVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      :usuario="usuarioSeleccionado"
      @confirmar="confirmarEscenario"
      @cerrar="cerrarModalEscenario"
    />

    <!-- Modal validar partida -->
    <ModalValidarPartida
      v-if="isModalValidarVisible"
      :isVisible="isModalValidarVisible"
      :idPartidaTorneo="idPartidaSeleccionada"
      @confirmar="confirmarValidar"
      @cerrar="cerrarModalValidar"
    />

    <!-- Modal generar siguiente ronda -->
    <ModalParametrosRondas
      :isVisible="showConfigModal"
      :torneo="torneoGestion"
      :clasificacion="clasificacion"
      :clasificacionDividida="clasificacionDividida"
      :ronda="rondaAGenerar"
      @close="closeConfigModal"
      @confirm="handleConfigConfirm"
    />

    <!-- Modal modificar partida -->
    <ModalEditarPartidaGestion
      :isVisible="showModificarPartidaTorneoModal"
      :partida="partidaActual"
      @cerrar="closeModificarPartidaTorneoModal"
      @confirm="handleModificarPartidaTorneoConfirm"
    />

    <!-- Modal cambiar pairing -->
    <ModalEditarPairing
      :isVisible="showModificarPairingModal"
      :partida="partidaActual"
      @cerrar="closeModificarPairingModal"
      @confirm="handleModificarPairingTorneoConfirm"
    />
    <!-- Modal cambiar pairing -->
    <ModalAgregarPairing
      :isVisible="showAgregarPairingModal"
      :idTorneo="idTorneo"
      :idRonda="idRondaSelected"
      @cerrar="closeAgregarPairingModal"
    />

    <!-- Modal modificar partida -->
    <ModalEliminarPartidaTorneo
      :isVisible="showEliminarPartidaModal"
      :partida="partidaActual"
      @cerrar="closeEliminarPartidaModal"
      @confirm="handleEliminarPartidaConfirm"
    />

    <!-- Modal success guardar resultados -->
    <ModalSuccess
      :isVisible="showSuccessModal"
      message="Acción realizada correctamente."
      @update:isVisible="showSuccessModal = $event"
    />

    <!-- Modal error guardar resultados -->
    <ModalError
      :isVisible="showErrorModal"
      message="No se han podido guardar los resultados. Intentalo de nuevo y si el error persiste contacta con el administrador."
      @update:isVisible="showErrorModal = $event"
    />

    <!-- Modal de progreso circular -->
    <v-dialog v-model="isGenerating" hide-overlay persistent>
      <v-card class="progress-card">
        <v-progress-circular
          indeterminate
          color="primary"
          size="70"
        ></v-progress-circular>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import {
  getInfoTorneoCreado,
  guardarResultados,
} from "@/services/TorneosService";
import TablaInscritos from "@/components/GestionTorneos/TablaInscritos.vue";
import CardGestionTorneo from "@/components/GestionTorneos/CardGestionTorneo.vue";
import {
  GuardarResultadosDTO,
  ResultadoJugador,
  TorneoGestionInfoDTO,
} from "@/interfaces/Torneo";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import ModalAddEscenarioPartida from "@/components/ResultadosTorneos/ModalAddEscenarioPartida.vue";
import ModalAddPuntosPartida from "@/components/ResultadosTorneos/ModalAddPuntosPartida.vue";
import ModalLiderPartida from "@/components/ResultadosTorneos/ModalLiderPartida.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalValidarPartida from "@/components/ResultadosTorneos/ModalValidarPartida.vue";
import { ListaTorneoRequestDTO } from "@/interfaces/Lista";
import {
  Clasificacion,
  GenerarRonda,
  UpdatePartidaTorneoDTO,
} from "@/interfaces/Live";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { Torneo } from "@/interfaces/Torneo";
import { getlistaTorneo } from "@/services/ListasService";
import { updatePartidaTorneo } from "@/services/PartidaTorneoService";
import {
  getPartidasTorneo,
  getTorneo,
  isSaveTournament,
} from "@/services/TorneosService";
import ModalParametrosRondas from "@/components/GestionTorneos/ModalParametrosRondas.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalEditarPartidaGestion from "@/components/GestionTorneos/ModalEditarPartidaGestion.vue";
import ModalEditarPairing from "@/components/GestionTorneos/ModalEditarPairing.vue";
import ModalEliminarPartidaTorneo from "@/components/GestionTorneos/ModalEliminarPartidaTorneo.vue";
import { appsettings } from "@/settings/appsettings";
import ModalAgregarPairing from "@/components/GestionTorneos/ModalAgregarPairing.vue";

const isLoadingImage = ref<boolean>(false);
const torneo = ref<Torneo>();
const partidas = ref<PartidaTorneoDTO[]>([]);
const numeroRondas = ref<number[]>([]);
const activeTab = ref<number>(2);
const partidasPorRonda = ref<Record<number, PartidaTorneoDTO[]>>({});
const idUsuario = ref<number>();
const isModalListaVisible = ref<boolean>(false);
const listaData = ref<string>("");
const nickJugador = ref<string>("");
const idPartidaSeleccionada = ref<number>();
const usuarioSeleccionado = ref<1 | 2>();
const isModalPuntosVisible = ref<boolean>(false);
const isModalLiderVisible = ref<boolean>(false);
const isModalEscenarioVisible = ref<boolean>(false);
const isModalValidarVisible = ref<boolean>(false);
const tabClasificacion = ref<number>();
const route = useRoute();
const idTorneo = ref<number>();
const isLoading = ref<boolean>(false);
const torneoGestion = ref<TorneoGestionInfoDTO | null>(null);
const clasificacion = ref<Clasificacion[]>([]);
const jugadoresZona1 = ref<Clasificacion[]>([]);
const jugadoresZona2 = ref<Clasificacion[]>([]);
const rondaAGenerar = ref<number>(0);
const showConfigModal = ref<boolean>(false);
const clasificacionDividida = ref<Clasificacion[]>([]);
const clasificacionZona1 = ref<Clasificacion[]>([]);
const clasificacionZona2 = ref<Clasificacion[]>([]);
const ultimaRonda = ref<number>();
const hasGanador = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const isGenerating = ref<boolean>(false);
const showModificarPartidaTorneoModal = ref<boolean>(false);
const showModificarPairingModal = ref<boolean>(false);
const showAgregarPairingModal = ref<boolean>(false);
const showEliminarPartidaModal = ref<boolean>(false);
const partidaActual = ref<PartidaTorneoDTO>({
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
const idRondaSelected = ref<number>(0);
const wasSave = ref<boolean>(false);

onMounted(async () => {
  idTorneo.value = parseInt(route.params.idTorneo.toString());

  isLoading.value = true;

  try {
    const responseTorneo = await getInfoTorneoCreado(idTorneo.value);
    torneoGestion.value = responseTorneo.data;
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }

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

    ultimaRonda.value = numeroRondas.value.length;
    const ganador: number = clasificacionZona1.value[0].idUsuario;
    if (ganador != null) hasGanador.value = true;

    const isSave = await isSaveTournament(idTorneo.value);
    wasSave.value = isSave.data;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const resultados = async (ronda: number) => {
  // //TODO  domadores
  // if (torneo.value?.idTorneo == 7) {
  //   try {
  //     isGenerating.value = true;
  //     const resultados1: Resultado[] = clasificacionZona1.value.map(
  //       (clasificacion, index) => {
  //         return {
  //           idUsuario: clasificacion.idUsuario,
  //           idTorneo: torneo.value?.idTorneo,
  //           resultado: index + 1,
  //         };
  //       }
  //     );

  //     await guardarResultados(resultados1);

  //     const resultados2: Resultado[] = clasificacionZona2.value.map(
  //       (clasificacion, index) => {
  //         return {
  //           idUsuario: clasificacion.idUsuario,
  //           idTorneo: torneo.value?.idTorneo,
  //           resultado: index + 1,
  //         };
  //       }
  //     );

  //     await guardarResultados(resultados2);

  //     showSuccessModal.value = true;
  //   } catch (error) {
  //     showErrorModal.value = true;
  //     console.error(error);
  //   } finally {
  //     isGenerating.value = false;
  //   }

  try {
    isGenerating.value = true;
    const ganadores: ResultadoJugador[] = clasificacion.value.map(
      (clasi, index) => {
        return {
          idUsuario: clasi.idUsuario,
          idTorneo: torneo.value?.idTorneo,
          resultado: index + 1,
        };
      }
    );
    const idTorneo: number | undefined = torneo.value?.idTorneo;

    console.log(idTorneo);

    if (idTorneo == undefined) return;

    const partidasUltimasRonda: GenerarRonda = {
      emparejamientos: [],
      luzVsOscCheck: false,
      mismaComunidadCheck: false,
      retosCheck: false,
      esEloCheck: false,
      opcionImpares: null,
      idTorneo: idTorneo,
      idRonda: ronda,
    };

    const guardarResultadosDTO: GuardarResultadosDTO = {
      ganadoresDTO: ganadores,
      generarRondaDTO: partidasUltimasRonda,
    };
    await guardarResultados(guardarResultadosDTO);
    showSuccessModal.value = true;
  } catch (error) {
    showErrorModal.value = true;
    console.error(error);
  } finally {
    isGenerating.value = false;
  }
};

const closeConfigModal = () => {
  showConfigModal.value = false;
  window.location.reload();
};

const handleConfigConfirm = () => {
  closeConfigModal();
};

const closeModificarPartidaTorneoModal = () => {
  showModificarPartidaTorneoModal.value = false;
};

const handleModificarPartidaTorneoConfirm = async (
  partidaEditada: PartidaTorneoDTO
) => {
  isGenerating.value = true;

  if (partidaEditada !== null) {
    try {
      await updatePartidaTorneo(partidaEditada);
      showSuccessModal.value = true;
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
    } finally {
      isGenerating.value = false;
      closeModificarPartidaTorneoModal();
    }
  }
};

// Watch para detectar cuando se cierra el modal de éxito
watch(
  () => showSuccessModal.value,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      recargarPagina();
    }
  }
);

const modificarPartida = (partidaRecibida: PartidaTorneoDTO) => {
  partidaActual.value = partidaRecibida;
  showModificarPartidaTorneoModal.value = true;
};

const recargarPagina = () => {
  window.location.reload();
};

const closeModificarPairingModal = () => {
  showModificarPairingModal.value = false;
};

const closeAgregarPairingModal = () => {
  showAgregarPairingModal.value = false;
};

const closeEliminarPartidaModal = () => {
  showEliminarPartidaModal.value = false;
};

const handleModificarPairingTorneoConfirm = () => {
  try {
    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    closeModificarPairingModal();
  }
};

const handleEliminarPartidaConfirm = () => {
  try {
    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    closeEliminarPartidaModal();
  }
};

const modificarPairing = (partidaRecibida: PartidaTorneoDTO) => {
  partidaActual.value = partidaRecibida;
  showModificarPairingModal.value = true;
};

const agregarPairing = (idRonda: number) => {
  idRondaSelected.value = idRonda;
  showAgregarPairingModal.value = true;
};

const eliminarPartida = (partidaRecibida: PartidaTorneoDTO) => {
  partidaActual.value = partidaRecibida;
  showEliminarPartidaModal.value = true;
};

const generarSiguienteRonda = (ronda: number) => {
  try {
    rondaAGenerar.value = ronda;
    showConfigModal.value = true;
  } catch (error) {
    console.error("Error al generar la siguiente ronda:", error);
  }
};

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
        rankingDividido[partida.idUsuario1].victorias += 3;
      } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
        rankingDividido[partida.idUsuario2].victorias += 3;
      } else {
        rankingDividido[partida.idUsuario1].victorias += 1;
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
        ranking[partida.idUsuario1].victorias += 3;
      } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
        ranking[partida.idUsuario2].victorias += 3;
      } else {
        ranking[partida.idUsuario1].victorias += 1;
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

  type JugadorConEjercito = {
    nick: string;
    ejercito: string | null;
  };

  const jugadoresConEjercitos = partidas.value.reduce<JugadorConEjercito[]>(
    (acc, partida) => {
      acc.push({ nick: partida.nick1, ejercito: partida.ejercitoUsuario1 });
      acc.push({ nick: partida.nick2, ejercito: partida.ejercitoUsuario2 });
      return acc;
    },
    []
  );

  const listaEjercitos = appsettings.armies;

  const ejercitosJugadoresConBando = jugadoresConEjercitos.map((jugador) => {
    const ejercito = listaEjercitos.find((e) => e.name === jugador.ejercito);
    return {
      nick: jugador.nick,
      ejercito: jugador.ejercito,
      bando: ejercito ? ejercito.band : "desconocido",
    };
  });

  clasificacion.value = clasificacion.value.map((j) => {
    const bando = ejercitosJugadoresConBando.find(
      (e) => e.nick === j.nick
    )?.bando;
    return { ...j, bando }; // Devuelve el objeto original más el atributo bando
  });
};

const dividirClasificacionEnZonas = () => {
  const totalJugadores = clasificacionDividida.value.length;
  const esImpar = totalJugadores % 2 !== 0;

  const mitad = Math.floor(totalJugadores / 2);
  let zona1Size = esImpar ? mitad + 1 : mitad;
  if (zona1Size % 2 !== 0) zona1Size = zona1Size + 1;

  jugadoresZona1.value = clasificacionDividida.value.slice(0, zona1Size);
  jugadoresZona2.value = clasificacionDividida.value.slice(zona1Size);
};

const isRondaValidada = (numeroRonda: number) => {
  if (!partidasPorRonda.value[numeroRonda]) {
    return false;
  }

  return partidasPorRonda.value[numeroRonda].every(
    (partida) =>
      partida.partidaValidadaUsuario1 === true &&
      partida.partidaValidadaUsuario2 === true
  );
};

const handleInscripcionEliminada = (idInscripcion: number) => {
  if (torneoGestion.value) {
    // Actualiza las inscripciones eliminando la inscripción correspondiente
    torneoGestion.value.inscripciones =
      torneoGestion.value.inscripciones.filter(
        (inscripcion) => inscripcion.idInscripcion !== idInscripcion
      );
  }
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

const abrirModalValidar = (idPartida: number, usuario: 1 | 2) => {
  idPartidaSeleccionada.value = idPartida;
  usuarioSeleccionado.value = usuario;
  isModalValidarVisible.value = true;
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

const cerrarModal = () => {
  isModalPuntosVisible.value = false;
};

const cerrarModalLider = () => {
  isModalLiderVisible.value = false;
};

const cerrarModalEscenario = () => {
  isModalEscenarioVisible.value = false;
};

const cerrarModalValidar = () => {
  isModalValidarVisible.value = false;
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
  max-width: 40%;
  text-align: center;
}

.player-info {
  display: flex;
  align-items: center;
  margin: 0.5em 0;
}

.player-info span {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  height: 80px;
  margin: 0 10px;
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
  border: 1px solid #ccc;
  border-radius: 8px;
}

.underlined-title {
  text-decoration: underline;
  font-weight: bold;
}

.text-green-500 {
  color: green;
}

.text-red-500 {
  color: red;
}

.progress-card {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}

.good-bando {
  background-color: #57a86a; /* Verde claro */
}

.evil-bando {
  background-color: #ce4b56; /* Rojo claro */
}
</style>
