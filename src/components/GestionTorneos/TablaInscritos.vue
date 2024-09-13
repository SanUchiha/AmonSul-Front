<template>
  <v-card flat>
    <v-card-title class="d-flex align-center pe-2">
      Inscritos
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        density="compact"
        label="Search"
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

          <!-- estado inscripcion -->
          <td>
            <v-chip
              :color="formattedEstadoInscripcion(item.estadoInscripcion).color"
              dark
            >
              {{ formattedEstadoInscripcion(item.estadoInscripcion).text }}
            </v-chip>
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
        Generar Ronda
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
      :torneo="localTorneo"
      @close="closeAddJugadorModal"
      @confirm="handleAddJugadorConfirm"
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

// Define las propiedades
const props = defineProps<{ torneo: TorneoGestionInfoDTO | null }>();

// Crear una copia reactiva de las inscripciones
const localInscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);
const isLoading = ref(true);

const showConfigModal = ref(false);
const showAddJugadorModal = ref(false);
const showSuccessModal = ref<boolean>(false);
const localTorneo = ref<TorneoGestionInfoDTO>();

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

const openAddJugadorModal = () => {
  showAddJugadorModal.value = true;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
};
const closeAddJugadorModal = () => {
  showAddJugadorModal.value = false;
  showSuccessModal.value = true;
};

const handleConfigConfirm = () => {
  closeConfigModal();
};
const handleAddJugadorConfirm = () => {
  closeAddJugadorModal();
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
const selectedInscripcion = ref<InscripcionTorneoCreadoDTO | null>(null);

const headers = computed(() => [
  { title: "Nick", key: "nick" },
  { title: "Estado Inscripción", key: "estadoInscripcion" },
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

const formattedEstadoInscripcion = (estado: string) => {
  if (estado === "EN PROCESO") {
    return { text: "EN PROCESO", color: "red" };
  } else if (estado === "COMPLETADA") {
    return { text: "COMPLETADA", color: "blue" };
  }
  return { text: "Desconocido", color: "gray" };
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
  selectedInscripcion.value = null;
};
</script>
