<template>
  <v-container class="text-center">
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading" class="center">
          <LoadingGandalf />
        </div>
        <div v-else class="center">
          <v-card class="mx-auto" max-width="800">
            <v-tabs v-model="pestana" grow center-active fixed-tabs>
              <v-tab :key="0" :text="`Gestión`" :value="0">Gestión</v-tab>
              <!-- Todas las rondas en una pestaña, con pastillas para elegir cada una -->
              <v-tab :value="TAB_RONDAS" text="Rondas"></v-tab>
              <v-tab
                :key="tabClasificacion"
                :text="`Clasificación`"
                :value="tabClasificacion"
              ></v-tab>
            </v-tabs>
            <SelectorRondas
              v-if="enRondas"
              v-model="activeTab"
              :rondas="numeroRondas"
              :partidasPorRonda="partidasPorRonda"
              v-model:jugador="jugadorBuscado"
              :jugadores="jugadores"
            />

            <!-- Contenido de las Tabs -->
            <!-- Las rondas no son pestañas del contenedor: tienen un hueco vacío propio y su contenido va debajo según
                 activeTab. Si el contenedor recibiera el número de ronda, al no encontrarlo activaría otra pestaña -->
            <v-tabs-window v-model="pestana">
              <!-- tab Gestion -->
              <v-tabs-window-item :value="0" :key="0">
                <div>
                  <CardGestionTorneo :torneo="torneoGestion">
                    <!-- Como los demás botones: cada uno en su fila y a lo ancho -->
                    <template #acciones>
                      <v-col cols="12">
                        <!-- Con la ronda 1 ya generada, desactivado: el back tampoco la genera dos veces -->
                        <v-btn
                          variant="tonal"
                          color="primary"
                          block
                          :disabled="partidasPorRonda[1] !== undefined"
                          @click="tablaInscritos?.abrirGenerarRonda1()"
                        >
                          Generar ronda 1
                        </v-btn>
                      </v-col>
                      <v-col cols="12">
                        <v-btn variant="tonal" color="primary" block @click="tablaInscritos?.abrirSorteo()">
                          Sorteo
                        </v-btn>
                      </v-col>
                    </template>
                  </CardGestionTorneo>

                  <TablaInscritos
                    ref="tablaInscritos"
                    :torneo="torneoGestion"
                    @inscripcionEliminada="handleInscripcionEliminada"
                    @puntosExtra="actualizarPuntosExtra"
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
                        <div class="d-flex flex-wrap justify-center ga-2">
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
                          <div class="d-flex flex-wrap justify-center ga-2">
                            <v-btn
                              class="mt-2"
                              variant="tonal"
                              color="primary"
                              @click="generarSiguienteRonda(activeTab + 1)"
                            >
                              Generar siguiente ronda
                            </v-btn>
                            <!-- La última generada también se puede eliminar aunque no sea la última del torneo -->
                            <v-btn
                              v-if="activeTab === ultimaRondaGenerada"
                              class="mt-2"
                              variant="tonal"
                              color="error"
                              @click="abrirEliminarRonda(activeTab)"
                            >
                              Eliminar ronda
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
                    v-if="!wasSave"
                    class="mt-2"
                    variant="tonal"
                    color="primary"
                    @click="resultados(activeTab)"
                  >
                    Guardar resultados
                  </v-btn>
                  <v-btn
                    class="mt-2 ml-2"
                    variant="tonal"
                    color="error"
                    @click="abrirEliminarRonda(activeTab)"
                  >
                    Eliminar ronda
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
                          <div class="d-flex flex-wrap justify-center ga-2">
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
                            <div class="d-flex flex-wrap justify-center ga-2">
                              <v-btn
                                class="mt-2"
                                variant="tonal"
                                color="secondary"
                                @click="agregarPairing(activeTab)"
                              >
                                Añadir partida
                              </v-btn>
                              <v-btn
                                v-if="activeTab === ultimaRondaGenerada"
                                class="mt-2"
                                variant="tonal"
                                color="error"
                                @click="abrirEliminarRonda(activeTab)"
                              >
                                Eliminar ronda
                              </v-btn>
                            </div>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Partidas de la ronda, con la misma tarjeta que la liga y la copa -->
              <div
                v-if="partidasPorRonda[activeTab!]?.length"
                class="pa-2 text-left"
              >
                <CardPartidaGestion
                  v-for="partida in deLaBusqueda(partidasPorRonda[activeTab!])"
                  :key="partida.idPartidaTorneo"
                  :partida="partida"
                  :editable="true"
                  :etiqueta="`Mesa ${mesaDe(partidasPorRonda[activeTab!], partida)}`"
                  @partidaActualizada="actualizarPartida"
                >
                  <div class="d-flex flex-wrap align-center justify-end ga-1 mt-1">
                    <v-btn
                      size="small"
                      variant="text"
                      prepend-icon="mdi-swap-horizontal"
                      @click="modificarPairing(partida)"
                    >
                      Cambiar emparejamiento
                    </v-btn>
                    <!-- Solo el icono: con el texto no caben los dos en móvil -->
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      icon="mdi-delete"
                      aria-label="Eliminar partida"
                      title="Eliminar partida"
                      @click="eliminarPartida(partida)"
                    />
                  </div>
                </CardPartidaGestion>
              </div>

              <!-- Tab clasificacion -->
              <v-tabs-window-item
                :value="tabClasificacion"
                :key="tabClasificacion"
              >
                <!-- División en dos zonas a a partir de la ronda 3 -->
                <div v-if="torneo?.idTorneo === 7">
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
                          <th class="tect-center">General</th>
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
                            {{ jugador.puntosTorneo }}
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
                          <th class="tect-center">General</th>
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
                            {{ jugador.puntosTorneo }}
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
                          <th class="tect-center">General</th>
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
                            {{ jugador.puntosTorneo }}
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
              <!-- Al final: las pestañas sin valor usan su posición y así no se mueven -->
              <v-tabs-window-item :value="TAB_RONDAS" />
            </v-tabs-window>
          </v-card>
        </div>
      </v-col>
    </v-row>


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


    <!-- Modal cambiar pairing -->
    <ModalEditarPairing
      :isVisible="showModificarPairingModal"
      :partida="partidaActual"
      :idTorneo="idTorneoComputed"
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

    <!-- Modal eliminar ronda -->
    <ModalEliminarRondaTorneo
      :isVisible="showEliminarRondaModal"
      :idTorneo="idTorneo"
      :idRonda="idRondaAEliminar"
      @cerrar="closeEliminarRondaModal"
      @confirm="handleEliminarRondaConfirm"
      @error="handleEliminarRondaError"
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
import CardPartidaGestion from "@/components/GestionTorneos/CardPartidaGestion.vue";
import SelectorRondas from "@/components/Commons/SelectorRondas.vue";
import { useRondasEnPestana } from "@/composables/useRondasEnPestana";
import { onMounted, ref, computed } from "vue";
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
  InscripcionTorneoCreadoDTO,
  ResultadoJugador,
  TorneoGestionInfoDTO,
} from "@/interfaces/Torneo";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { Clasificacion, GenerarRonda } from "@/interfaces/Live";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { Torneo } from "@/interfaces/Torneo";
import {
  getPartidasTorneo,
  getTorneo,
  isSaveTournament,
} from "@/services/TorneosService";
import ModalParametrosRondas from "@/components/GestionTorneos/ModalParametrosRondas.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalEditarPairing from "@/components/GestionTorneos/ModalEditarPairing.vue";
import ModalEliminarPartidaTorneo from "@/components/GestionTorneos/ModalEliminarPartidaTorneo.vue";
import ModalEliminarRondaTorneo from "@/components/GestionTorneos/ModalEliminarRondaTorneo.vue";
import { appsettings } from "@/settings/appsettings";
import ModalAgregarPairing from "@/components/GestionTorneos/ModalAgregarPairing.vue";
import { getInscripcionesTorneo } from "@/services/InscripcionesService";
import {
  MatchResultGeneral,
  MatchResultPoint,
  ResultMatchMatchedPlayExtendedIndividualType,
  ResultMatchMatchedPlayType,
} from "@/Constant/TipoClasificacion";
import { calcularPuntosAleman } from "@/utils/sistemaAleman";

const isLoadingImage = ref<boolean>(false);
const torneo = ref<Torneo>();
const partidas = ref<PartidaTorneoDTO[]>([]);
const numeroRondas = ref<number[]>([]);
// Al entrar, la pestaña Gestión: como en la gestión por equipos
const activeTab = ref<number>(0);
const partidasPorRonda = ref<Record<number, PartidaTorneoDTO[]>>({});
// La última ronda con partidas: la que se puede eliminar (ultimaRonda es la última del torneo, aunque no esté generada)
const ultimaRondaGenerada = computed(() =>
  Math.max(0, ...Object.keys(partidasPorRonda.value).map(Number))
);
const tabClasificacion = ref<number>();
// Para pedirle la ronda 1 y el sorteo desde los botones de la tarjeta de gestión
const tablaInscritos = ref<{ abrirGenerarRonda1: () => void; abrirSorteo: () => void }>();
const route = useRoute();
const idTorneo = ref<number>(parseInt(route.params.idTorneo.toString()));
// Hasta tener el torneo no se pinta nada: así las pestañas se montan ya con sus valores
const isLoading = ref<boolean>(true);
const torneoGestion = ref<TorneoGestionInfoDTO>({
  torneo: {
    idTorneo: 0,
    idUsuario: 0,
    nombreTorneo: "",
    numeroPartidas: 0,
    estadoTorneo: "",
    listasPorJugador: 0,
    mostrarListas: false,
    mostrarClasificacion: false,
  },
  inscripciones: [],
});
const clasificacion = ref<Clasificacion[]>([]);
const jugadoresZona1 = ref<Clasificacion[]>([]);
const jugadoresZona2 = ref<Clasificacion[]>([]);
const rondaAGenerar = ref<number>(0);
const showConfigModal = ref<boolean>(false);
const clasificacionDividida = ref<Clasificacion[]>([]);
const clasificacionZona1 = ref<Clasificacion[]>([]);
const clasificacionZona2 = ref<Clasificacion[]>([]);
const ultimaRonda = ref<number>();
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const isGenerating = ref<boolean>(false);
const showModificarPairingModal = ref<boolean>(false);
const showAgregarPairingModal = ref<boolean>(false);
const showEliminarPartidaModal = ref<boolean>(false);
const showEliminarRondaModal = ref<boolean>(false);
const idRondaAEliminar = ref<number>(0);
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
  idEquipo1: null,
  idEquipo2: null,
  nombreEquipo1: null,
  nombreEquipo2: null,
  idCapitan1: null,
  idCapitan2: null,
  listasJugador1: null,
  listasJugador2: null,
  numeroMesa: null,
});
const idRondaSelected = ref<number>(0);
const wasSave = ref<boolean>(false);
const idTorneoComputed = computed(() => idTorneo.value ?? 0);
const inscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);

onMounted(async () => {
  isLoading.value = true;

  try {
    const responseTorneo = await getInfoTorneoCreado(idTorneo.value);
    torneoGestion.value = responseTorneo.data;
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
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
      partidasPorRonda.value = partidas.value.reduce(
        (acc, partida) => {
          const { numeroRonda } = partida;
          if (!acc[numeroRonda]) {
            acc[numeroRonda] = [];
          }
          acc[numeroRonda].push(partida);
          return acc;
        },
        {} as Record<number, PartidaTorneoDTO[]>
      );
    }

    tabClasificacion.value = numeroRondas.value.length + 1;

    try {
      const responseInscripciones = await getInscripcionesTorneo(
        idTorneo.value
      );
      inscripciones.value = responseInscripciones.data;
    } catch (error) {
      console.error(error);
    }

    calcularClasificacion();

    ultimaRonda.value = numeroRondas.value.length;

    const isSave = await isSaveTournament(idTorneo.value);
    wasSave.value = isSave.data;
  } catch (error) {
    console.error("error onMounted", error);
  } finally {
    isLoading.value = false;
  }
});

const resultados = async (ronda: number) => {
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
      isTorneoNarsil: false,
    };

    const guardarResultadosDTO: GuardarResultadosDTO = {
      ganadoresDTO: ganadores,
      generarRondaDTO: partidasUltimasRonda,
    };
    await guardarResultados(guardarResultadosDTO);
    wasSave.value = true;

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



const handleModificarPairingTorneoConfirm = async (
  pairingEditado: PartidaTorneoDTO
) => {
  isGenerating.value = true;
  try {
    const index = partidas.value.findIndex(
      partida => partida.idPartidaTorneo === pairingEditado.idPartidaTorneo
    );
    if (index !== -1) {
      partidas.value[index] = pairingEditado;
    }
    // El cambio puede haber pasado al jugador que sale a otra mesa: se recargan todas
    const responsePartidas = await getPartidasTorneo(idTorneo.value);
    partidas.value = responsePartidas.data;
    partidasPorRonda.value = partidas.value.reduce(
      (acc, partida) => {
        const { numeroRonda } = partida;
        if (!acc[numeroRonda]) {
          acc[numeroRonda] = [];
        }
        acc[numeroRonda].push(partida);
        return acc;
      },
      {} as Record<number, PartidaTorneoDTO[]>
    );
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    closeModificarPairingModal();
  }
};

const handleEliminarPartidaConfirm = (idPartidaEliminada: number) => {
  try {
    partidas.value = partidas.value.filter(
      partida => partida.idPartidaTorneo !== idPartidaEliminada
    );
    partidasPorRonda.value = partidas.value.reduce(
      (acc, partida) => {
        const { numeroRonda } = partida;
        if (!acc[numeroRonda]) {
          acc[numeroRonda] = [];
        }
        acc[numeroRonda].push(partida);
        return acc;
      },
      {} as Record<number, PartidaTorneoDTO[]>
    );
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    closeEliminarPartidaModal();
  }
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

// La tarjeta ya ha guardado el resultado o la validación: aquí solo se refleja. La respuesta puede venir sin nicks
const actualizarPartida = (actualizada: PartidaTorneoDTO) => {
  partidas.value = partidas.value.map(partida =>
    partida.idPartidaTorneo === actualizada.idPartidaTorneo
      ? {
          ...partida,
          ...actualizada,
          nick1: actualizada.nick1 ?? partida.nick1,
          nick2: actualizada.nick2 ?? partida.nick2,
        }
      : partida
  );
  partidasPorRonda.value = partidas.value.reduce(
    (acc, partida) => {
      const { numeroRonda } = partida;
      if (!acc[numeroRonda]) {
        acc[numeroRonda] = [];
      }
      acc[numeroRonda].push(partida);
      return acc;
    },
    {} as Record<number, PartidaTorneoDTO[]>
  );
  // El resultado mueve la clasificación
  calcularClasificacion();
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

const abrirEliminarRonda = (idRonda: number) => {
  idRondaAEliminar.value = idRonda;
  showEliminarRondaModal.value = true;
};

const closeEliminarRondaModal = () => {
  showEliminarRondaModal.value = false;
};

const handleEliminarRondaConfirm = (mensaje: string) => {
  partidas.value = partidas.value.filter(
    p => p.numeroRonda !== idRondaAEliminar.value
  );
  delete partidasPorRonda.value[idRondaAEliminar.value];
  showSuccessModal.value = true;
  console.info(mensaje);
};

const handleEliminarRondaError = (mensaje: string) => {
  showErrorModal.value = true;
  console.error(mensaje);
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
      empates: number;
      derrotas: number;
      puntosTorneo: number;
      idTorneo: number;
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
      empates: number;
      derrotas: number;
      puntosTorneo: number;
      idTorneo: number;
    }
  > = {};

  // Filtramos hasta la ronda 2 para dividir el grupo
  const partidasFiltradas = partidas.value?.filter(
    partida => partida.numeroRonda <= 2
  );

  partidasFiltradas?.forEach(partida => {
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
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
          idTorneo: partida.idTorneo,
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
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
          idTorneo: partida.idTorneo,
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

      // Actualizamos las puntosTorneo
      if (torneo.value?.classificationType === 1) {
        //CLASIFICACION TIPO NORMAL
        if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
          rankingDividido[partida.idUsuario1].puntosTorneo +=
            ResultMatchMatchedPlayType.WIN;
          rankingDividido[partida.idUsuario1].victorias += MatchResultPoint.WIN;
          rankingDividido[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
        } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
          rankingDividido[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayType.WIN;
          rankingDividido[partida.idUsuario2].victorias += MatchResultPoint.WIN;
          rankingDividido[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
        } else {
          rankingDividido[partida.idUsuario1].puntosTorneo +=
            ResultMatchMatchedPlayType.DRAW;
          rankingDividido[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayType.DRAW;
          rankingDividido[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          rankingDividido[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        }
      } else if (torneo.value?.classificationType === 2) {
        //CLASIFICACION TIPO EXTENDED
        const res1 = partida.resultadoUsuario1 ?? 0;
        const res2 = partida.resultadoUsuario2 ?? 0;
        if (res1 === res2) {
          rankingDividido[partida.idUsuario1].puntosTorneo +=
            ResultMatchMatchedPlayExtendedIndividualType.DRAW;
          rankingDividido[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayExtendedIndividualType.DRAW;
          rankingDividido[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          rankingDividido[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        } else {
          if (res1 > res2) {
            if (res1 >= 2 * res2 && res1 >= 6) {
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_WIN;
              rankingDividido[partida.idUsuario1].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario2].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_LOSS;
            } else {
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_WIN;
              rankingDividido[partida.idUsuario1].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario2].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_LOSS;
            }
          }
          if (res2 > res1) {
            if (res2 >= 2 * res1 && res2 >= 6) {
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_WIN;
              rankingDividido[partida.idUsuario2].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario1].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_LOSS;
            } else {
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_WIN;
              rankingDividido[partida.idUsuario2].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario1].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_LOSS;
            }
          }
        }
      } else if (torneo.value?.classificationType === 3) {
        //CLASIFICACION TIPO ALEMAN
        // Sistema alemán: la suma de puntos de ambos jugadores es 20
        const res1 = partida.resultadoUsuario1 ?? 0;
        const res2 = partida.resultadoUsuario2 ?? 0;
        if (res1 > res2) {
          rankingDividido[partida.idUsuario1].victorias += MatchResultPoint.WIN;
          rankingDividido[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
        } else if (res2 > res1) {
          rankingDividido[partida.idUsuario2].victorias += MatchResultPoint.WIN;
          rankingDividido[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
        } else {
          rankingDividido[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          rankingDividido[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        }
        const { jugador1, jugador2 } = calcularPuntosAleman(res1, res2);
        rankingDividido[partida.idUsuario1].puntosTorneo += jugador1;
        rankingDividido[partida.idUsuario2].puntosTorneo += jugador2;
      }

      // Lider muerto primero
      if (liderMuertoUsuario1) {
        rankingDividido[partida.idUsuario1].lider += MatchResultGeneral.DEAD;
      }
      if (liderMuertoUsuario2) {
        rankingDividido[partida.idUsuario2].lider += MatchResultGeneral.DEAD;
      }
    }
  });

  clasificacionDividida.value = Object.values(rankingDividido).sort((a, b) => {
    // 1. Ordenar por puntosTorneo
    if (b.puntosTorneo !== a.puntosTorneo) {
      return b.puntosTorneo - a.puntosTorneo;
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
  partidas.value?.forEach(partida => {
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
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
          idTorneo: partida.idTorneo,
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
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
          idTorneo: partida.idTorneo,
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

      // Actualizamos las puntosTorneo
      if (torneo.value?.classificationType === 1) {
        //CLASIFICACION TIPO NORMAL
        if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
          ranking[partida.idUsuario1].puntosTorneo += 3;
          ranking[partida.idUsuario1].victorias += 1;
          ranking[partida.idUsuario2].derrotas += 1;
        } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
          ranking[partida.idUsuario2].puntosTorneo += 3;
          ranking[partida.idUsuario2].victorias += 1;
          ranking[partida.idUsuario1].derrotas += 1;
        } else {
          ranking[partida.idUsuario1].puntosTorneo += 1;
          ranking[partida.idUsuario2].puntosTorneo += 1;
          ranking[partida.idUsuario1].empates += 1;
          ranking[partida.idUsuario2].empates += 1;
        }
      } else if (torneo.value?.classificationType === 2) {
        //CLASIFICACION TIPO EXTENDED
        const res1 = partida.resultadoUsuario1 ?? 0;
        const res2 = partida.resultadoUsuario2 ?? 0;
        if (res1 === res2) {
          ranking[partida.idUsuario1].puntosTorneo +=
            ResultMatchMatchedPlayExtendedIndividualType.DRAW;
          ranking[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayExtendedIndividualType.DRAW;
          ranking[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          ranking[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        } else {
          if (res1 > res2) {
            if (res1 >= 2 * res2 && res1 >= 6) {
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_WIN;
              ranking[partida.idUsuario1].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_LOSS;
            } else {
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_WIN;
              ranking[partida.idUsuario1].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_LOSS;
            }
          }
          if (res2 > res1) {
            if (res2 >= 2 * res1 && res2 >= 6) {
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_WIN;
              ranking[partida.idUsuario2].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MAJOR_LOSS;
            } else {
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_WIN;
              ranking[partida.idUsuario2].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedIndividualType.MINOR_LOSS;
            }
          }
        }
      } else if (torneo.value?.classificationType === 3) {
        //CLASIFICACION TIPO ALEMAN
        // Sistema alemán: la suma de puntos de ambos jugadores es 20
        const res1 = partida.resultadoUsuario1 ?? 0;
        const res2 = partida.resultadoUsuario2 ?? 0;
        if (res1 > res2) {
          ranking[partida.idUsuario1].victorias += MatchResultPoint.WIN;
          ranking[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
        } else if (res2 > res1) {
          ranking[partida.idUsuario2].victorias += MatchResultPoint.WIN;
          ranking[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
        } else {
          ranking[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          ranking[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        }
        const { jugador1, jugador2 } = calcularPuntosAleman(res1, res2);
        ranking[partida.idUsuario1].puntosTorneo += jugador1;
        ranking[partida.idUsuario2].puntosTorneo += jugador2;
      }

      // Lider muerto primero
      if (liderMuertoUsuario1) {
        ranking[partida.idUsuario1].lider += 1;
      }
      if (liderMuertoUsuario2) {
        ranking[partida.idUsuario2].lider += 1;
      }
    }
  });

  inscripciones.value.forEach(inscripcion => {
    const userId = inscripcion.idUsuario;
    if (ranking[userId]) {
      ranking[userId].puntosTorneo += inscripcion.puntosExtra;
    }
  });

  clasificacion.value = Object.values(ranking).sort((a, b) => {
    // 1. Ordenar por puntosTorneo
    if (b.puntosTorneo !== a.puntosTorneo) {
      return b.puntosTorneo - a.puntosTorneo;
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
  clasificacionZona1.value = clasificacion.value.filter(jugador =>
    jugadoresZona1.value.some(z => z.idUsuario === jugador.idUsuario)
  );

  clasificacionZona2.value = clasificacion.value.filter(jugador =>
    jugadoresZona2.value.some(z => z.idUsuario === jugador.idUsuario)
  );

  type JugadorConEjercito = {
    nick: string;
    ejercito: string | null;
  };

  const jugadoresConEjercitos = partidas.value.reduce<JugadorConEjercito[]>(
    (acc, partida) => {
      // Solo las que tienen ejército: en la primera ronda puede faltar si aún no había entregado la lista
      if (partida.ejercitoUsuario1)
        acc.push({ nick: partida.nick1, ejercito: partida.ejercitoUsuario1 });
      if (partida.ejercitoUsuario2)
        acc.push({ nick: partida.nick2, ejercito: partida.ejercitoUsuario2 });
      return acc;
    },
    []
  );

  const listaEjercitos = appsettings.armies;

  const ejercitosJugadoresConBando = jugadoresConEjercitos.map(jugador => {
    const ejercito = listaEjercitos.find(e => e.name === jugador.ejercito);
    return {
      nick: jugador.nick,
      ejercito: jugador.ejercito,
      bando: ejercito ? ejercito.band : "desconocido",
    };
  });

  clasificacion.value = clasificacion.value.map(j => {
    const bando = ejercitosJugadoresConBando.find(
      e => e.nick === j.nick
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
    partida =>
      partida.partidaValidadaUsuario1 === true &&
      partida.partidaValidadaUsuario2 === true
  );
};

// Los puntos extra que cambia el organizador mueven la clasificación al momento, sin recargar
const actualizarPuntosExtra = (idUsuario: number, puntosExtra: number) => {
  const inscripcion = inscripciones.value.find(i => i.idUsuario === idUsuario);
  if (inscripcion) inscripcion.puntosExtra = puntosExtra;
  calcularClasificacion();
};

const handleInscripcionEliminada = (idInscripcion: number) => {
  if (torneoGestion.value) {
    // Actualiza las inscripciones eliminando la inscripción correspondiente
    torneoGestion.value.inscripciones =
      torneoGestion.value.inscripciones.filter(
        inscripcion => inscripcion.idInscripcion !== idInscripcion
      );
  }
};













// Las rondas en una sola pestaña: activeTab sigue siendo el número de ronda
const {
  pestana,
  enRondas,
  TAB_RONDAS,
  jugadorBuscado,
  jugadores,
  deLaBusqueda,
  mesaDe,
} = useRondasEnPestana(
  activeTab,
  numeroRondas,
  partidasPorRonda
);
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
