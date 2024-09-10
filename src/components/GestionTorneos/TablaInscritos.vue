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
    <!-- <div class="text-center pa-4">
      <v-btn @click="openConfigModal" color="primary" large>
        Generar Ronda
      </v-btn>
    </div> -->

    <ModalParametrosPrimeraRonda
      :isVisible="showConfigModal"
      :torneo="torneo"
      @close="closeConfigModal"
      @confirm="handleConfigConfirm"
    />
  </v-card>

  <ModalDetalleInscripcion
    v-if="showModal"
    :inscripcion="selectedInscripcion"
    @close="closeModal"
    @update-inscripcion="handleUpdateInscripcion"
    @eliminar-inscripcion="handleEliminarInscripcion"
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

// Define las propiedades
const props = defineProps<{ torneo: TorneoGestionInfoDTO | null }>();

// Crear una copia reactiva de las inscripciones
const localInscripciones = ref<InscripcionTorneoCreadoDTO[]>([]);
const isLoading = ref(true);

const showConfigModal = ref(false);

const openConfigModal = () => {
  showConfigModal.value = true;
};

const closeConfigModal = () => {
  showConfigModal.value = false;
};

const handleConfigConfirm = (configuracion: any) => {
  closeConfigModal();

  // Aquí puedes agregar la lógica para usar la configuración, como generar los pairings.
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

// Cierra el modal
const closeModal = () => {
  showModal.value = false;
  selectedInscripcion.value = null;
};

const generatePairings = () => {
  if (props.torneo) {
    const torneoId = props.torneo.torneo.idTorneo;
  }
};
</script>

<style scoped>
/* Añadir estilos personalizados si es necesario */
</style>
