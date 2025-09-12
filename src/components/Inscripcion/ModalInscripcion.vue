<template>
  <div v-if="isLoading" class="center">
    <LoadingGandalf />
  </div>
  <div v-else class="center">
    <v-dialog v-model="show" max-width="800px">
      <v-card elevation="12">
        <v-card-title
          class="modal-title d-flex align-center justify-space-between"
        >
          <h3 class="text-h5 font-weight-bold">Detalle de la inscripción</h3>
          <v-btn icon @click="close" class="close-button">
            <v-icon color="grey darken-1">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!-- Lista por jugador = 1 -->
        <v-card-text v-if="torneo.listasPorJugador == 1" class="px-6 py-4">
          <v-list>
            <v-list-item>
              <v-list-item-title class="list-item-title">
                <v-icon color="primary" class="mr-2">mdi-file-document</v-icon>
                <strong>Lista:</strong> &nbsp;{{ inscripcionData?.estadoLista }}
              </v-list-item-title>
              <v-btn
                v-if="inscripcionData?.listaData"
                color="primary"
                variant="tonal"
                block
                @click="toggleLista"
              >
                <v-icon left>mdi-eye</v-icon
                >{{ showLista ? "Ocultar lista" : "Ver lista" }}
              </v-btn>
              <v-btn
                v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"
                color="primary"
                block
                variant="tonal"
                class="elevated-btn"
                @click="handleVerLista(inscripcionData?.idInscripcion)"
              >
                <v-icon left>mdi-mail</v-icon> Enviar / Modificar Lista
              </v-btn>
            </v-list-item>

            <v-divider class="mt-3 mb-1"></v-divider>
            <v-expand-transition>
              <v-list-item v-if="showLista">
                <v-list-item-content>
                  <h3 class="text-h6 font-weight-bold text-primary">
                    {{ inscripcionData?.ejercito }}
                  </h3>
                  <v-divider class="my-3"></v-divider>
                  <template v-if="listaBase64">
                    <v-img
                      :src="listaBase64"
                      alt="Lista de ejército"
                      max-width="100%"
                      class="rounded-img"
                      contain
                    />
                  </template>
                  <template v-else>
                    <p class="text-grey-darken-1 text-center">
                      No hay lista disponible
                    </p>
                  </template>
                </v-list-item-content>
              </v-list-item>
            </v-expand-transition>

            <v-list-item>
              <v-list-item-title class="list-item-title">
                <v-icon
                  :color="inscripcionData?.esPago === 'SI' ? 'green' : 'red'"
                  class="mr-2"
                  >mdi-credit-card</v-icon
                >
                <span class="font-weight-bold">Estado de pago:</span>
                <v-chip
                  :color="inscripcionData?.esPago === 'SI' ? 'green' : 'red'"
                  dark
                  class="ml-2"
                >
                  {{
                    inscripcionData?.esPago === "SI" ? "Pagado" : "No pagado"
                  }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item v-if="new Date(torneo!.fechaFinTorneo) >= new Date()">
              <v-btn
                color="red-darken-3"
                variant="tonal"
                block
                class="elevated-btn"
                @click="eliminarInscripcion(idInscripcion!)"
              >
                <v-icon left>mdi-delete</v-icon> Darse de baja del torneo
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card-text>

        <!-- Listas por jugador > 1 -->
        <v-card-text v-else class="px-6 py-4">
          <v-list>
            <!-- Repetir para cada posible lista -->
            <v-list-item v-for="index in torneo.listasPorJugador" :key="index">
              <v-list-item-title class="list-item-title">
                <v-icon color="primary" class="mr-2">mdi-file-document</v-icon>
                <strong>Lista {{ index }}:</strong>&nbsp;
                <span v-if="listasPorJugador[index - 1]">
                  {{ listasPorJugador[index - 1].estadoLista }}
                </span>
                <v-chip v-else color="red" dark class="ml-2">
                  NO ENTREGADA
                </v-chip>
              </v-list-item-title>
              <!-- Si hay lista -->
              <div v-if="listasPorJugador[index - 1]?.listaData">
                <!-- Botón de ver lista si existe -->
                <v-btn
                  v-if="listasPorJugador[index - 1]?.listaData"
                  color="primary"
                  variant="tonal"
                  block
                  @click="
                    toggleListaMasDeUna(
                      index,
                      listasPorJugador[index - 1].listaData!,
                      listasPorJugador[index - 1].ejercito!
                    )
                  "
                >
                  <v-icon left>mdi-eye</v-icon>
                  {{ showLista ? "Ocultar lista" : "Ver lista" }}
                </v-btn>

                <!-- Mostrar lista expandida -->
                <v-expand-transition>
                  <v-list-item v-if="showListaPorIndex[index]">
                    <v-list-item-content>
                      <h3 class="text-h6 font-weight-bold text-primary">
                        {{ currentNombreEjercito }}
                      </h3>
                      <v-divider class="my-3"></v-divider>
                      <template v-if="listasPorJugador[index - 1]?.listaData">
                        <v-img
                          :src="listasPorJugador[index - 1].listaData"
                          alt="Lista de ejército"
                          max-width="100%"
                          class="rounded-img"
                          contain
                        />
                      </template>
                      <template v-else>
                        <p class="text-grey-darken-1 text-center">
                          No hay lista disponible
                        </p>
                      </template>
                    </v-list-item-content>
                  </v-list-item>
                </v-expand-transition>

                <!-- Botón para modificar lista -->
                <v-btn
                  v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"
                  color="primary"
                  block
                  variant="tonal"
                  class="elevated-btn"
                  @click="
                    handleModificarListaMasDeUnaListaPorJugador(
                      listasPorJugador[index - 1].idLista!
                    )
                  "
                >
                  <v-icon left>mdi-mail</v-icon> Modificar
                </v-btn>
              </div>
              <!-- Si no hay lista -->
              <div v-else>
                <!-- Botón para enviar -->
                <v-btn
                  v-if="new Date(torneo!.fechaFinTorneo) >= new Date()"
                  color="primary"
                  block
                  variant="tonal"
                  class="elevated-btn"
                  @click="
                    handleEnviarListaMasDeUnaListaPorJugador(
                      inscripcionData.idInscripcion
                    )
                  "
                >
                  <v-icon left>mdi-mail</v-icon> Enviar
                </v-btn>
              </div>

              <v-divider class="mt-3 mb-1"></v-divider>
            </v-list-item>

            <v-list-item>
              <v-list-item-title class="list-item-title">
                <v-icon
                  :color="inscripcionData?.esPago === 'SI' ? 'green' : 'red'"
                  class="mr-2"
                  >mdi-credit-card</v-icon
                >
                <span class="font-weight-bold">Estado de pago:</span>
                <v-chip
                  :color="inscripcionData?.esPago === 'SI' ? 'green' : 'red'"
                  dark
                  class="ml-2"
                >
                  {{
                    inscripcionData?.esPago === "SI" ? "Pagado" : "No pagado"
                  }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item v-if="new Date(torneo!.fechaFinTorneo) >= new Date()">
              <v-btn
                color="red-darken-3"
                variant="tonal"
                block
                class="elevated-btn"
                @click="eliminarInscripcion(idInscripcion!)"
              >
                <v-icon left>mdi-delete</v-icon> Darse de baja del torneo
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
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

  <!-- Modal lista -->
  <ModalLista
    v-if="currentInscripcionId != undefined && currentInscripcionId != null"
    :isVisible="showVerListaModal"
    :hasLista="hasLista"
    :idInscripcion="currentInscripcionId"
    @update:isVisible="showVerListaModal = $event"
    @enviarLista="handleEnviarLista"
    @modificarLista="handleModificarLista"
  />

  <!-- Modal enviar lista -->
  <ModalEnviarLista
    v-if="showEnviarListaModal"
    :key="currentInscripcionId"
    v-model:isVisible="showEnviarListaModal"
    :idInscripcion="currentInscripcionId!"
    :idUsuario="props.idUsuario"
    :idTorneo="props.idTorneo"
    :hasLista="false"
    @enviarLista="enviarLista"
    @modificarLista="modificarLista"
  />

  <!-- Modal modificar lista -->
  <ModalModificarLista
    :isVisible="showModificarListaModal"
    :idLista="currentIdLista!"
    @update:isVisible="showModificarListaModal = $event"
    @modificarListaMasDeUna="modificarLista"
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
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, onMounted, watch } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import LoadingGandalf from "../Commons/LoadingGandalf.vue";
import { getIncripcionById } from "@/services/InscripcionesService";
import { InscripcionTorneoCreadoDTO, Torneo } from "@/interfaces/Torneo";
import ModalLista from "./ModalLista.vue";
import {
  CrearListaTorneoRequestDTO,
  ListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
  RequesListaDTO,
} from "@/interfaces/Lista";
import {
  getListasByInscripcion,
  getlistaTorneo,
  modificarListaTorneo,
  subirListaTorneo,
} from "@/services/ListasService";
import { ArmyDTO } from "@/interfaces/Army";
import { ListaDTO } from "@/interfaces/Usuario";
import ModalModificarLista from "./ModalModificarLista.vue";
import ModalEnviarLista from "./ModalEnviarLista.vue";
import { ClassificationType } from "@/Constant/TipoClasificacion";

const props = defineProps<{
  idInscripcion: number;
  idUsuario: number;
  idTorneo: number;
  idOrganizador: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "eliminar-inscripcion", idInscripcion: number): void;
}>();

const show = ref(true);
const showSuccessModalEliminar = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);

const isLoading = ref(true);
const isRegistering = ref(false);

const inscripcionData = ref<InscripcionTorneoCreadoDTO>({
  idInscripcion: 0,
  idUsuario: 0,
  torneo: {
    idTorneo: 0,
    idUsuario: 0,
    nombreTorneo: "",
    descripcionTorneo: "",
    fechaInicioTorneo: "",
    fechaFinTorneo: "",
    precioTorneo: 0,
    numeroPartidas: 0,
    puntosTorneo: 0,
    estadoTorneo: "ESPERANDO",
    lugarTorneo: "",
    esPrivadoTorneo: false,
    idRangoTorneo: 0,
    esMatchedPlayTorneo: false,
    fechaEntregaListas: "",
    fechaFinInscripcion: "",
    basesTorneo: "",
    cartelTorneo: "",
    metodosPago: [],
    horaInicioTorneo: "",
    horaFinTorneo: "",
    tieneBases: false,
    inicioInscripciones: "",
    listasPorJugador: 0,
    tipoTorneo: "Individual",
    mostrarListas: false,
    mostrarClasificacion: false,
    classificationType: ClassificationType.NORMAL
  },
  idTorneo: 0,
  puntosExtra: 0
});
const torneo = ref<Torneo>({
  idTorneo: 0,
  idUsuario: 0,
  nombreTorneo: "",
  descripcionTorneo: "",
  fechaInicioTorneo: "",
  fechaFinTorneo: "",
  precioTorneo: 0,
  numeroPartidas: 0,
  puntosTorneo: 0,
  estadoTorneo: "ESPERANDO",
  lugarTorneo: "",
  esPrivadoTorneo: false,
  idRangoTorneo: 0,
  esMatchedPlayTorneo: false,
  fechaEntregaListas: "",
  fechaFinInscripcion: "",
  basesTorneo: "",
  cartelTorneo: "",
  metodosPago: [],
  horaInicioTorneo: "",
  horaFinTorneo: "",
  tieneBases: false,
  inicioInscripciones: "",
  listasPorJugador: 0,
  tipoTorneo: "Individual",
  mostrarListas: false,
  mostrarClasificacion: false,
  classificationType: ClassificationType.NORMAL
});
const currentInscripcionId = ref<number>();
const currentIdLista = ref<number>();

const showVerListaModal = ref<boolean>(false);
const showModificarListaModal = ref<boolean>(false);
const showEnviarListaModal = ref<boolean>(false);
const hasLista = ref<boolean>(false);
const listaText = ref<string>("");
const ejercito = ref<ArmyDTO>({
  name: "",
  band: "",
});
const showSuccessModalLista = ref<boolean>(false);
const showErrorModalLista = ref<boolean>(false);
const idLista = ref<number | null>();
const showLista = ref<boolean>(false);
const showListaPorIndex = ref<Record<number, boolean>>({});
const listaBase64 = ref<string | null>();

const currentListaData = ref<string | null>();
const currentNombreEjercito = ref<string | null>();

const listasPorJugador = ref<ListaDTO[]>([]);

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

const handleVerLista = async (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  idLista.value = inscripcionData.value?.idLista;

  if (inscripcionData.value?.bando) hasLista.value = true;
  if (idLista.value)
    await handleModificarListaMasDeUnaListaPorJugador(idLista.value);
  else {
    await verLista();
  }
};

const handleEnviarListaMasDeUnaListaPorJugador = async (
  idInscripcion: number
) => {
  currentInscripcionId.value = idInscripcion;
  showEnviarListaModal.value = true;
};

const handleModificarListaMasDeUnaListaPorJugador = async (id: number) => {
  currentIdLista.value = id;
  showModificarListaModal.value = true;
};

const toggleLista = async () => {
  if (!props.idTorneo || !props.idUsuario) {
    console.error("Faltan datos necesarios: idTorneo o idUsuario.");
    return;
  }

  showLista.value = !showLista.value;
  isLoading.value = true;

  const requestLista: ListaTorneoRequestDTO = {
    idTorneo: props.idTorneo,
    idUsuario: props.idUsuario,
  };
  try {
    const response = await getlistaTorneo(requestLista);
    listaBase64.value = response.data.listaData;
    ejercito.value.name = response.data.ejercito;
    ejercito.value.band = response.data.bando;
  } catch (error) {
    console.error("Error al recuperar la lista.");
  } finally {
    isLoading.value = false;
  }
};

const toggleListaMasDeUna = async (
  index: number,
  listaData: string,
  nombreEjercito: string
) => {
  if (!listaData) {
    console.error("Faltan el data de la lista");
    return;
  }
  showListaPorIndex.value[index] = !showListaPorIndex.value[index];

  currentListaData.value = listaData;
  currentNombreEjercito.value = nombreEjercito;

  if (!showListaPorIndex.value[index]) {
    currentListaData.value = "";
    currentNombreEjercito.value = "";
  }
};

const verLista = async () => {
  showVerListaModal.value = true;
};

const handleEnviarLista = async (newLista: RequesListaDTO) => {
  listaText.value = newLista.listaData;
  ejercito.value = newLista.ejercito;
  await enviarLista(newLista);
};

const enviarLista = async (newLista: RequesListaDTO) => {
  if (currentInscripcionId.value && props.idUsuario && props.idTorneo) {
    isRegistering.value = true;
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: newLista.listaData,
      ejercito: newLista.ejercito,
      idUsuario: props.idUsuario,
      idTorneo: props.idTorneo,
    };

    try {
      await subirListaTorneo(requestLista);
      showSuccessModalLista.value = true;
    } catch {
      isRegistering.value = false;
      showErrorModalLista.value = true;
    } finally {
      isRegistering.value = false;
      showVerListaModal.value = false;
      showEnviarListaModal.value = false;
    }
  }
};

const handleModificarLista = async (newLista: RequesListaDTO) => {
  ejercito.value = newLista.ejercito;
  listaText.value = newLista.listaData;
  await modificarLista(newLista);
};

const modificarLista = async (newLista: RequesListaDTO) => {
  isRegistering.value = true;
  if (currentIdLista.value == null) {
    return;
  }
  const requestLista: ModificarListaTorneoRequestDTO = {
    listaData: newLista.listaData,
    idLista: currentIdLista.value,
    ejercito: newLista.ejercito,
    idUsuario: props.idUsuario,
    idTorneo: props.idTorneo,
  };
  try {
    await modificarListaTorneo(requestLista);
    showSuccessModalLista.value = true;
  } catch {
    isRegistering.value = false;
    showErrorModalLista.value = true;
  } finally {
    isRegistering.value = false;
    showVerListaModal.value = false;
    showModificarListaModal.value = false;
  }
};

const eliminarInscripcion = async (idInscripcion: number) => {
  emit("eliminar-inscripcion", idInscripcion);
  show.value = false;
  emit("close");
};

const close = () => {
  show.value = false;
  emit("close");
};

onMounted(async () => {
  try {
    isLoading.value = true;

    const response = await getIncripcionById(props.idInscripcion);
    inscripcionData.value = response.data;
    if (inscripcionData.value) torneo.value = inscripcionData.value.torneo;

    if (
      torneo.value != null &&
      inscripcionData.value != null &&
      torneo.value?.listasPorJugador > 1
    ) {
      const responseTorneo = await getListasByInscripcion(
        inscripcionData.value.idInscripcion
      );
      listasPorJugador.value = responseTorneo.data;
    }
  } catch (error) {
    console.error("Error al obtener datos de la inscripcion:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.rounded-modal {
  border-radius: 12px;
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
</style>
