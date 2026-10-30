<template>
  <div class="text-left">
    <div v-if="isLoading" class="d-flex justify-center pa-6">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <p
      v-else-if="resumenTorneos.length === 0"
      class="text-body-2 text-medium-emphasis my-4 text-center"
    >
      Aún no ha jugado ningún evento.
    </p>
    <template v-else>
      <!-- Filtros: los chips se envuelven en móvil -->
      <v-chip-group
        v-if="formatos.length > 1"
        v-model="filtroFormato"
        mandatory
        column
        selected-class="text-primary"
      >
        <v-chip value="todos" size="small" filter>Todos ({{ resumenTorneos.length }})</v-chip>
        <v-chip v-for="f in formatos" :key="f" :value="f" size="small" filter>
          {{ plural(f) }} ({{ resumenTorneos.filter(t => t.formato === f).length }})
        </v-chip>
      </v-chip-group>
      <v-text-field
        v-model="search"
        label="Buscar evento"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        clearable
        hide-details
        class="mt-1 mb-3"
      />

      <p v-if="filtrados.length === 0" class="text-body-2 text-medium-emphasis text-center my-4">
        No hay eventos con estos filtros.
      </p>
      <v-card
        v-for="item in visibles"
        :key="item.clave"
        variant="outlined"
        class="mb-2"
      >
        <!-- Pulsando se despliega su actuación -->
        <div class="pa-3 d-flex align-center ga-2 clickable-row" @click="toggleExpand(item.clave)">
          <div class="flex-grow-1 min-w-0">
            <div class="text-body-2 font-weight-bold nombre-torneo">{{ item.nombreTorneo }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.formato }}<template v-if="item.ultimaFecha"> · {{ fecha(item.ultimaFecha) }}</template>
              <template v-if="item.jugadas">
                · {{ item.victorias }}-{{ item.empates }}-{{ item.derrotas }}
              </template>
            </div>
          </div>
          <v-chip
            v-if="item.posicion !== null"
            :color="colorPosicion(item.posicion)"
            variant="flat"
            size="small"
            class="flex-shrink-0"
          >
            {{ textoPosicion(item.posicion, item.totalJugadores) }}
          </v-chip>
          <span v-else class="text-caption text-medium-emphasis">Sin posición</span>
          <v-icon size="small">
            {{ expanded.includes(item.clave) ? "mdi-chevron-up" : "mdi-chevron-down" }}
          </v-icon>
        </div>
        <v-expand-transition>
          <div v-show="expanded.includes(item.clave)" class="px-3 pb-3">
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-if="item.jugadas"
                color="primary"
                variant="flat"
                size="small"
                prepend-icon="mdi-sword-cross"
                append-icon="mdi-chevron-right"
                @click.stop="abrirPartidas(item)"
              >
                {{ item.jugadas }} {{ item.jugadas === 1 ? "partida" : "partidas" }}
              </v-chip>
              <!-- Fondo sólido y texto blanco: en tonal el texto de color apenas contrasta en tema oscuro -->
              <v-chip variant="flat" color="green-darken-2" size="small">
                {{ item.victorias }} V
              </v-chip>
              <v-chip size="small">{{ item.empates }} E</v-chip>
              <v-chip variant="flat" color="red-darken-2" size="small">
                {{ item.derrotas }} D
              </v-chip>
              <v-chip size="small">{{ item.puntosFavor }} pts a favor</v-chip>
              <v-chip size="small">{{ item.puntosContra }} pts en contra</v-chip>
              <v-chip v-if="item.ejercito !== '-'" size="small" prepend-icon="mdi-shield">
                {{ item.ejercito }}
              </v-chip>
            </div>
          </div>
        </v-expand-transition>
      </v-card>
      <!-- Por tandas: con muchos eventos la lista no se hace eterna -->
      <div v-if="filtrados.length > visibles.length" class="text-center mt-2">
        <v-btn variant="tonal" size="small" @click="cuantosVer += TANDA">
          Ver más ({{ filtrados.length - visibles.length }})
        </v-btn>
      </div>
    </template>
  </div>

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
import {
  ejercitoDelJugador,
  idJugadorDelLado,
  juegaEnLado1,
} from "@/utils/partidaParejas";
import { ClasificacionTorneosDTO } from "@/interfaces/Usuario";
import CardPartidaTorneo from "../PartidasTorneo/CardPartidaTorneo.vue";
import { nombreEvento } from "@/Constant/FormatoTorneo";
import { compararPartidasTorneo, textoPosicion } from "@/utils/historialJugador";

interface ResumenTorneo {
  clave: string;
  nombreTorneo: string;
  // Torneo, Liga o Copa
  formato: string;
  posicion: number | null;
  // Cuántos hay en la clasificación final
  totalJugadores: number | null;
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

const search = ref<string | null>("");
const expanded = ref<string[]>([]);
const showPartidas = ref<boolean>(false);
const torneoSeleccionado = ref<ResumenTorneo | null>(null);
const { xs } = useDisplay();
const route = useRoute();

const TANDA = 10;
const cuantosVer = ref(TANDA);
const filtroFormato = ref<string>("todos");
const fecha = (ms: number) => new Date(ms).toLocaleDateString("es-ES");
const plural = (nombre: string) => (nombre === "Torneo" ? "Torneos" : `${nombre}s`);
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const toggleExpand = (clave: string) => {
  expanded.value = expanded.value.includes(clave)
    ? expanded.value.filter(c => c !== clave)
    : [...expanded.value, clave];
};

const abrirPartidas = (torneo: ResumenTorneo) => {
  torneoSeleccionado.value = torneo;
  showPartidas.value = true;
};

// Al pulsar un nick en una partida se navega a otro jugador: cerrar el modal y empezar de cero
watch(
  () => route.params.idUsuario,
  () => {
    showPartidas.value = false;
    expanded.value = [];
    filtroFormato.value = "todos";
    search.value = "";
    cuantosVer.value = TANDA;
  }
);
watch([filtroFormato, search], () => {
  cuantosVer.value = TANDA;
});

// Agrupa por idTorneo; si el back aún no lo envía, por nombre
const claveTorneo = (idTorneo?: number, nombreTorneo?: string) =>
  idTorneo ? `id-${idTorneo}` : `nombre-${nombreTorneo ?? ""}`;

const nuevoResumen = (clave: string, nombreTorneo: string): ResumenTorneo => ({
  clave,
  nombreTorneo,
  formato: "Torneo",
  posicion: null,
  totalJugadores: null,
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

    const esJugador1 = juegaEnLado1(partida, props.idUsuario);
    const propios = esJugador1
      ? partida.resultadoUsuario1
      : partida.resultadoUsuario2;
    const rival = esJugador1
      ? partida.resultadoUsuario2
      : partida.resultadoUsuario1;

    fila.partidas.push(partida);
    fila.formato = nombreEvento(partida.formatoTorneo);
    fila.jugadas++;
    fila.puntosFavor += propios;
    fila.puntosContra += rival;
    if (partida.ganadorPartidaTorneo === idJugadorDelLado(partida, props.idUsuario))
      fila.victorias++;
    else if (!partida.ganadorPartidaTorneo) fila.empates++;
    else fila.derrotas++;

    const fecha = partida.fechaPartida
      ? new Date(partida.fechaPartida).getTime()
      : 0;
    fila.ultimaFecha = Math.max(fila.ultimaFecha, fecha);

    const ejercito = ejercitoDelJugador(partida, props.idUsuario);
    if (ejercito && ejercito !== "N/A") {
      ejercitos.set(clave, [...(ejercitos.get(clave) ?? []), ejercito]);
    }
  });

  ejercitos.forEach((lista, clave) => {
    obtenerFila(clave, "-").ejercito = ejercitoMasJugado(lista);
  });

  // En el modal, las partidas en orden de juego
  resumen.forEach(fila => fila.partidas.sort(compararPartidasTorneo));

  // La posición viene de la clasificación guardada al cerrar el torneo
  (props.clasificacionTorneos ?? []).forEach(clasificacion => {
    const clave = claveTorneo(clasificacion.idTorneo, clasificacion.nombreTorneo);
    const fila = obtenerFila(clave, clasificacion.nombreTorneo);
    fila.posicion = clasificacion.resultado;
    fila.totalJugadores = clasificacion.totalJugadores ?? null;
  });

  return [...resumen.values()].sort((a, b) => b.ultimaFecha - a.ultimaFecha);
});

// Torneo, Liga o Copa: el filtro solo sale si ha jugado más de uno
const formatos = computed(() => [...new Set(resumenTorneos.value.map(t => t.formato))]);
const filtrados = computed(() => {
  const texto = normalizar(search.value ?? "").trim();
  return resumenTorneos.value.filter(
    t =>
      (filtroFormato.value === "todos" || t.formato === filtroFormato.value) &&
      (!texto || normalizar(t.nombreTorneo).includes(texto))
  );
});
const visibles = computed(() => filtrados.value.slice(0, cuantosVer.value));

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
