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
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { TorneoGestionInfoDTO } from "@/interfaces/Torneo";
import { computed, defineProps } from "vue";

const props = defineProps<{ torneo: TorneoGestionInfoDTO | null }>();

const plazasRestantes = computed(() => {
  if (!props.torneo || props.torneo.inscripciones.length === null) {
    return "Sin límite";
  }
  return (
    props.torneo.torneo.limiteParticipantes! - props.torneo.inscripciones.length
  );
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
</script>
