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
import { Torneo, TorneoGestionInfoMasDTO } from "@/interfaces/Torneo";
import { computed, defineProps, ref } from "vue";

import { getTorneo } from "@/services/TorneosService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalModificarBasesTorneo from "../ModalModificarBasesTorneo.vue";
import ModalModificarTorneo from "../ModalModificarTorneo.vue";

const props = defineProps<{ torneo: TorneoGestionInfoMasDTO | null }>();
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const showModificarTorneoModal = ref<boolean>(false);
const showModificarBasesTorneoModal = ref<boolean>(false);

const idTorneo = ref<number>(0);
const isLoading = ref<boolean>(false);
const torneoMod = ref<Torneo>();

const plazasRestantes = computed(() => {
  if (!props.torneo || props.torneo.inscripciones.length === null) {
    return "Sin límite";
  }
  if (props.torneo.torneo.limiteParticipantes == null) return "Sin límite";
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
