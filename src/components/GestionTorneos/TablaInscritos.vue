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
        <tr @click="handleRowClick(item)">
          <!-- nick -->
          <td>{{ item.nick }}</td>

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

          <!-- estado de la lista -->
          <td>
            <v-chip :color="formattedEstadoLista(item.estadoLista).color" dark>
              {{ formattedEstadoLista(item.estadoLista).text }}
            </v-chip>
          </td>

          <!-- fecha entrega de la lista -->
          <td>
            <v-chip
              :color="
                chipColor(item.fechaEntrega, torneo?.torneo.fechaEntregaListas)
              "
              dark
            >
              {{ formattedDate(item.fechaEntrega) }}
            </v-chip>
          </td>

          <!-- estado del pago -->
          <td>
            <v-chip :color="formattedEstadoPago(item.esPago).color" dark>
              {{ formattedEstadoPago(item.esPago).text }}
            </v-chip>
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
        @click="openConfigModal"
        color="primary"
        size="large"
      >
        Generar Ronda 1
      </v-btn>

      <v-btn variant="tonal" @click="openSorteo" color="primary" size="large">
        Sorteo
      </v-btn>
    </v-row>

    <ModalParametrosPrimeraRonda
      :isVisible="showConfigModal"
      :torneo="torneo"
      @close="closeConfigModal"
      @confirm="handleConfigConfirm"
    />
    <ModalAddJugadorTorneo
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

  <ModalDetalleInscripcion
    v-if="showModal"
    :inscripcion="selectedInscripcion"
    @close="closeModal"
    @update-inscripcion="handleUpdateInscripcion"
    @eliminar-inscripcion="handleEliminarInscripcion"
  />

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Jugador añadido correctamente."
    @update:isVisible="showSuccessModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, defineEmits } from "vue";
import { defineProps } from "vue";
import ModalDetalleInscripcion from "./ModalDetalleInscripcion.vue";
import {
  InscripcionTorneoCreadoDTO,
  TorneoGestionInfoDTO,
} from "@/interfaces/Torneo";
import ModalParametrosPrimeraRonda from "./ModalParametrosPrimeraRonda.vue";
import ModalAddJugadorTorneo from "./ModalAddJugadorTorneo.vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import { getInfoTorneoCreado } from "@/services/TorneosService";
import ModalSorteo from "./ModalSorteo.vue";

const props = defineProps<{ torneo: TorneoGestionInfoDTO }>();
const localInscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);
const isLoading = ref<boolean>(true);
const showConfigModal = ref<boolean>(false);
const showSorteoModal = ref<boolean>(false);
const showAddJugadorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const localTorneo = ref<TorneoGestionInfoDTO>();
const nicks = ref<string[]>();

const openConfigModal = async () => {
  isLoading.value = true;
  try {
    if (props.torneo?.torneo.idTorneo) {
      const responseTorneo = await getInfoTorneoCreado(
        props.torneo?.torneo.idTorneo
      );
      localTorneo.value = responseTorneo.data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
  showConfigModal.value = true;
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
  await props.torneo;
  showAddJugadorModal.value = true;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
  window.location.reload();
};

const closeAddJugadorModal = () => {
  showAddJugadorModal.value = false;
};

const handleConfigConfirm = () => {
  closeConfigModal();
};

const handleAddJugadorConfirm = () => {
  showAddJugadorModal.value = false;
  showSuccessModal.value = false;
  window.location.reload();
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

const emit = defineEmits(["inscripcionEliminada"]);

const search = ref<string>("");
const showModal = ref(false);
const selectedInscripcion = ref<InscripcionTorneoCreadoDTO>({
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
    mostrarClasificacion: false
  },
  idTorneo: 0,
});

const headers = computed(() => [
  { title: "Nick", key: "nick" },
  { title: "Fecha Inscripción", key: "fechaInscripcion" },
  { title: "Estado Lista", key: "estadoLista" },
  { title: "Fecha Entrega", key: "fechaEntrega" },
  { title: "Pagado", key: "esPago" },
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
    ? "blue"
    : "yellow";
};

const formattedEstadoPago = (estado: string) => {
  if (estado === "NO") {
    return { text: "NO", color: "red" };
  } else if (estado === "SI") {
    return { text: "SI", color: "blue" };
  }
  return { text: "Desconocido", color: "gray" };
};

const formattedEstadoLista = (estado: string) => {
  switch (estado) {
    case "NO ENTREGADA":
      return { text: "NO ENTREGADA", color: "red" };
    case "ENTREGADA":
      return { text: "ENTREGADA", color: "blue" };
    case "ILEGAL":
      return { text: "ILEGAL", color: "red" };
    case "OK":
      return { text: "OK", color: "blue" };
    default:
      return { text: "Desconocido", color: "gray" };
  }
};

const handleRowClick = (item: InscripcionTorneoCreadoDTO) => {
  selectedInscripcion.value = item;
  showModal.value = true;
};

const handleUpdateInscripcion = (payload: {
  field: keyof InscripcionTorneoCreadoDTO;
  value: any;
}) => {
  if (selectedInscripcion.value) {
    (selectedInscripcion.value[payload.field] as unknown) = payload.value;
  }
};

const handleEliminarInscripcion = (idInscripcion: number) => {
  const index = localInscripciones.value.findIndex(
    (inscripcion) => inscripcion.idInscripcion === idInscripcion
  );
  if (index !== -1) {
    localInscripciones.value.splice(index, 1);
    emit("inscripcionEliminada", idInscripcion);
  }
};

const closeModal = () => {
  showModal.value = false;
};
</script>
