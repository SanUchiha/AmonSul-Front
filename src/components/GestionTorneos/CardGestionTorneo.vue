<template>
  <v-card v-if="torneo" class="mb-4">
    <v-card-title>{{ torneo.torneo.nombreTorneo }}</v-card-title>
    <v-card-text>
      <p><strong>Plazas restantes:</strong> {{ plazasRestantes }}</p>
      <p>
        <strong>Fin entrega de listas:</strong>
        {{ formatDate(torneo.torneo.fechaEntregaListas) }}
      </p>
      <p>
        <strong>Fin de inscripción:</strong>
        {{ formatDate(torneo.torneo.fechaFinInscripcion) }}
      </p>
      <p>
        <strong>Pagos: :</strong>
        {{ pagosRealizados }}/{{ totalInscripciones }}
      </p>
      <p>
        <strong>Listas entregadas: :</strong>
        {{ listasEntregadas }}/{{ totalInscripciones }}
      </p>
      <p>
        <strong>Listas legales: :</strong>
        {{ listasLegales }}/{{ totalInscripciones }}
      </p>
      <p><strong>Listas de luz:</strong> {{ listasLuz }}</p>
      <p><strong>Listas de oscuridad:</strong> {{ listasOscuridad }}</p>
    </v-card-text>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          <div class="flex-column align-items-center">
            <!-- <v-btn
              class="mt-2"
              variant="tonal"
              color="secondary"
              @click="modificarTorneo()"
            >
              Modificar torneo
            </v-btn> -->
            <div class="text-wrap text-sm">
              <v-btn
                class="mt-2"
                variant="tonal"
                color="secondary"
                @click="modificarTorneo()"
              >
                Modificar torneo
              </v-btn>
            </div>

            <div class="text-wrap text-sm">
              <v-btn
                class="mt-2"
                variant="tonal"
                color="secondary"
                @click="modificarBasesTorneo()"
              >
                Modificar bases
              </v-btn>
            </div>

            <div class="text-wrap text-sm">
              <v-btn
                class="mt-2"
                variant="tonal"
                color="secondary"
                @click="handlerMostrarListas"
              >
                {{ mostrarListas ? "Ocultar" : "Mostrar" }} Listas
              </v-btn>

              <div class="text-wrap text-sm">
                <v-btn
                  class="mt-2"
                  variant="tonal"
                  color="secondary"
                  @click="handlerMostrarClasificacion"
                >
                  {{ mostrarClasificacion ? "Ocultar" : "Mostrar" }}
                  Clasificacion
                </v-btn>
              </div>
            </div>

            <v-spacer class="my-4"></v-spacer>

            <CardAddTorneoLiga :idTorneo="props.torneo?.torneo.idTorneo!" />
          </div>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-card>

  <!-- modal para modificar el torneo -->
  <ModalModificarTorneo
    :isVisible="showModificarTorneoModal"
    :torneo="torneoMod"
    @close="cerrarModal()"
  />

  <!-- modal para modificar el torneo -->
  <ModalModificarBasesTorneo
    :isVisible="showModificarBasesTorneoModal"
    :torneo="torneoMod"
    @close="cerrarModal()"
  />

  <!-- modal para manejar mostrar listas del torneo -->
  <ModalHandlerMostrarListas
    :isVisible="showModalHandlerMostrarListas"
    :torneo="torneoMod"
    @close="cerrarModal()"
    @confirm="onCambioMostrarListas"
  />

  <!-- modal para manejar mostrar listas del torneo -->
  <ModalHandlerMostrarClasificacion
    :isVisible="showModalHandlerMostrarClasificacion"
    :torneo="torneoMod"
    @close="cerrarModal()"
    @confirm="onCambioMostrarClasificacion"
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
import { Torneo, TorneoGestionInfoDTO } from "@/interfaces/Torneo";
import { computed, defineProps, ref } from "vue";
import ModalModificarTorneo from "./ModalModificarTorneo.vue";
import { getTorneo } from "@/services/TorneosService";
import ModalModificarBasesTorneo from "./ModalModificarBasesTorneo.vue";
import CardAddTorneoLiga from "./CardAddTorneoLiga.vue";
import ModalHandlerMostrarListas from "./ModalHandlerMostrarListas.vue";
import ModalHandlerMostrarClasificacion from "./ModalHandlerMostrarClasificacion.vue";

const props = defineProps<{ torneo: TorneoGestionInfoDTO | null }>();
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const showModificarTorneoModal = ref<boolean>(false);
const showModificarBasesTorneoModal = ref<boolean>(false);
const showModalHandlerMostrarListas = ref<boolean>(false);
const showModalHandlerMostrarClasificacion = ref<boolean>(false);
const mostrarListas = ref(props.torneo?.torneo.mostrarListas);
const mostrarClasificacion = ref(props.torneo?.torneo.mostrarClasificacion);

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
  mostrarListas: false,
  mostrarClasificacion: false,
});

const plazasRestantes = computed(() => {
  if (
    !props.torneo ||
    props.torneo.inscripciones.length == undefined ||
    props.torneo.torneo.limiteParticipantes == null
  ) {
    return "Sin límite";
  }
  return (
    props.torneo.torneo.limiteParticipantes - props.torneo.inscripciones.length
  );
});

const listasLuz = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter((i) => i.bando === "good").length;
});

const listasOscuridad = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter((i) => i.bando === "evil").length;
});

const totalInscripciones = computed(() => {
  return props.torneo ? props.torneo.inscripciones.length : 0;
});

const pagosRealizados = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(
    (inscripcion) => inscripcion.esPago === "SI"
  ).length;
});

const listasLegales = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(
    (inscripcion) => inscripcion.estadoLista === "OK"
  ).length;
});

const listasEntregadas = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(
    (inscripcion) =>
      inscripcion.estadoLista === "ENTREGADA" ||
      inscripcion.estadoLista === "OK" ||
      inscripcion.estadoLista === "ILEGAL"
  ).length;
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

const cerrarModal = async () => {
  showModificarBasesTorneoModal.value = false;
  showModificarTorneoModal.value = false;
  showModalHandlerMostrarListas.value = false;
  showModalHandlerMostrarClasificacion.value = false;
};

const onCambioMostrarListas = (nuevoValor: boolean) => {
  mostrarListas.value = nuevoValor;
  showModalHandlerMostrarListas.value = false;
};

const onCambioMostrarClasificacion = (nuevoValor: boolean) => {
  mostrarClasificacion.value = nuevoValor;
  showModalHandlerMostrarClasificacion.value = false;
};

const handlerMostrarListas = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModalHandlerMostrarListas.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
};

const handlerMostrarClasificacion = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModalHandlerMostrarClasificacion.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
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
