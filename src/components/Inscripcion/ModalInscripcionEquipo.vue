<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else>
    <v-container v-model="show" class="d-flex justify-center align-center">
      <v-card elevation="8" class="rounded-modal pa-3 scrollable-modal">
        <v-card-title
          class="modal-title d-flex align-center justify-space-between px-4 py-3"
        >
          <h3 class="text-h5 font-weight-bold">Detalle del equipo</h3>
          <v-btn icon @click="close" class="close-button">
            <v-icon color="grey darken-1">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Información del equipo simplificada y adaptada a móvil -->
        <v-card class="info-card pa-4 mt-4 mx-3">
          <v-row>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
              <v-icon color="blue" class="mr-2">mdi-shield-account</v-icon>
              <span class="font-weight-bold">Equipo:</span>
              <span class="ml-2">{{ inscripcionData?.nombreEquipo }}</span>
            </v-col>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
              <v-icon color="amber" class="mr-2">mdi-crown</v-icon>
              <span class="font-weight-bold">Capitán:</span>
              <span class="ml-2">{{
                inscripcionData?.componentesEquipoDTO.find(
                  (c) => c.idUsuario === inscripcionData?.idCapitan
                )?.nick || "Desconocido"
              }}</span>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
              <v-icon color="green" class="mr-2">mdi-calendar</v-icon>
              <span class="font-weight-bold">Fecha:</span>
              <span class="ml-2">{{
                convertirFecha(inscripcionData?.fechaInscripcion!)
              }}</span>
            </v-col>
            <v-col cols="12" sm="6" class="align-center pt-1 pb-1">
              <v-chip
                class="mt-1"
                :color="inscripcionData?.esPago === 'SI' ? 'green' : 'red'"
                variant="tonal"
                x-small
              >
                <v-icon size="16" class="me-1">mdi-cash</v-icon>
                Pago: {{ inscripcionData?.esPago }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card>

        <v-divider class="my-4"></v-divider>

        <h4 class="text-h6 font-weight-bold text-center">
          Miembros del equipo
        </h4>
        <v-card-text>
          <v-row>
            <!--MOBILE-->
            <v-col v-if="$vuetify.display.xs" cols="12">
              <v-table dense>
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Lista</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(miembro, index) in equipoConHuecos"
                    :key="miembro?.idUsuario || 'hueco-' + index"
                  >
                    <!--ES MIEMBRO-->
                    <template v-if="miembro">
                      <td>
                        <v-icon
                          v-if="miembro.idUsuario === inscripcionData?.idCapitan"
                          color="amber darken-2"
                          >mdi-crown</v-icon
                        >
                        {{ miembro.nick }}
                      </td>
                      <td>
                        <span v-if="miembro.listaData">
                          <v-icon
                            v-if="miembro.estadoLista === 'OK'"
                            color="green"
                            >mdi-check</v-icon
                          ><!--LISTA OK-->
                          <v-icon
                            v-else-if="miembro.estadoLista === 'ENTREGADA'"
                            color="blue"
                            >mdi-send</v-icon
                          ><!--LISTA ENTREGA-->
                          <v-icon v-else color="red">mdi-close-circle</v-icon
                          ><!--LISTA ILEGAL-->
                        </span>
                        <span v-else><v-icon color="red">mdi-email-off</v-icon></span><!--LISTA NO ENTREGADA-->
                      </td>
                      <td>
                        <v-menu offset-y>
                          <template v-slot:activator="{ props }">
                            <v-btn color="primary" variant="tonal" v-bind="props">
                              <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                          </template>
                          <v-list>
                            <v-list-item
                              v-if="miembro.listaData"
                              @click.stop="
                                verLista(
                                  miembro.listaData,
                                  miembro.nick,
                                  miembro.ejercito!
                                )
                              "
                            >
                              <v-list-item-title>
                                <v-icon class="me-2">mdi-eye</v-icon> Ver Lista
                              </v-list-item-title>
                            </v-list-item>
                            <!--TODO  v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"-->
                            <v-list-item
                              v-if="inscripcionData?.idCapitan == idUsuario"
                              @click.stop="enviarCambiarLista(miembro.idInscripcion,miembro.listaData!,miembro.idUsuario,miembro.nick,miembro.idLista)"
                            >
                              <v-list-item-title>
                                <v-icon class="me-2">mdi-pencil</v-icon>
                                <span v-if="miembro.listaData">Modificar lista</span>
                                <span v-else>Enviar lista</span>
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item
                              v-if="inscripcionData?.idCapitan == idUsuario"
                              @click.stop="eliminarMiembro(miembro.idInscripcion)"
                            >
                              <v-list-item-title>
                                <v-icon color="red" class="me-2"
                                  >mdi-account-remove</v-icon
                                >
                                Eliminar del equipo
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </td>
                    </template>
                    <!--Slot vacios-->
                    <template v-else>
                      <td colspan="3">
                        <v-btn variant="tonal" v-if="inscripcionData?.idCapitan == idUsuario" color="primary" @click="handlerModalRegistrarMiembroEquipo()" class="elevated-btn" block>
                          <v-icon class="mr-1">mdi-menu</v-icon> Añadir jugador
                        </v-btn>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
            <!--PC-->
            <v-col
              v-else
              v-for="(miembro, index) in equipoConHuecos"
              :key="miembro?.idUsuario || 'hueco-' + index"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card class="pa-3 player-card" elevation="20">
                <!--Jugadores-->
                <template v-if="miembro">
                  <v-card-title class="text-body-1 font-weight-bold d-flex align-center">
                    <v-icon
                      v-if="miembro.idUsuario === inscripcionData?.idCapitan"
                      color="amber darken-2"
                      >mdi-crown</v-icon
                    >
                    {{ miembro.nick }}
                  </v-card-title>

                  <v-divider></v-divider>

                  <v-card-text>
                    <p v-if="miembro.ejercito">{{ miembro.ejercito }}</p>
                    <p v-else>Estado de la lista:</p>
                    <v-chip
                      :color="
                        miembro.estadoLista === 'OK'
                          ? 'green'
                          : miembro.estadoLista === 'ENTREGADA'
                          ? 'blue'
                          : 'red'
                      "
                      variant="tonal"
                    >
                      {{ miembro.estadoLista }}
                    </v-chip>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions class="justify-center">
                    <v-menu offset-y>
                      <template v-slot:activator="{ props }">
                        <v-btn color="primary" variant="tonal" v-bind="props">
                          <v-icon>mdi-menu</v-icon> Acciones
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          v-if="miembro.listaData"
                          @click.stop="
                            verLista(
                              miembro.listaData,
                              miembro.nick,
                              miembro.ejercito!
                            )
                          "
                        >
                          <v-list-item-title>
                            <v-icon class="me-2">mdi-eye</v-icon> Ver Lista
                          </v-list-item-title>
                        </v-list-item>
                        <!--TODO  v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"-->
                        <v-list-item
                          v-if="inscripcionData?.idCapitan == idUsuario"
                          @click.stop="
                            enviarCambiarLista(
                              miembro.idInscripcion,
                              miembro.listaData!,
                              miembro.idUsuario,
                              miembro.nick,
                              miembro.idLista
                            )
                          "
                        >
                          <v-list-item-title>
                            <v-icon class="me-2">mdi-pencil</v-icon>
                            <span v-if="miembro.listaData">Modificar lista</span>
                            <span v-else>Enviar lista</span>
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="inscripcionData?.idCapitan == idUsuario" @click.stop="eliminarMiembro(miembro.idInscripcion)">
                          <v-list-item-title>
                            <v-icon color="red" class="me-2"
                              >mdi-account-remove</v-icon
                            >
                            Eliminar del equipo
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-card-actions>
                </template>

                <!--Slot vacios-->
                <template v-else>
                  <v-card-title class="text-body-1 font-weight-bold d-flex align-center text-grey">
                    <v-icon class="mr-1" color="yellow">mdi-account-outline</v-icon>
                    Slot vacío
                  </v-card-title>

                  <v-divider></v-divider>

                  <v-card-text>
                    <v-chip color="yellow" variant="tonal"> Pendiente </v-chip>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions class="justify-center" v-if="inscripcionData?.idCapitan == idUsuario">
                    <v-btn variant="tonal" color="primary" @click="handlerModalRegistrarMiembroEquipo()" class="elevated-btn" block>
                      <v-icon class="mr-1">mdi-menu</v-icon> Añadir jugador
                    </v-btn>
                  </v-card-actions>
                </template>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider
          class="my-4"
          v-if="inscripcionData?.idCapitan == idUsuario"
        ></v-divider>

        <v-card-actions>
          <v-row>
            <!--<v-col>
              <div
                class="text-center"
                v-if="inscripcionData?.idCapitan == idUsuario"
              >
                <v-btn
                  color="primary"
                  variant="tonal"
                  @click="handlerModalRegistrarMiembroEquipo()"
                  class="elevated-btn"
                  block
                >
                  Añadir miembro
                </v-btn>
              </div>
            </v-col>-->
            <v-col>
              <div
                class="text-center"
                v-if="inscripcionData?.idCapitan == idUsuario"
              >
                <v-btn
                  color="red-darken-3"
                  variant="tonal"
                  @click="eliminarInscripcion(inscripcionData?.idEquipo!)"
                  class="elevated-btn"
                  block
                >
                  Dar de baja al equipo
                </v-btn>
              </div>
            </v-col>
            <v-col v-if="$vuetify.display.xs">
              <v-btn block @click="close" variant="tonal"> Cerrar </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>

  <!-- Modal response eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModalEliminar"
    message="Inscripción eliminada."
    @update:isVisible="showSuccessModalEliminar = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido actualizar la inscripción. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Modal ver lista -->
  <ModalVerLista
    v-model:isVisible="showVerListaModal"
    :listaJugador="listaJugador!"
  />

  <!-- Modal envair cambiar lista -->
  <ModalEnviarLista
    v-model:isVisible="showEnviarCambiarListaModal"
    :idInscripcion="currentInscripcionId!"
    :idUsuario="currentUsuarioId!"
    :idTorneo="currentTorneoId!"
    :emailOrganizador="currentEmailOrganziador!"
    :nick="currentNick!"
    :hasLista="hasLista"
    @enviarLista="handleEnviarLista"
    @modificarLista="handleModificarLista"
  />

  <!-- Modales de respuesta a la subida de la lista -->
  <ModalSuccess
    :isVisible="showSuccessModalLista"
    message="Lista enviada con éxito."
    @update:isVisible="showSuccessModalLista = $event"
  />

  <ModalError
    :isVisible="showErrorModalLista"
    message="No se ha podido enviar la lista. Contacta con el administrador."
    @update:isVisible="showErrorModalLista = $event"
  />

  <!-- Modales de respuesta a la eliminarcion de un miembro del equipo -->
  <ModalSuccess
    :isVisible="showSuccessModalEliminarMiembroEquipo"
    message="Miembro eliminado con éxito."
    @update:isVisible="showSuccessModalLista = $event"
  />

  <ModalError
    :isVisible="showErrorModalEliminarMiembroEquipo"
    message="No se ha podido eliminar al miembro del equipo. Inténtelo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModalLista = $event"
  />

  <ModalAddMiembroEquipo
    :isVisible="showModalRegistrarMiembroEquipo"
    :idEquipo="inscripcionData.idEquipo"
    :idTorneo="idTorneo!"
    :jugadores="jugadoresSinEquipo"
    @close="closeModal"
    @confirm="closeConfigModal"
  />
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, onMounted, watch, computed } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";
import { ComponentesEquipoDTO, InscripcionEquipoDTO } from "@/interfaces/Inscripcion";
import {
  eliminarMiembroEquipoAsync,
  getInscripcionEquipo,
} from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import ModalVerLista from "./ModalVerLista.vue";
import ModalEnviarLista from "./ModalEnviarLista.vue";
import { convertirFecha } from "@/utils/Fecha";

import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  ListaJugador,
  RequesListaDTO,
} from "@/interfaces/Lista";
import { subirListaTorneo, modificarListaTorneo } from "@/services/ListasService";
import ModalAddMiembroEquipo from "../GestionTorneos/Equipos/ModalAddMiembroEquipo.vue";
import { UsuarioSinEquipoDTO } from "@/interfaces/Usuario";
import { getUsuariosNoInscritosTorneoAsync } from "@/services/UsuariosService";
import { getTorneo } from "@/services/TorneosService";
import { Torneo } from "@/interfaces/Torneo";

const props = defineProps<{
  idInscripcion: number | null;
  idUsuario: number | null;
  idTorneo: number;
  idOrganizador: number | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "eliminar-inscripcion-equipo", idEquipo: number): void;
}>();

const numeroMiembrosEquipo = ref<number>();
const equipoConHuecos = computed(() => {
  const miembros = inscripcionData.value?.componentesEquipoDTO ?? [];
  const faltantes = Math.max(0, (numeroMiembrosEquipo.value ?? 0) - miembros.length);
  return [...miembros, ...Array(faltantes).fill(null)];
});


const show = ref(true);
const showSuccessModalEliminar = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const { getidUsuario } = useAuth();

const idUsuarioLogger = ref<number>(parseInt(getidUsuario.value));
const isLoading = ref<boolean>(true);
const isRegistering = ref<boolean>(false);
const isCaptain = ref<boolean>(false);
const idCaptain = ref<number>();
const detalleTorneo = ref<Torneo>();
const inscripcionData = ref<InscripcionEquipoDTO>({
  idTorneo: 0,
  idCapitan: 0,
  nombreEquipo: "",
  miembros: [],
  idInscripcion: 0,
  idUsuario: 0,
  idEquipo: 0,
  idOrganizador: 0,
  emailOrganizador: "",
  componentesEquipoDTO: [],
});

const currentInscripcionId = ref<number>();
const currentIdLista = ref<number>(0);
const currentUsuarioId = ref<number>();
const currentEmailOrganziador = ref<string>();
const currentNick = ref<string>();
const currentTorneoId = ref<number>();

const showVerListaModal = ref<boolean>(false);
const showEnviarCambiarListaModal = ref<boolean>(false);

const hasLista = ref<boolean>(false);
const showSuccessModalLista = ref<boolean>(false);
const showErrorModalLista = ref<boolean>(false);
const showModalRegistrarMiembroEquipo = ref<boolean>(false);
const showErrorModalEliminarMiembroEquipo = ref<boolean>(false);
const showSuccessModalEliminarMiembroEquipo = ref<boolean>(false);

const listaJugador = ref<ListaJugador>();
const idTorneo = ref<number>();
const jugadoresSinEquipo = ref<UsuarioSinEquipoDTO[]>([]);

watch(
  () => showSuccessModalLista.value,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      recargarPagina();
    }
  }
);

const recargarPagina = () => {
  window.location.reload();
};

const verLista = (listaData: string, nombre: string, ejercito: string) => {
  const listaJugadorDTO: ListaJugador = {
    listaData: listaData,
    nick: nombre,
    nombreEjercito: ejercito,
  };
  listaJugador.value = listaJugadorDTO;
  showVerListaModal.value = true;
};

const eliminarMiembro = async (idInscripcion: number) => {
  const response = await eliminarMiembroEquipoAsync(idInscripcion);

  if (response.status !== 200) {
    showErrorModalEliminarMiembroEquipo.value = true;
    return;
  }

  // Filtrar el miembro eliminado de la lista
  inscripcionData.value.componentesEquipoDTO = inscripcionData.value.componentesEquipoDTO.filter(
    (miembro) => miembro.idInscripcion !== idInscripcion
  );

  showSuccessModalEliminarMiembroEquipo.value = true;
};


const handlerModalRegistrarMiembroEquipo = async () => {
  const responseJugadores = await getUsuariosNoInscritosTorneoAsync(
    inscripcionData.value.idTorneo
  );
  jugadoresSinEquipo.value = (responseJugadores?.data ?? []).sort(
    (a: { nick: string }, b: { nick: string }) => a.nick.localeCompare(b.nick)
  );
  showModalRegistrarMiembroEquipo.value = true;
};

const closeModal = () => {
  showModalRegistrarMiembroEquipo.value = false;
};

const closeConfigModal = (nuevoJugador: UsuarioSinEquipoDTO) => {
  if (nuevoJugador) {
    const nuevoMiembro: ComponentesEquipoDTO = {
      idUsuario: nuevoJugador.idUsuario,
      nick: nuevoJugador.nick,
      idInscripcion: Date.now(), // Temporal si no tienes ID real
      listaData: '',
      estadoLista: "NO_ENTREGADA",
      ejercito: '',
      esCapitan: false,
      idLista: 0,
      fechaEntregaLista: undefined,
    };

    //Comprueba que no exista ya el miembro
    if (!inscripcionData.value.componentesEquipoDTO.some((m) => m.idUsuario === nuevoJugador.idUsuario)) {
      inscripcionData.value.componentesEquipoDTO.push(nuevoMiembro);
    }

  }
};


const enviarCambiarLista = (
  idInscripcion: number | undefined,
  listaData: string,
  idUsuario: number,
  nick: string,
  idLista: number
) => {
  currentInscripcionId.value = idInscripcion;
  currentUsuarioId.value = idUsuario;
  currentNick.value = nick;
  currentIdLista.value = idLista;
  if (!listaData) hasLista.value = false;
  else hasLista.value = true;

  showEnviarCambiarListaModal.value = true;
};

const eliminarInscripcion = async (idEquipo: number) => {
  emit("eliminar-inscripcion-equipo", idEquipo);
  show.value = false;
  emit("close");
};
const close = () => {
  show.value = false;
  emit("close");
};

const handleEnviarLista = async (newLista: RequesListaDTO) => {
  if (currentInscripcionId.value != null) {
    isRegistering.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
      idUsuario: newLista.idUsuario,
      idTorneo: inscripcionData.value.idTorneo,
      emailOrganizador: inscripcionData.value?.emailOrganizador,
      nick: newLista.nick,
      nombreEquipo: inscripcionData.value?.nombreEquipo,
    };

    try {
      await subirListaTorneo(requestLista);
      showSuccessModalLista.value = true;

      for (
        let index = 0;
        index < inscripcionData.value.componentesEquipoDTO.length;
        index++
      ) {
        const element = inscripcionData.value.componentesEquipoDTO[index];
        if (currentInscripcionId.value == element.idInscripcion)
          element.estadoLista = "ENTREGADA";
      }
    } catch {
      isRegistering.value = false;
      showErrorModalLista.value = true;
    } finally {
      isRegistering.value = false;
      //showVerListaModal.value = false;
    }
  }
};
const handleModificarLista = async (newLista: RequesListaDTO) => {
  if (currentInscripcionId.value != null) {
    isRegistering.value = true;
    const requestLista: ModificarListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      idLista: currentIdLista.value,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
      idUsuario: newLista.idUsuario,
      idTorneo: inscripcionData.value.idTorneo,
    };

    try {
      await modificarListaTorneo(requestLista);
      showSuccessModalLista.value = true;

      for (
        let index = 0;
        index < inscripcionData.value.componentesEquipoDTO.length;
        index++
      ) {
        const element = inscripcionData.value.componentesEquipoDTO[index];
        if (currentInscripcionId.value == element.idInscripcion)
          element.estadoLista = "ENTREGADA";
      }
    } catch {
      isRegistering.value = false;
      showErrorModalLista.value = true;
    } finally {
      isRegistering.value = false;
      //showVerListaModal.value = false;
    }
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await getInscripcionEquipo(props.idInscripcion!);

    inscripcionData.value = response.data;
    idTorneo.value = inscripcionData.value.idTorneo;

    if (inscripcionData.value?.idCapitan == idUsuarioLogger.value) {
      isCaptain.value = true;
      idCaptain.value = idUsuarioLogger.value;
    }

    if (idTorneo.value){
      try{
        //Obtenemos datos del torneo para saber cuantos miembros tiene el equipo
        const responseTorneo = await getTorneo(idTorneo.value);
        detalleTorneo.value = responseTorneo.data;
    
        const miembrosPorTipo: Record<string, number> = {
          Individual: 1,
          Parejas: 2,
          Equipos_4: 4,
          Equipos_6: 6,
        };
        numeroMiembrosEquipo.value = miembrosPorTipo[detalleTorneo.value?.tipoTorneo ?? "Individual"] || 1;
        
      }catch (error){
        console.error("Error al obtener el detalle del torneo:", error);
      }
    }
  } catch (error) {
    console.error("Error al obtener datos de la inscripcion:", error);
  }
  finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.rounded-modal {
  border-radius: 12px;
  max-width: 1000px;
  width: 100%;
}
.player-card{
  background-color: #1f1f1f;
}
.modal-title {
  padding: 16px;
  font-weight: bold;
}
.close-button {
  margin-right: 8px;
}
.info-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
.elevated-btn {
  margin: auto;
}
.scrollable-modal {
  max-height: 90vh;
  max-width: 800px;
  overflow-y: auto;
  padding-bottom: 24px;
}
</style>
