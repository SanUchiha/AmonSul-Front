<template>
  <v-card v-if="torneo" class="mb-4 pa-4">
    <v-card-title class="text-h6 font-weight-bold align-center">
      {{ torneo.torneo.nombreTorneo }}
    </v-card-title>

    <v-divider class="mt-3"></v-divider>

    <v-card-text class="text-body-2">
      <v-row dense>
        <!-- Fecha de entrega de listas -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="blue">mdi-calendar-clock</v-icon>
          <span
            ><strong>Fin entrega de listas:</strong>
            {{ formatDate(torneo.torneo.fechaEntregaListas) }}</span
          >
        </v-col>

        <!-- Inicio inscripción -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="green">mdi-calendar-plus</v-icon>
          <span
            ><strong>Inicio de inscripción:</strong>
            {{ formatDate(torneo.torneo.inicioInscripciones) }}</span
          >
        </v-col>

        <!-- Fin de inscripción -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="red">mdi-calendar-remove</v-icon>
          <span
            ><strong>Fin de inscripción:</strong>
            {{ formatDate(torneo.torneo.fechaFinInscripcion) }}</span
          >
        </v-col>

        <!-- Equipos inscritos -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="yellow">mdi-account-group</v-icon>
          <span><strong>Equipos inscritos:</strong> {{ totalEquipos }}</span>
        </v-col>

        <!-- Plazas restantes -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="orange">mdi-seat-outline</v-icon>
          <span><strong>Plazas restantes:</strong> {{ plazasRestantes }}</span>
        </v-col>

        <!-- Pagos realizados -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="green">mdi-cash-multiple</v-icon>
          <span
            ><strong>Pagos:</strong> {{ pagosRealizados }}/{{
              totalEquipos
            }}</span
          >
        </v-col>

        <!-- Listas entregadas -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="blue">mdi-file-document</v-icon>
          <span
            ><strong>Listas entregadas:</strong> {{ listasEntregadas }}/{{
              totalJugadores
            }}</span
          >
        </v-col>

        <!-- Listas legales -->
        <v-col cols="12" sm="6" class="d-flex align-center">
          <v-icon class="me-2" color="purple">mdi-file-check</v-icon>
          <span
            ><strong>Listas legales:</strong> {{ listasLegales }}/{{
              totalJugadores
            }}</span
          >
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider class="my-2" />

    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn
            variant="tonal"
            color="secondary"
            @click="modificarTorneo"
            block
            >Modificar torneo</v-btn
          >
        </v-col>
        <v-col>
          <v-btn
            variant="tonal"
            color="secondary"
            @click="modificarBasesTorneo"
            block
            >Modificar bases</v-btn
          >
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>

  <!-- modal para modificar el torneo -->
  <ModalModificarTorneo
    :isVisible="showModificarTorneoModal"
    :torneo="torneoMod"
    @close="cerrarModalModificarTorneo()"
  />

  <!-- modal para modificar el torneo -->
  <ModalModificarBasesTorneo
    :isVisible="showModificarBasesTorneoModal"
    :torneo="torneoMod"
    @close="cerrarModalModificarBasesTorneo()"
  />
  <!-- modal torneo modificado con exito -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Torneo modificado con exito."
    @update:isVisible="showSuccessModal = $event"
  />
  <!-- modal Error al modificar el torneo -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se han podido modificar el torneo. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { computed, defineProps, ref } from "vue";
import { getTorneo } from "@/services/TorneosService";
import ModalModificarBasesTorneo from "../ModalModificarBasesTorneo.vue";
import ModalModificarTorneo from "../ModalModificarTorneo.vue";
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";

const props = defineProps<{ torneo: TorneoEquipoGestionInfoDTO | null }>();
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const showModificarTorneoModal = ref<boolean>(false);
const showModificarBasesTorneoModal = ref<boolean>(false);

const idTorneo = ref<number>(0);
const isLoading = ref<boolean>(false);
const torneoMod = ref<Torneo>({
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
  tipoTorneo: "Individual",
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
});

const plazasRestantes = computed(() => {
  if (!props.torneo || props.torneo.torneo.limiteParticipantes === null) {
    return "Sin límite";
  }
  if (props.torneo.torneo.limiteParticipantes) {
    return props.torneo.torneo.limiteParticipantes - totalEquipos.value;
  }
  return "Sin límite";
});

const totalEquipos = computed(() => {
  return props.torneo ? props.torneo.equipos.length : 0;
});

const jugadoresXEquipo = computed(() => {
  return props.torneo ? props.torneo.torneo.jugadoresXEquipo : 0;
});

const totalJugadores = computed(() => {
  return totalEquipos.value * jugadoresXEquipo.value;
});

const pagosRealizados = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.equipos.filter((equipo) => equipo.esPago === "SI").length;
});

const listasLegales = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.equipos.reduce((contador, equipo) => {
    // Para cada equipo, contamos cuántas inscripciones cumplen con los estados
    const listas = equipo.inscripciones.filter(
      (lista) => lista.estadoLista === "OK"
    ).length;

    // Sumamos el número de listas válidas al contador
    return contador + listas;
  }, 0);
});

const listasEntregadas = computed(() => {
  if (!props.torneo) return 0;

  return props.torneo.equipos.reduce((contador, equipo) => {
    // Para cada equipo, contamos cuántas inscripciones cumplen con los estados
    const listas = equipo.inscripciones.filter(
      (lista) =>
        lista.estadoLista === "OK" ||
        lista.estadoLista === "ENTREGADA" ||
        lista.estadoLista === "ILEGAL"
    ).length;

    // Sumamos el número de listas válidas al contador
    return contador + listas;
  }, 0);
});

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

const modificarTorneo = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModificarTorneoModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
};

const modificarBasesTorneo = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModificarBasesTorneoModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
};

const cerrarModalModificarTorneo = async () => {
  showModificarTorneoModal.value = false;
};

const cerrarModalModificarBasesTorneo = async () => {
  showModificarBasesTorneoModal.value = false;
};
</script>
<style scoped>
.responsive-text {
  font-size: 16px; /* Tamaño base */
  text-align: center;
}

@media (max-width: 768px) {
  .responsive-text {
    font-size: 14px; /* Tamaño más pequeño para móviles */
  }
}

@media (max-width: 480px) {
  .responsive-text {
    font-size: 12px; /* Ajuste adicional para pantallas muy pequeñas */
  }
}
</style>
