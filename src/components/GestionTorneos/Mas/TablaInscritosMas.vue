<template>
  <!-- Tabla inscritos -->

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      Inscritos
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        density="compact"
        label="Buscar"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      />
    </v-card-title>

    <v-divider></v-divider>

    <div v-if="isLoading" class="text-center pa-4">
      Cargando inscripciones...
    </div>

    <div
      v-else-if="!isLoading && localInscripciones.length === 0"
      class="text-center pa-4"
    >
      No hay inscripciones para este torneo
    </div>

    <v-data-table
      v-else
      v-model:search="search"
      :items="localInscripciones"
      :headers="headers"
      class="custom-table"
      item-key="nick"
    >
      <template v-slot:item="{ item }">
        <tr :class="{ 'expanded-row': expandedRows[item.idInscripcion] }">
          <!-- nick -->
          <td>
            {{ item.nick }}
            <v-btn icon @click.stop="toggleExpand(item.idInscripcion)">
              <v-icon>
                {{
                  expandedRows[item.idInscripcion]
                    ? "mdi-chevron-up"
                    : "mdi-chevron-down"
                }}
              </v-icon>
            </v-btn>
          </td>

          <!-- fecha de la inscripcion -->
          <td>
            <v-chip
              :color="
                chipColor(
                  item.fechaInscripcion,
                  torneo?.torneo.fechaFinInscripcion
                )
              "
              dark
            >
              {{ formattedDate(item.fechaInscripcion) }}
            </v-chip>
          </td>

          <!-- numero de listas entregadas -->
          <td>
            <v-chip
              :color="
                chipNumeroListasColor(
                  item.countListasEntregadas,
                  torneo.torneo.listasPorJugador
                )
              "
              dark
            >
              {{ item.countListasEntregadas }}/{{
                torneo.torneo.listasPorJugador
              }}
            </v-chip>
          </td>

          <!-- fecha ultima entrega de la lista -->
          <td>
            <v-chip
              :color="
                chipColor(
                  item.fechaUltimaEntrega,
                  torneo?.torneo.fechaEntregaListas
                )
              "
              dark
            >
              {{ formattedDate(item.fechaUltimaEntrega) }}
            </v-chip>
          </td>

          <!-- estado del pago -->
          <td>
            <span :class="item.esPago === 'SI' ? 'text-success' : 'text-error'">
              {{ item.esPago }}
            </span>
            <v-icon
              @click="updatePago(item.idInscripcion, item.esPago)"
              class="ml-2 cursor-pointer"
            >
              mdi-swap-horizontal
            </v-icon>
          </td>

          <!-- eliminar inscripcion -->
          <td>
            <v-icon
              @click="handleEliminarInscripcion(item.idInscripcion)"
              class="ml-2 cursor-pointer"
              color="red"
            >
              mdi-delete
            </v-icon>
          </td>
        </tr>

        <!-- Fila expandida con slots -->
        <tr v-if="expandedRows[item.idInscripcion]">
          <td colspan="5">
            <div
              v-for="n in torneo.torneo.listasPorJugador"
              :key="'slot-' + n"
              class="expanded-content"
            >
              <slot :name="'expanded-content-' + n" :item="item">
                <!-- Contenido por defecto si no se pasa un slot -->
                <v-table class="mt-2">
                  <thead>
                    <tr>
                      <th class="text-center">ID</th>
                      <th class="text-center">Fecha de entrega</th>
                      <th class="text-center">Estado</th>
                      <th class="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {{ n }}
                      </td>
                      <td>
                        <v-chip
                          v-if="item.lista[n - 1]"
                          :color="
                            chipColor(
                              item.lista[n - 1].fechaEntrega,
                              torneo?.torneo.fechaEntregaListas
                            )
                          "
                          dark
                        >
                          {{ formattedDate(item.lista[n - 1].fechaEntrega) }}
                        </v-chip>

                        <v-btn
                          v-if="!item.lista[n - 1]"
                          color="primary"
                          variant="tonal"
                          @click="
                            handleAddLista(
                              item.idInscripcion,
                              item.idUsuario,
                              item.idTorneo
                            )
                          "
                          >subir lista</v-btn
                        >
                      </td>
                      <td>
                        <v-select
                          v-if="item.lista[n - 1]"
                          :items="estadoListaOptions"
                          v-model="item.lista[n - 1].estadoLista"
                          item-title="text"
                          item-value="text"
                          @update:modelValue="
                            (value: string) =>
                              updateEstado(
                                item.lista[n - 1].idLista,
                                value,
                                item.idTorneo, 
                                item.idUsuario
                              )
                          "
                          chips
                        >
                        </v-select>
                      </td>

                      <td>
                        <v-btn
                          v-if="item.lista[n - 1]"
                          icon
                          @click.stop="verLista(item.lista[n - 1], item.nick)"
                        >
                          <v-icon>mdi-eye</v-icon>
                        </v-btn>

                        <v-btn
                          v-if="item.lista[n - 1]"
                          icon
                          @click.stop="
                            handleEditLista(
                              item.lista[n - 1],
                              item.idTorneo,
                              item.idUsuario
                            )
                          "
                        >
                          <v-icon>mdi-file-edit</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </slot>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- boton para generar los pairing pasandole el id del torneo -->
    <v-row justify="center" class="my-4 ga-5">
      <v-btn
        variant="tonal"
        @click="openAddJugadorModal"
        color="secondary"
        size="large"
      >
        Añadir Jugador
      </v-btn>
      <v-btn
        variant="tonal"
        @click="handlerModalGenerarRonda1"
        color="primary"
        size="large"
      >
        Generar Ronda 1
      </v-btn>

      <v-btn variant="tonal" @click="openSorteo" color="primary" size="large">
        Sorteo
      </v-btn>
    </v-row>

    <ModalParametrosPrimeraRondaMas
      v-if="torneo.torneo.idTorneo"
      :isVisible="showModalGenerarRonda1"
      :torneo="torneo"
      @close="closeModalGenerarRonda1"
      @confirm="handleConfirmGenerarRonda1"
    />
    <ModalAddJugadorTorneoMas
      :isVisible="showAddJugadorModal"
      :torneo="torneo"
      @close="closeAddJugadorModal"
      @confirm="handleAddJugadorConfirm"
    />
    <ModalSorteo
      :isVisible="showSorteoModal"
      :participantes="nicks"
      @close="closeSorteoModal"
    />
  </v-card>

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Jugador añadido correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response estado pago -->
  <ModalSuccess
    :isVisible="showSuccessModalPago"
    message="Estado del pago actualizado."
    @update:isVisible="showSuccessModalPago = $event"
  />

  <!-- Modal response success subir la lista pago -->
  <ModalSuccess
    :isVisible="showSuccessAddLista"
    message="Lista subida con exito."
    @update:isVisible="showSuccessAddLista = $event"
  />

  <!-- Modal response success editar lista -->
  <ModalSuccess
    :isVisible="showSuccessEditLista"
    message="Lista modificada con exito."
    @update:isVisible="showSuccessEditLista = $event"
  />

  <!-- Modal response success eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessEliminarInscripcion"
    message="Inscripción eliminada con exito."
    @update:isVisible="showSuccessEliminarInscripcion = $event"
  />

  <!-- Modal response success actualizar estado de una lista -->
  <ModalSuccess
    :isVisible="showSuccessUpdateEstadoLista"
    message="Estado de la lista actualizado con exito."
    @update:isVisible="showSuccessUpdateEstadoLista = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido actualizar la inscripción. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Modal response si error al subir la lista -->
  <ModalError
    :isVisible="showErrorAddLista"
    message="No se ha podido subir la lista. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorAddLista = $event"
  />

  <!-- Modal response error al actualizar el estado de una lista -->
  <ModalError
    :isVisible="showErrorUpdateEstadoLista"
    message="No se ha podido actualizar el estado de la lista. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorUpdateEstadoLista = $event"
  />

  <!-- Modal response si error al eliminar inscripcion -->
  <ModalError
    :isVisible="showErrorEliminarInscripcion"
    message="No se ha podido eliminar la inscripción. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorEliminarInscripcion = $event"
  />

  <!-- Modal response si error al editar una lista -->
  <ModalError
    :isVisible="showErrorEditLista"
    message="No se ha podido cambiar la lista. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorEditLista = $event"
  />

  <!-- Modal lista -->
  <ModalSubirListaGestionMas
    v-if="currentInscripcionId != undefined && currentInscripcionId != null"
    :isVisible="showModalAddLista"
    :idInscripcion="currentInscripcionId!"
    @update:isVisible="showModalAddLista = $event"
    @enviarLista="handleEnviarLista"
  />

  <!-- Modal modificar lista -->
  <ModalModificarLista
    v-if="currentLista != null && currentLista != undefined"
    :isVisible="showModalEditLista"
    :idLista="currentLista!.idLista!"
    @update:isVisible="showModalEditLista = $event"
    @modificarListaMasDeUna="modificarLista"
  />

  <ModalListaResultadoTorneo
    v-if="showVerListaModal"
    :listaData="listaData"
    :ejercito="currentEjercito"
    :nickJugador="currentNick!"
    @close="showVerListaModal = false"
  />

  <!-- Modal de Carga -->
  <v-dialog v-model="isLoading" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
      ></v-progress-circular>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineEmits } from "vue";
import { defineProps } from "vue";
import {
  InscripcionTorneoCreadoMasDTO,
  TorneoGestionInfoMasDTO,
} from "@/interfaces/Torneo";
import { getInfoTorneoCreadoMasAsync } from "@/services/TorneosService";
import { ListaDTO } from "@/interfaces/Usuario";
import {
  cancelarInscripcion,
  updateEstadoPago,
} from "@/services/InscripcionesService";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
  UpdateEstadoListaMasDTO,
} from "@/interfaces/Lista";
import {
  modificarListaTorneo,
  subirListaTorneo,
  updateEstadoListaMasAsync,
} from "@/services/ListasService";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalAddJugadorTorneoMas from "./ModalAddJugadorTorneoMas.vue";
import ModalSorteo from "../ModalSorteo.vue";
import ModalSubirListaGestionMas from "./ModalSubirListaGestionMas.vue";
import ModalModificarLista from "@/components/Inscripcion/ModalModificarLista.vue";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalParametrosPrimeraRondaMas from "./ModalParametrosPrimeraRondaMas.vue";

const props = defineProps<{ torneo: TorneoGestionInfoMasDTO }>();
const localInscripciones = ref<InscripcionTorneoCreadoMasDTO[]>([]);
const isLoading = ref<boolean>(true);
const showSorteoModal = ref<boolean>(false);
const showAddJugadorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const localTorneo = ref<TorneoGestionInfoMasDTO>();
const nicks = ref<string[]>();
const showSuccessModalPago = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const currentInscripcionId = ref<number>();
const currentLista = ref<ListaDTO>();

const currentTorneoId = ref<number>();
const currentNick = ref<string>();
const currentEjercito = ref<string>();

const currentUsuarioId = ref<number>();
const showModalAddLista = ref<boolean>(false);
const showSuccessAddLista = ref<boolean>(false);
const showErrorAddLista = ref<boolean>(false);
const showVerListaModal = ref<boolean>(false);
const showSuccessEliminarInscripcion = ref<boolean>(false);
const showErrorEliminarInscripcion = ref<boolean>(false);
const showSuccessEditLista = ref<boolean>(false);
const showSuccessUpdateEstadoLista = ref<boolean>(false);
const showErrorUpdateEstadoLista = ref<boolean>(false);
const showErrorEditLista = ref<boolean>(false);
const showModalEditLista = ref<boolean>(false);
const listaData = ref<string>("");
const search = ref<string>("");
const expandedRows = ref<{ [key: number]: boolean }>({});
const estadoListaOptions = [
  { text: "NO ENTREGADA", color: "red" },
  { text: "ENTREGADA", color: "blue" },
  { text: "ILEGAL", color: "red" },
  { text: "OK", color: "green" },
];
const showModalGenerarRonda1 = ref<boolean>(false);

const updateEstado = async (
  idLista: number,
  estado: string,
  idTorneo: number,
  idUsuario: number
) => {
  isLoading.value = true;
  const updateEstadoListaDTO: UpdateEstadoListaMasDTO = {
    idLista: idLista,
    estado: estado,
    idTorneo: idTorneo,
    idUsuario: idUsuario,
  };

  try {
    updateEstadoListaMasAsync(updateEstadoListaDTO);
    showSuccessUpdateEstadoLista.value = true;
  } catch {
    console.error("Error actualizando el estado de la lista");
    showErrorUpdateEstadoLista.value = true;
  } finally {
    isLoading.value = false;
  }
};

const updatePago = async (idInscripcion: number, estado: string) => {
  isLoading.value = true;

  try {
    if (estado == "NO") estado = "SI";
    else if (estado == "SI") estado = "NO";
    await updateEstadoPago({
      idInscripcion: idInscripcion,
      esPago: estado,
    });
    showSuccessModalPago.value = true;
    isLoading.value = false;

    handleUpdatePago(idInscripcion, estado);
  } catch {
    console.error("Error actualizando el pago");
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleAddLista = async (
  idInscripcion: number,
  idUsuario: number,
  idTorneo: number
) => {
  currentTorneoId.value = idTorneo;
  currentUsuarioId.value = idUsuario;
  currentInscripcionId.value = idInscripcion;
  showModalAddLista.value = true;
};

const handleEditLista = async (
  lista: ListaDTO,
  idTorneo: number,
  idUsuario: number
) => {
  currentLista.value = lista;
  currentTorneoId.value = idTorneo;
  currentUsuarioId.value = idUsuario;
  showModalEditLista.value = true;
};

const handleEnviarLista = async (newLista: RequesListaDTO) => {
  if (
    currentInscripcionId.value &&
    currentUsuarioId.value &&
    currentTorneoId.value
  ) {
    isLoading.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
      idUsuario: currentUsuarioId.value,
      idTorneo: currentTorneoId.value,
    };

    try {
      await subirListaTorneo(requestLista);
      showModalAddLista.value = false;
      showSuccessAddLista.value = true;
      refreshTorneo();
    } catch {
      isLoading.value = false;
      showErrorAddLista.value = true;
    } finally {
      isLoading.value = false;
      showModalAddLista.value = false;
    }
  }
};

const modificarLista = async (newLista: RequesListaDTO) => {
  if (
    currentLista.value?.idLista == null ||
    currentLista.value?.idLista == undefined
  ) {
    return;
  }
  isLoading.value = true;
  const requestLista: ModificarListaTorneoRequestDTO = {
    listaData: newLista.listaData,
    idLista: currentLista.value.idLista,
    ejercito: newLista.ejercito,
    idUsuario: currentUsuarioId.value,
    idTorneo: currentTorneoId.value,
  };
  try {
    await modificarListaTorneo(requestLista);
    showSuccessEditLista.value = true;
    refreshTorneo();
  } catch {
    isLoading.value = false;
    showErrorEditLista.value = true;
  } finally {
    isLoading.value = false;
    showModalEditLista.value = false;
  }
};

const handlerModalGenerarRonda1 = async () => {
  showModalGenerarRonda1.value = true;
};

const refreshTorneo = async () => {
  isLoading.value = true;
  try {
    if (props.torneo?.torneo.idTorneo) {
      const responseTorneo = await getInfoTorneoCreadoMasAsync(
        props.torneo?.torneo.idTorneo
      );
      localTorneo.value = responseTorneo.data;
      localInscripciones.value = JSON.parse(
        JSON.stringify(localTorneo.value?.inscripciones)
      );
    }

    emit("cambios", localTorneo.value);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
    console.log(localTorneo.value);
  }
};

const openSorteo = async () => {
  isLoading.value = true;
  try {
    nicks.value = localInscripciones.value
      .map((x) => x.nick)
      .filter((nick): nick is string => nick !== null && nick !== undefined);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  showSorteoModal.value = true;
};

const closeSorteoModal = () => {
  showSorteoModal.value = false;
};

const openAddJugadorModal = async () => {
  showAddJugadorModal.value = true;
};

const closeModalGenerarRonda1 = () => {
  showModalGenerarRonda1.value = false;
};

const closeAddJugadorModal = () => {
  showAddJugadorModal.value = false;
};

const handleConfirmGenerarRonda1 = () => {
  closeModalGenerarRonda1();
  recargarPagina();
};

const recargarPagina = () => {
  window.location.reload();
};

const handleAddJugadorConfirm = () => {
  showAddJugadorModal.value = false;
  showSuccessModal.value = false;
  refreshTorneo();
};

watch(
  () => props.torneo?.inscripciones,
  (newInscripciones) => {
    if (newInscripciones) {
      localInscripciones.value = [...newInscripciones];
    }
    isLoading.value = false;
  },
  { immediate: true }
);

watch(
  () => showSuccessModal.value,
  (newValue) => {
    if (!newValue) {
      window.location.reload();
    }
  }
);

const emit = defineEmits(["inscripcionEliminada", "cambios"]);

const headers = computed(() => [
  { title: "Nick", key: "nick" },
  { title: "Fecha Inscripción", key: "fechaInscripcion" },
  { title: "Listas entregadas", key: "estadoLista" },
  { title: "Fecha última entrega", key: "fechaEntrega" },
  { title: "Pagado", key: "esPago" },
  { title: "Eliminar", key: "eliminar" },
]);

const formattedDate = (date: string | null | undefined) => {
  return date ? new Date(date).toLocaleDateString() : "N/A";
};

const chipColor = (
  inscriptionDate: string | null | undefined,
  referenceDate: string | null | undefined
) => {
  if (!inscriptionDate || !referenceDate) return "red";
  return new Date(inscriptionDate) < new Date(referenceDate)
    ? "green"
    : "yellow";
};

const chipNumeroListasColor = (
  numeroListasEnviadas: number,
  listasNecesarias: number
) => {
  return numeroListasEnviadas < listasNecesarias ? "yellow" : "green";
};

const toggleExpand = (id: number) => {
  expandedRows.value[id] = !expandedRows.value[id];
};

const handleUpdatePago = (idInscripcion: number, estado: string) => {
  localInscripciones.value.forEach((i) => {
    if (i.idInscripcion == idInscripcion) {
      i.esPago = estado;
    }
  });
  refreshTorneo();
};

const handleEliminarInscripcion = async (idInscripcion: number) => {
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessEliminarInscripcion.value = true;
      refreshTorneo();
    }
  } catch {
    showErrorEliminarInscripcion.value = true;
  }
};

const verLista = (lista: ListaDTO, nick: string) => {
  if (lista.listaData) {
    listaData.value = lista.listaData;
    showVerListaModal.value = true;
    currentNick.value = nick;
    currentEjercito.value = lista.ejercito;
  } else {
    console.error("No se puede cargar la lista");
  }
};
</script>

<style scoped>
.expanded-row {
  background-color: rgb(87, 60, 12);
}

.red--text {
  color: red;
}

.green--text {
  color: green;
}
</style>
