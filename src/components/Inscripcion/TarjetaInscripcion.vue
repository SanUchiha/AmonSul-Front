<template>
  <!-- Un evento en el que estás inscrito: qué es, cuándo, cómo va tu inscripción y a dónde ir -->
  <v-card variant="outlined" class="pa-3 h-100 d-flex flex-column text-left">
    <div class="d-flex align-start ga-2">
      <div class="text-body-1 font-weight-bold nombre flex-grow-1">
        {{ inscripcion.torneo.nombreTorneo }}
      </div>
      <v-chip v-if="enCurso" size="x-small" color="success" variant="tonal" class="flex-shrink-0 mt-1">
        En curso
      </v-chip>
    </div>
    <div class="text-caption text-medium-emphasis">
      {{ fechas }} · {{ nombreEvento(inscripcion.torneo.formatoTorneo) }} · {{ tipo }}
    </div>

    <!-- Cómo va la inscripción, solo mientras se puede arreglar -->
    <div v-if="!terminado && inscripcion.estadoLista" class="text-caption mt-1">
      <span :class="`text-${lista.color}`">{{ lista.texto }}</span>
      <span class="text-medium-emphasis"> · </span>
      <span :class="pagado ? 'text-success' : 'text-warning'">{{ pagado ? "Pagado" : "Sin pagar" }}</span>
    </div>
    <div v-if="inscripcion.ejercitoElegido" class="text-caption text-medium-emphasis mt-1">
      {{ inscripcion.ejercitoElegido }}
    </div>

    <v-spacer />
    <!-- Los tres en una fila, a partes iguales: sin mayúsculas caben en el móvil -->
    <div class="d-flex ga-1 mt-3">
      <v-btn
        size="small"
        variant="tonal"
        class="accion text-none"
        :to="`/detalle-torneo/${inscripcion.idTorneo}`"
      >
        Ver evento
      </v-btn>
      <v-btn size="small" variant="tonal" class="accion text-none" @click="emit('verInscripcion', inscripcion)">
        Inscripción
      </v-btn>
      <v-btn size="small" variant="tonal" class="accion text-none" :to="rutaResultados">
        {{ textoResultados }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from "vue";
import { esPorJornadas, nombreEvento, textosEvento } from "@/Constant/FormatoTorneo";
import { tipoTorneoOptions } from "@/Constant/TiposTorneo";
import { formatFechaSpaWhitoutAsync } from "@/utils/Fecha";
import { estadoLista } from "@/utils/estadoLista";
import {
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
.accion {
  flex: 1 1 0;
  min-width: 0;
  padding-inline: 4px;
}
</style>
