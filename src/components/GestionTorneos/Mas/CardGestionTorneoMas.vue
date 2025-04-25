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
        {{ listasEntregadas }}/{{ listasTotales }}
      </p>
      <p>
        <strong>Listas legales: :</strong>
        {{ listasLegales }}/{{ listasTotales }}
      </p>
      <p><strong>Listas de luz:</strong> {{ listasLuz }}</p>
      <p><strong>Listas de oscuridad:</strong> {{ listasOscuridad }}</p>
    </v-card-text>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          <div class="flex-column align-items-center">
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
          </div>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
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
import { computed, defineProps, ref } from "vue";
import { TorneoGestionInfoMasDTO, Torneo } from "@/interfaces/Torneo";
import { getTorneo } from "@/services/TorneosService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalModificarBasesTorneo from "../ModalModificarBasesTorneo.vue";
import ModalModificarTorneo from "../ModalModificarTorneo.vue";

const props = defineProps<{ torneo: TorneoGestionInfoMasDTO }>();
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const showModificarTorneoModal = ref<boolean>(false);
const showModificarBasesTorneoModal = ref<boolean>(false);

const idTorneo = ref<number>(0);
const torneoMod = ref<Torneo>(); // Define adecuadamente el tipo de `torneoMod`

// Calculando plazas restantes
const plazasRestantes = computed(() => {
  if (!props.torneo || props.torneo.inscripciones.length === null) {
    return "Sin límite";
  }
  if (props.torneo.torneo.limiteParticipantes == null) return "Sin límite";
  return (
    props.torneo.torneo.limiteParticipantes - props.torneo.inscripciones.length
  );
});

// array con todas las listas
const todasLasListas = computed(() => {
  if (!props.torneo || !props.torneo.inscripciones) return [];

  return props.torneo.inscripciones.flatMap((inscripcion) => inscripcion.lista);
});

// Listas por jugador
const listasTotales = computed(() => {
  if (!props.torneo) return 0;
  return (
    props.torneo.torneo.listasPorJugador * props.torneo.inscripciones.length
  );
});

// Listas de luz
const listasLuz = computed(() => {
  if (!props.torneo) return 0;
  return todasLasListas.value.filter((l) => l.bando === "good").length;
});

// Listas de oscuridad
const listasOscuridad = computed(() => {
  if (!props.torneo) return 0;
  return todasLasListas.value.filter((l) => l.bando === "evil").length;
});

// Total de inscripciones
const totalInscripciones = computed(() => {
  return props.torneo ? props.torneo.inscripciones.length : 0;
});

// Pagos realizados
const pagosRealizados = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(
    (inscripcion) => inscripcion.esPago === "SI"
  ).length;
});

// Listas legales
const listasLegales = computed(() => {
  if (!props.torneo) return 0;
  return todasLasListas.value.filter((l) => l.estadoLista == "OK").length;
});

// Listas entregadas
const listasEntregadas = computed(() => {
  if (!props.torneo) return 0;
  return todasLasListas.value.filter(
    (l) =>
      l.estadoLista == "ENTREGADA" ||
      l.estadoLista === "ILEGAL" ||
      l.estadoLista === "OK"
  ).length;
});

// Función para formatear fechas
const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

// Modificar torneo
const modificarTorneo = async () => {
  if (props.torneo?.torneo.idTorneo != undefined) {
    idTorneo.value = props.torneo?.torneo.idTorneo;

    try {
      const responseTorneo = await getTorneo(idTorneo.value);
      torneoMod.value = responseTorneo.data;
      showModificarTorneoModal.value = true;
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
    }
  }
};

// Modificar bases del torneo
const modificarBasesTorneo = async () => {
  if (props.torneo?.torneo.idTorneo != undefined) {
    idTorneo.value = props.torneo?.torneo.idTorneo;

    try {
      const responseTorneo = await getTorneo(idTorneo.value);
      torneoMod.value = responseTorneo.data;
      showModificarBasesTorneoModal.value = true;
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
    }
  }
};

// Cerrar modal modificar torneo
const cerrarModalModificarTorneo = () => {
  showModificarTorneoModal.value = false;
};

// Cerrar modal modificar bases
const cerrarModalModificarBasesTorneo = () => {
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
