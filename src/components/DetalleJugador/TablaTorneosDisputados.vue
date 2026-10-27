<template>
  <v-card class="section-card stats-section pt-0 mt-0">
    <v-col cols="12">
      <p class="text-h5 ringbearer">Resultados en Torneos</p>
    </v-col>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="resumenTorneos"
      :loading="isLoading"
      class="elevation-1"
      :items-per-page="10"
      :search="search"
      no-data-text="No ha jugado torneos"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Buscar torneo"
          class="mx-4 my-2"
          clearable
        />
      </template>
      <template v-slot:item="{ item }">
        <tr @click="toggleExpand(item.clave)" class="clickable-row">
          <td class="nombre-torneo">{{ item.nombreTorneo }}</td>
          <td class="text-center px-1">
            <v-chip
              v-if="item.posicion !== null"
              :color="colorPosicion(item.posicion)"
              prepend-icon="mdi-trophy"
              variant="flat"
              size="small"
            >
              {{ item.posicion }}º
            </v-chip>
            <span v-else class="text-medium-emphasis">-</span>
          </td>
          <td class="text-right px-1">
            <v-icon>
              {{
                expanded.includes(item.clave)
                  ? "mdi-chevron-up"
                  : "mdi-chevron-down"
              }}
            </v-icon>
          </td>
        </tr>

        <!-- Expandido: resultados del jugador en el torneo -->
        <tr v-if="expanded.includes(item.clave)">
          <td colspan="3" class="py-3">
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                color="primary"
                variant="flat"
                prepend-icon="mdi-sword-cross"
                append-icon="mdi-chevron-right"
                @click.stop="abrirPartidas(item)"
              >
                {{ item.jugadas }} partidas
              </v-chip>
              <!-- Fondo sólido y texto blanco: en tonal el texto de color apenas contrasta en tema oscuro -->
              <v-chip variant="flat" color="green-darken-2">
                {{ item.victorias }} V
              </v-chip>
              <v-chip>{{ item.empates }} E</v-chip>
              <v-chip variant="flat" color="red-darken-2">
                {{ item.derrotas }} D
              </v-chip>
              <v-chip>{{ item.puntosFavor }} pts a favor</v-chip>
              <v-chip>{{ item.puntosContra }} pts en contra</v-chip>
              <v-chip v-if="item.ejercito !== '-'" prepend-icon="mdi-shield">
                {{ item.ejercito }}
              </v-chip>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>

  <!-- Modal partidas del torneo: pantalla completa en móvil -->
  <v-dialog
    v-model="showPartidas"
    :fullscreen="xs"
    max-width="600"
    scrollable
  >
    <v-card>
      <!-- text-wrap y min-w-0: un nombre largo se parte en líneas sin empujar el aspa fuera -->
      <v-card-title class="d-flex align-start ga-2 text-wrap">
        <span
          class="nombre-torneo flex-grow-1 min-w-0 text-subtitle-1 text-sm-h6 pt-1"
        >
          {{ torneoSeleccionado?.nombreTorneo }}
        </span>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          class="flex-shrink-0"
          aria-label="Cerrar"
          @click="showPartidas = false"
        />
      </v-card-title>
      <v-divider />
      <v-card-text class="px-2 px-sm-4">
        <CardPartidaTorneo
          v-for="partida in torneoSeleccionado?.partidas"
          :key="partida.idPartidaTorneo"
          :match="partida"
          :idUsuario="idUsuario"
          :mostrarTorneo="false"
          class="mb-3"
        />
      </v-card-text>
      <v-divider />
      <!-- Fijo abajo (diálogo scrollable): a mano del pulgar en móvil -->
      <v-card-actions class="pa-3">
        <v-spacer v-if="!xs" />
        <v-btn
          :block="xs"
          variant="tonal"
          color="secondary"
          @click="showPartidas = false"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay } from "vuetify";
import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";
import { ClasificacionTorneosDTO } from "@/interfaces/Usuario";
import CardPartidaTorneo from "../PartidasTorneo/CardPartidaTorneo.vue";

interface ResumenTorneo {
  clave: string;
  nombreTorneo: string;
  posicion: number | null;
  partidas: ViewPartidaTorneoDTO[];
  jugadas: number;
  victorias: number;
  empates: number;
  derrotas: number;
  puntosFavor: number;
  puntosContra: number;
  ejercito: string;
  ultimaFecha: number;
}

// eslint-disable-next-line no-undef
const props = defineProps<{
  clasificacionTorneos: ClasificacionTorneosDTO[];
  tournamentMatches: ViewPartidaTorneoDTO[];
  idUsuario: number;
  isLoading?: boolean;
}>();

const search = ref("");
const expanded = ref<string[]>([]);
const showPartidas = ref<boolean>(false);
const torneoSeleccionado = ref<ResumenTorneo | null>(null);
const { xs } = useDisplay();
const route = useRoute();

const headers = [
  { title: "Torneo", key: "nombreTorneo" },
  { title: "Pos", key: "posicion", align: "center" as const },
  { title: "", key: "expandir", sortable: false },
];

const toggleExpand = (clave: string) => {
  expanded.value = expanded.value.includes(clave)
    ? expanded.value.filter(c => c !== clave)
    : [...expanded.value, clave];
};

const abrirPartidas = (torneo: ResumenTorneo) => {
  torneoSeleccionado.value = torneo;
  showPartidas.value = true;
};

// Al pulsar un nick en una partida se navega a otro jugador: cerrar el modal
watch(
  () => route.params.idUsuario,
  () => {
    showPartidas.value = false;
    expanded.value = [];
  }
);

// Agrupa por idTorneo; si el back aún no lo envía, por nombre
const claveTorneo = (idTorneo?: number, nombreTorneo?: string) =>
  idTorneo ? `id-${idTorneo}` : `nombre-${nombreTorneo ?? ""}`;

const nuevoResumen = (clave: string, nombreTorneo: string): ResumenTorneo => ({
  clave,
  nombreTorneo,
  posicion: null,
  partidas: [],
  jugadas: 0,
  victorias: 0,
  empates: 0,
  derrotas: 0,
  puntosFavor: 0,
  puntosContra: 0,
  ejercito: "-",
  ultimaFecha: 0,
});

const ejercitoMasJugado = (ejercitos: string[]): string => {
  const conteo = new Map<string, number>();
  ejercitos.forEach(e => conteo.set(e, (conteo.get(e) ?? 0) + 1));
  let masJugado = "-";
  let maximo = 0;
  conteo.forEach((veces, ejercito) => {
    if (veces > maximo) {
      masJugado = ejercito;
      maximo = veces;
    }
  });
  return masJugado;
};

const resumenTorneos = computed<ResumenTorneo[]>(() => {
  const resumen = new Map<string, ResumenTorneo>();
  const ejercitos = new Map<string, string[]>();

  const obtenerFila = (clave: string, nombreTorneo: string): ResumenTorneo => {
    let fila = resumen.get(clave);
    if (!fila) {
      fila = nuevoResumen(clave, nombreTorneo);
      resumen.set(clave, fila);
    }
    return fila;
  };

  (props.tournamentMatches ?? []).forEach(partida => {
    // Partidas sin resultado todavía (ronda en juego) no cuentan
    if (partida.resultadoUsuario1 == null || partida.resultadoUsuario2 == null)
      return;

    const clave = claveTorneo(partida.idTorneo, partida.nombreTorneo);
    const fila = obtenerFila(clave, partida.nombreTorneo ?? "-");

    const esJugador1 = partida.idUsuario1 === props.idUsuario;
    const propios = esJugador1
      ? partida.resultadoUsuario1
      : partida.resultadoUsuario2;
    const rival = esJugador1
      ? partida.resultadoUsuario2
      : partida.resultadoUsuario1;

    fila.partidas.push(partida);
    fila.jugadas++;
    fila.puntosFavor += propios;
    fila.puntosContra += rival;
    if (partida.ganadorPartidaTorneo === props.idUsuario) fila.victorias++;
    else if (!partida.ganadorPartidaTorneo) fila.empates++;
    else fila.derrotas++;

    const fecha = partida.fechaPartida
      ? new Date(partida.fechaPartida).getTime()
      : 0;
    fila.ultimaFecha = Math.max(fila.ultimaFecha, fecha);

    const ejercito = esJugador1
      ? partida.ejercitoUsuario1
      : partida.ejercitoUsuario2;
    if (ejercito && ejercito !== "N/A") {
      ejercitos.set(clave, [...(ejercitos.get(clave) ?? []), ejercito]);
    }
  });

  ejercitos.forEach((lista, clave) => {
    obtenerFila(clave, "-").ejercito = ejercitoMasJugado(lista);
  });

  // En el modal, las partidas en orden de juego
  const fechaPartida = (p: ViewPartidaTorneoDTO) =>
    p.fechaPartida ? new Date(p.fechaPartida).getTime() : 0;
  resumen.forEach(fila =>
    fila.partidas.sort(
      (a, b) =>
        fechaPartida(a) - fechaPartida(b) || a.idPartidaTorneo - b.idPartidaTorneo
    )
  );

  // La posición viene de la clasificación guardada al cerrar el torneo
  (props.clasificacionTorneos ?? []).forEach(clasificacion => {
    const clave = claveTorneo(clasificacion.idTorneo, clasificacion.nombreTorneo);
    obtenerFila(clave, clasificacion.nombreTorneo).posicion =
      clasificacion.resultado;
  });

  return [...resumen.values()].sort((a, b) => b.ultimaFecha - a.ultimaFecha);
});

const colorPosicion = (posicion: number) => {
  if (posicion === 1) return "amber-darken-2";
  if (posicion === 2) return "blue-grey-lighten-1";
  if (posicion === 3) return "brown-lighten-1";
  return "primary";
};
</script>

<style scoped>
.clickable-row {
  cursor: pointer;
}

/* La vista padre centra el texto; el nombre se alinea a la izquierda y puede partirse en móvil */
.nombre-torneo {
  text-align: left;
  overflow-wrap: anywhere;
}

.min-w-0 {
  min-width: 0;
}
</style>
