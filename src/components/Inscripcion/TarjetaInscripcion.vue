<template>
  <!-- Un evento en el que estás inscrito: qué es, cuándo, cómo va tu inscripción y a dónde ir -->
  <v-card variant="outlined" class="pa-3 h-100 d-flex flex-column text-left">
    <div class="text-body-1 font-weight-bold nombre">{{ inscripcion.torneo.nombreTorneo }}</div>
    <div class="text-caption text-medium-emphasis">{{ fechas }}</div>

    <div class="d-flex flex-wrap ga-1 mt-2">
      <v-chip size="small" variant="tonal">{{ nombreEvento(inscripcion.torneo.formatoTorneo) }}</v-chip>
      <v-chip size="small" variant="tonal">{{ tipo }}</v-chip>
      <v-chip
        v-if="enCurso"
        size="small"
        color="success"
        variant="flat"
        prepend-icon="mdi-sword-cross"
      >
        En curso
      </v-chip>
    </div>

    <!-- Cómo va la inscripción: lo que aún se puede arreglar antes de jugar -->
    <div v-if="!terminado && inscripcion.estadoLista" class="d-flex flex-wrap ga-1 mt-2">
      <v-chip size="small" variant="tonal" :color="lista.color" prepend-icon="mdi-file-document-outline">
        {{ lista.texto }}
      </v-chip>
      <v-chip
        size="small"
        variant="tonal"
        :color="pagado ? 'success' : 'warning'"
        prepend-icon="mdi-cash"
      >
        {{ pagado ? "Pagado" : "Sin pagar" }}
      </v-chip>
    </div>
    <div v-if="inscripcion.ejercitoElegido" class="text-caption mt-2">
      <v-icon size="x-small" icon="mdi-shield" /> {{ inscripcion.ejercitoElegido }}
    </div>

    <v-spacer />
    <div class="d-flex flex-wrap ga-2 mt-3">
      <v-btn size="small" variant="tonal" color="primary" :to="`/detalle-torneo/${inscripcion.idTorneo}`">
        Ver evento
      </v-btn>
      <v-btn size="small" variant="tonal" @click="emit('verInscripcion', inscripcion)">
        Mi inscripción
      </v-btn>
      <v-btn size="small" variant="tonal" :to="rutaResultados">{{ textoResultados }}</v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from "vue";
import { esPorJornadas, nombreEvento, textosEvento } from "@/Constant/FormatoTorneo";
import { tipoTorneoOptions } from "@/Constant/TiposTorneo";
import { formatFechaSpaWhitoutAsync } from "@/utils/Fecha";
import {
  estadoLista,
  estaEnCurso,
  haTerminado,
  MiInscripcion,
  primerDia,
  ultimoDia,
} from "@/utils/misEventos";

const props = defineProps<{
  inscripcion: MiInscripcion;
}>();
const emit = defineEmits<{
  (e: "verInscripcion", inscripcion: MiInscripcion): void;
}>();

const terminado = computed(() => haTerminado(props.inscripcion));
const enCurso = computed(() => estaEnCurso(props.inscripcion));

const fechas = computed(() => {
  const inicio = primerDia(props.inscripcion);
  const fin = ultimoDia(props.inscripcion);
  return fin > inicio
    ? `Del ${formatFechaSpaWhitoutAsync(inicio)} al ${formatFechaSpaWhitoutAsync(fin)}`
    : formatFechaSpaWhitoutAsync(inicio);
});

const tipo = computed(
  () =>
    tipoTorneoOptions.find(t => t.value === props.inscripcion.torneo.tipoTorneo)?.label ??
    props.inscripcion.torneo.tipoTorneo
);

const lista = computed(() => estadoLista(props.inscripcion.estadoLista));
const pagado = computed(
  () => props.inscripcion.esPago === true || String(props.inscripcion.esPago).toUpperCase() === "SI"
);

const textoResultados = computed(() =>
  esPorJornadas(props.inscripcion.torneo.formatoTorneo)
    ? `Ver ${textosEvento(props.inscripcion.torneo.formatoTorneo).el}`
    : "Resultados"
);
const rutaResultados = computed(() => {
  const { idTorneo, porEquipos, torneo } = props.inscripcion;
  if (porEquipos) return `/detalle-torneo-live-equipos/${idTorneo}`;
  if (torneo.tipoTorneo === "Individual" && torneo.listasPorJugador > 1)
    return `/detalle-torneo-live-mas/${idTorneo}`;
  return `/detalle-torneo-live/${idTorneo}`;
});
</script>

<style scoped>
.nombre {
  overflow-wrap: anywhere;
}
</style>
