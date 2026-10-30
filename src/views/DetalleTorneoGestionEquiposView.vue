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
              <!-- En Parejas el ranking individual solo tendría a los capitanes -->
              <v-tab
                v-if="torneo?.tipoTorneo !== 'Parejas'"
                :key="tabClasificacionIndividual"
                text="Individual"
                :value="tabClasificacionIndividual"
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
            <v-window v-model="pestana">
              <!-- tab Gestion -->
              <v-window-item :value="0" :key="0">
                <div>
                  <CardGestionInfoTorneoEquipo :torneo="torneoGestion">
                    <!-- Como los demás botones: cada uno en su fila y a lo ancho -->
                    <template #acciones>
                      <v-col cols="12">
                        <v-btn
                          variant="tonal"
                          color="primary"
                          block
                          :disabled="estaRondaUnoGenerada"
                          @click="accionesEquipo?.abrirGenerarRonda1()"
                        >
                          Generar ronda 1
                        </v-btn>
                      </v-col>
                      <v-col cols="12">
                        <v-btn variant="tonal" color="primary" block @click="accionesEquipo?.abrirSorteo()">
                          Sorteo
                        </v-btn>
                      </v-col>
                    </template>
                  </CardGestionInfoTorneoEquipo>
                  <CardGestionAccionesTorneoEquipo
                    ref="accionesEquipo"
                    :torneo="torneoGestion"
                    :rondaGenerada="estaRondaUnoGenerada"
                  />

                  <!--Buscador de equipos-->
                  <v-text-field
                    v-model="busquedaEquipo"
                    label="Buscar equipo por nombre"
                    prepend-inner-icon="mdi-magnify"
                    class="ma-4"
                    hide-details
                  />

                  <div class="grid-container">
                    <CardInfoEquipo
                      v-for="equipo in equiposFiltrados"
                      :key="equipo.idEquipo"
                      :equipo="equipo"
                      :torneo="torneo!"
                      @delete-team="handleEquipoEliminado(equipo.idEquipo)"
                      @puntos-extra="actualizarPuntosExtra"
                    />
                  </div>
                </div>
              </v-window-item>

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
                            v-if="!esParejas"
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
                    !partidasPorRonda[activeTab] && enRondas
                  "
                >
                  Esperando ronda...
                  <div>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          <div class="flex-column align-items-center">
                            <v-btn
                              v-if="!esParejas"
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
                                v-if="!esParejas"
                                class="mt-2"
                                variant="tonal"
                                color="secondary"
                                @click="agregarPairing(activeTab)"
                              >
                                Añadir partida
                              </v-btn>
                              <v-btn
                                v-if="activeTab === ultimaRonda"
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

              <CardEmparejamientosGestion
                v-if="enRondas && torneo?.tipoTorneo !== 'Individual'"
                :partidas="partidas"
                :soloEquipos="equiposDelBuscado"
                :numeroRonda="activeTab"
                :idTorneo="parseInt(route.params.idTorneo.toString())"
              />

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
                  :listaPorPareja="torneo?.listaPorPareja"
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
              <TabClasificacionEquipos
                :tabClasificacion="tabClasificacion"
                :activeTab="activeTab"
                :torneo="torneo"
                :partidas="partidas"
                :equipos="torneoGestion?.equipos"
                @enviarClasificacion="manejarClasificacion"
              />

              <!-- Tab clasificacion individual: la misma que ven los jugadores, aunque esté oculta para ellos -->
              <TabClasificacionEquiposIndividual
                :tabClasificacion="tabClasificacionIndividual"
                :activeTab="activeTab"
                :clasificacion="clasificacion"
                :mostrarClasificacion="true"
              />
              <!-- Al final: las pestañas sin valor usan su posición y así no se mueven -->
              <v-window-item :value="TAB_RONDAS" />
            </v-window>
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
    <ModalParametrosRondasEquipo
      :isVisible="showConfigModal"
      :torneo="torneoGestion"
      :clasificacion="clasificacionEquipos"
      :ronda="rondaAGenerar"
      :partidas="partidas"
      @close="closeConfigModal"
      @confirm="handleConfigConfirm"
    />


    <!-- Modal cambiar pairing entre equipos -->
    <ModalCambiarPairingEquipoGestion
      :isVisible="showModificarPairingModal"
      :idEquipo1="partidaActual.idEquipo1!"
      :idEquipo2="partidaActual.idEquipo2!"
      :nombreEquipo1="partidaActual.nombreEquipo1!"
      :nombreEquipo2="partidaActual.nombreEquipo2!"
      :partida="partidaActual"
      @actualizar="actualizarPairing"
      @cerrar="showModificarPairingModal = false"
    />

    <!-- Modal cambiar pairing -->
    <ModalAgregarPairing
      :isVisible="showAgregarPairingModal"
      :idTorneo="idTorneo!"
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
      v-if="idTorneo"
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

    <!-- Modal error -->
    <ModalError
      :isVisible="showErrorCambiarPairingModal"
      message="Ha ocurrido un error al cambiar el emparejamiento. Inténtalo de nuevo o contacta al administrador del torneo."
      @update:isVisible="showErrorCambiarPairingModal = $event"
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
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import {
  getInfoTorneoEquipoCreado,
  guardarResultados,
} from "@/services/TorneosService";
import {
  ClasificacionEquipo,
  GuardarResultadosDTO,
  InscripcionTorneoCreadoDTO,
  ResultadoJugador,
} from "@/interfaces/Torneo";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { Clasificacion, GenerarRonda, RequestUpdatePairingTorneoDTO } from "@/interfaces/Live";
import {
  ActualizarPairingEquiposDTO,
  PartidaTorneoDTO,
} from "@/interfaces/Partidas";
import { Torneo } from "@/interfaces/Torneo";
import { updatePairingTorneoAsync } from "@/services/PartidaTorneoService";
import {
  getPartidasTorneo,
  getTorneo,
  isSaveTournament,
} from "@/services/TorneosService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalEliminarPartidaTorneo from "@/components/GestionTorneos/ModalEliminarPartidaTorneo.vue";
import ModalEliminarRondaTorneo from "@/components/GestionTorneos/ModalEliminarRondaTorneo.vue";
import { appsettings } from "@/settings/appsettings";
import ModalAgregarPairing from "@/components/GestionTorneos/ModalAgregarPairing.vue";
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";
import ModalParametrosRondasEquipo from "@/components/GestionTorneos/Equipos/ModalParametrosRondasEquipo.vue";
import CardGestionInfoTorneoEquipo from "@/components/GestionTorneos/Equipos/CardGestionInfoTorneoEquipo.vue";
import CardGestionAccionesTorneoEquipo from "@/components/GestionTorneos/Equipos/CardGestionAccionesTorneoEquipo.vue";
import CardInfoEquipo from "@/components/GestionTorneos/Equipos/CardInfoEquipo.vue";
import TabClasificacionEquipos from "@/components/GestionTorneos/Equipos/TabClasificacionEquipos.vue";
import TabClasificacionEquiposIndividual from "@/components/GestionTorneos/Equipos/TabClasificacionEquiposIndividual.vue";
import ModalCambiarPairingEquipoGestion from "@/components/PartidasTorneo/ModalCambiarPairingEquipoGestion.vue";
import CardEmparejamientosGestion from "@/components/GestionTorneos/Equipos/CardEmparejamientosGestion.vue";
import { getInscripcionesTorneo } from "@/services/InscripcionesService";
import {
  MatchResultGeneral,
  MatchResultPoint,
  ResultMatchMatchedPlayExtendedTeamType,
  ResultMatchMatchedPlayType,
} from "@/Constant/TipoClasificacion";
import { calcularPuntosAleman } from "@/utils/sistemaAleman";

const isLoadingImage = ref<boolean>(false);
const torneo = ref<Torneo>();
const partidas = ref<PartidaTorneoDTO[]>([]);
const numeroRondas = ref<number[]>([]);
const activeTab = ref<number>(0);
const partidasPorRonda = ref<Record<number, PartidaTorneoDTO[]>>({});
const showErrorCambiarPairingModal = ref<boolean>(false);
const tabClasificacion = ref<number>();
const tabClasificacionIndividual = ref<number>();
const route = useRoute();
const idTorneo = ref<number>();
// Hasta tener el torneo no se pinta nada: así las pestañas se montan ya con sus valores
const isLoading = ref<boolean>(true);
const torneoGestion = ref<TorneoEquipoGestionInfoDTO | null>(null);
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
const showModificarPairingModal = ref<boolean>(false);
const showAgregarPairingModal = ref<boolean>(false);
const showEliminarPartidaModal = ref<boolean>(false);
const showEliminarRondaModal = ref<boolean>(false);
const idRondaAEliminar = ref<number>(0);
const estaRondaUnoGenerada = ref<boolean>(false);
// Generar la ronda 1 y el sorteo están en la tarjeta de gestión; sus modales, en las acciones de los equipos
const accionesEquipo = ref<{ abrirGenerarRonda1: () => void; abrirSorteo: () => void }>();
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
const clasificacionEquipos = ref<ClasificacionEquipo[]>([]);
const inscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);
const esParejas = computed(() => torneo.value?.tipoTorneo === "Parejas");

//Variables para el buscador
const busquedaEquipo = ref<string>("");
const equiposFiltrados = computed(() => {
  if (!torneoGestion.value) return [];
  return torneoGestion.value.equipos.filter(equipo =>
    (equipo.nombreEquipo?.toLowerCase() || "").includes(
      busquedaEquipo.value.toLowerCase()
    )
  );
});

function manejarClasificacion(clasificacion: ClasificacionEquipo[]) {
  clasificacionEquipos.value = clasificacion;
}

onMounted(async () => {
  idTorneo.value = parseInt(route.params.idTorneo.toString());

  isLoading.value = true;

  try {
    const responseTorneo = await getInfoTorneoEquipoCreado(idTorneo.value);
    torneoGestion.value = responseTorneo.data;
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
  }

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneo.value = responseTorneo.data;

    const responsePartidas = await getPartidasTorneo(idTorneo.value);
    partidas.value = responsePartidas.data;

    if (torneoGestion.value) {
      numeroRondas.value = Array.from(
        { length: torneoGestion.value.torneo.numeroPartidas },
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

    if (partidas.value.length > 0) estaRondaUnoGenerada.value = true;

    tabClasificacion.value = numeroRondas.value.length + 1;
    tabClasificacionIndividual.value = numeroRondas.value.length + 2;

    try {
      const responseInscripciones = await getInscripcionesTorneo(
        idTorneo.value
      );
      inscripciones.value = responseInscripciones.data;
    } catch (error) {
      console.error(error);
    }

    calcularClasificacion();

    let ganador: number | null = null;
    ultimaRonda.value = numeroRondas.value.length;
    if (clasificacionZona1.value && clasificacionZona1.value.length > 0) {
      ganador = clasificacionZona1.value[0].idUsuario;
    }
    hasGanador.value = ganador !== null;

    ultimaRonda.value = numeroRondas.value.length;
    if (clasificacionZona1.value[0] != undefined) {
      ganador = clasificacionZona1.value[0].idUsuario;
    }
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
  try {
    isGenerating.value = true;
    // En Parejas va una fila por pareja con su capitán: el back pone al compañero en la misma posición
    const ganadores: ResultadoJugador[] = esParejas.value
      ? clasificacionEquipos.value
          .map((clasi, index) => {
            return {
              idUsuario:
                torneoGestion.value?.equipos.find(
                  e => e.idEquipo === clasi.idEquipo
                )?.idCapitan ?? 0,
              idTorneo: torneo.value?.idTorneo,
              resultado: index + 1,
            };
          })
          .filter(ganador => ganador.idUsuario !== 0)
      : clasificacion.value.map((clasi, index) => {
          return {
            idUsuario: clasi.idUsuario,
            idTorneo: torneo.value?.idTorneo,
            resultado: index + 1,
          };
        });
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
};

const handleConfigConfirm = () => {
  closeConfigModal();
};


// Los puntos extra que cambia el organizador mueven la clasificación al momento, sin recargar
const actualizarPuntosExtra = (idUsuario: number, puntosExtra: number) => {
  const inscripcion = inscripciones.value.find(i => i.idUsuario === idUsuario);
  if (inscripcion) inscripcion.puntosExtra = puntosExtra;
  calcularClasificacion();
};

const handleEquipoEliminado = (idEquipo: number) => {
  if (torneoGestion.value) {
    torneoGestion.value.equipos = torneoGestion.value.equipos.filter(
      e => e.idEquipo !== idEquipo
    );
  }
};



const closeAgregarPairingModal = () => {
  showAgregarPairingModal.value = false;
};

const closeEliminarPartidaModal = () => {
  showEliminarPartidaModal.value = false;
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
      idTorneo: number;
      empates: number;
      derrotas: number;
      puntosTorneo: number;
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
      idTorneo: number;
      empates: number;
      derrotas: number;
      puntosTorneo: number;
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
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
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
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
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
            ResultMatchMatchedPlayExtendedTeamType.DRAW;
          rankingDividido[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayExtendedTeamType.DRAW;
          rankingDividido[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          rankingDividido[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        } else {
          if (res1 > res2) {
            if (res1 >= 2 * res2 && res1 >= 6) {
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_WIN;
              rankingDividido[partida.idUsuario1].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario2].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_LOSS;
            } else {
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_WIN;
              rankingDividido[partida.idUsuario1].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario2].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_LOSS;
            }
          }
          if (res2 > res1) {
            if (res2 >= 2 * res1 && res2 >= 6) {
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_WIN;
              rankingDividido[partida.idUsuario2].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario1].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_LOSS;
            } else {
              rankingDividido[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_WIN;
              rankingDividido[partida.idUsuario2].victorias +=
                MatchResultPoint.WIN;
              rankingDividido[partida.idUsuario1].derrotas +=
                MatchResultPoint.LOSS;
              rankingDividido[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_LOSS;
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
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
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
          idTorneo: partida.idTorneo,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
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
          ranking[partida.idUsuario1].puntosTorneo +=
            ResultMatchMatchedPlayType.WIN;
          ranking[partida.idUsuario1].victorias += MatchResultPoint.WIN;
          ranking[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
        } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
          ranking[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayType.WIN;
          ranking[partida.idUsuario2].victorias += MatchResultPoint.WIN;
          ranking[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
        } else {
          ranking[partida.idUsuario1].puntosTorneo +=
            ResultMatchMatchedPlayType.DRAW;
          ranking[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayType.DRAW;
          ranking[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          ranking[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        }
      } else if (torneo.value?.classificationType === 2) {
        //CLASIFICACION TIPO EXTENDED
        const res1 = partida.resultadoUsuario1 ?? 0;
        const res2 = partida.resultadoUsuario2 ?? 0;
        if (res1 === res2) {
          ranking[partida.idUsuario1].puntosTorneo +=
            ResultMatchMatchedPlayExtendedTeamType.DRAW;
          ranking[partida.idUsuario2].puntosTorneo +=
            ResultMatchMatchedPlayExtendedTeamType.DRAW;
          ranking[partida.idUsuario1].empates += MatchResultPoint.DRAW;
          ranking[partida.idUsuario2].empates += MatchResultPoint.DRAW;
        } else {
          if (res1 > res2) {
            if (res1 >= 2 * res2 && res1 >= 6) {
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_WIN;
              ranking[partida.idUsuario1].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_LOSS;
            } else {
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_WIN;
              ranking[partida.idUsuario1].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario2].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_LOSS;
            }
          }
          if (res2 > res1) {
            if (res2 >= 2 * res1 && res2 >= 6) {
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_WIN;
              ranking[partida.idUsuario2].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MAJOR_LOSS;
            } else {
              ranking[partida.idUsuario2].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_WIN;
              ranking[partida.idUsuario2].victorias += MatchResultPoint.WIN;
              ranking[partida.idUsuario1].derrotas += MatchResultPoint.LOSS;
              ranking[partida.idUsuario1].puntosTorneo +=
                ResultMatchMatchedPlayExtendedTeamType.MINOR_LOSS;
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
        ranking[partida.idUsuario1].lider += MatchResultGeneral.DEAD;
      }
      if (liderMuertoUsuario2) {
        ranking[partida.idUsuario2].lider += MatchResultGeneral.DEAD;
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
      shortName: ejercito?.shortName,
    };
  });

  clasificacion.value = clasificacion.value.map(j => {
    const datosEjercito = ejercitosJugadoresConBando.find(
      e => e.nick === j.nick
    );
    return {
      ...j,
      bando: datosEjercito?.bando ?? "desconocido",
      nombreCortoEjercito: datosEjercito?.shortName ?? undefined,
      ejercito: datosEjercito?.ejercito ?? undefined,
    };
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













const sendUpdateBack = async (idJugador1: number, idJugador2: number) => {
  try {
    const body: RequestUpdatePairingTorneoDTO = {
      idPartidaTorneo: partidaActual.value.idPartidaTorneo,
      idUsuario1: idJugador1,
      idUsuario2: idJugador2,
    };
    const response = await updatePairingTorneoAsync(body);
    const index = partidas.value.findIndex(
      partida => partida.idPartidaTorneo === response.idPartidaTorneo
    );
    if (index !== -1) {
      partidas.value[index] = response;
    }
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
    showSuccessModal.value = true;
    return true;
  } catch (error) {
    console.error(error);
    showErrorCambiarPairingModal.value = true;
    return false;
  }
};

const actualizarPairing = async (payload: ActualizarPairingEquiposDTO) => {
  isGenerating.value = true;
  const isUpdate: boolean = await sendUpdateBack(
    payload.idJugador1,
    payload.idJugador2
  );

  if (isUpdate) {
    partidaActual.value.idUsuario1 = payload.idJugador1;
    partidaActual.value.idUsuario2 = payload.idJugador2;
    partidaActual.value.ejercitoUsuario1 = payload.ejercitoEquipo1;
    partidaActual.value.ejercitoUsuario2 = payload.ejercitoEquipo2;
    partidaActual.value.nick1 = payload.nick1;
    partidaActual.value.nick2 = payload.nick2;
  }
  showModificarPairingModal.value = false;
  isGenerating.value = false;
};

// Las rondas en una sola pestaña: activeTab sigue siendo el número de ronda
const {
  pestana,
  enRondas,
  TAB_RONDAS,
  jugadorBuscado,
  jugadores,
  deLaBusqueda,
  equiposDelBuscado,
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

/* Con nicks largos el botón de lista ocupa varias líneas en vez de salirse de la tarjeta */
.player-info .btn-lista {
  max-width: 100%;
  height: auto;
  min-height: 28px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.player-info .btn-lista :deep(.v-btn__content) {
  white-space: normal;
  overflow-wrap: anywhere;
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
