<template>
  <!-- Card de partida de solo lectura, sobria y minimalista. La usan las partidas de torneo y amistosas -->
  <v-card variant="flat" border class="text-left">
    <!-- Cabecera: contexto y fecha -->
    <div
      v-if="contexto || fecha"
      class="d-flex align-start ga-3 px-4 pt-3"
    >
      <span
        v-if="contexto"
        class="contexto flex-grow-1 min-w-0 text-caption text-medium-emphasis"
      >
        {{ contexto }}
      </span>
      <span
        v-if="fecha"
        class="text-caption text-medium-emphasis text-no-wrap ml-auto"
      >
        {{ fecha }}
      </span>
    </div>

    <!-- Jugadores y marcador: el destacado siempre arriba -->
    <div class="px-4 py-2">
      <div
        v-for="jugador in jugadores"
        :key="jugador.idUsuario"
        class="d-flex align-center ga-2 py-1"
      >
        <div class="flex-grow-1 min-w-0">
          <!-- El rival enlaza a su perfil; el jugador del perfil no, ya estás en él -->
          <router-link
            v-if="jugador.idUsuario !== idUsuarioDestacado"
            :to="{
              name: 'detalle-jugador',
              params: { idUsuario: jugador.idUsuario },
            }"
            :class="[
              'nick-enlace d-block text-truncate',
              esGanador(jugador) ? 'font-weight-bold' : 'text-medium-emphasis',
            ]"
          >
            {{ jugador.nick }}
          </router-link>
          <span
            v-else
            :class="[
              'd-block text-truncate',
              esGanador(jugador) ? 'font-weight-bold' : 'text-medium-emphasis',
            ]"
          >
            {{ jugador.nick }}
          </span>
          <!-- Con listas visibles, el ejército abre la lista del jugador -->
          <button
            v-if="ejercito(jugador.ejercito) && listasVisibles"
            type="button"
            class="ejercito-enlace d-block text-caption text-medium-emphasis text-truncate mw-100"
            @click="emit('verLista', jugador)"
          >
            {{ ejercito(jugador.ejercito) }}
          </button>
          <span
            v-else-if="ejercito(jugador.ejercito)"
            class="d-block text-caption text-medium-emphasis text-truncate"
          >
            {{ ejercito(jugador.ejercito) }}
          </span>
          <!-- En Parejas, el compañero juega en el mismo lado -->
          <template v-if="jugador.companero">
            <router-link
              v-if="jugador.companero.idUsuario !== idUsuarioDestacado"
              :to="{
                name: 'detalle-jugador',
                params: { idUsuario: jugador.companero.idUsuario },
              }"
              :class="[
                'nick-enlace d-block text-truncate',
                esGanador(jugador) ? 'font-weight-bold' : 'text-medium-emphasis',
              ]"
            >
              {{ jugador.companero.nick }}
            </router-link>
            <span
              v-else
              :class="[
                'd-block text-truncate',
                esGanador(jugador) ? 'font-weight-bold' : 'text-medium-emphasis',
              ]"
            >
              {{ jugador.companero.nick }}
            </span>
            <button
              v-if="ejercito(jugador.companero.ejercito) && listasVisibles"
              type="button"
              class="ejercito-enlace d-block text-caption text-medium-emphasis text-truncate mw-100"
              @click="emit('verLista', jugador.companero)"
            >
              {{ ejercito(jugador.companero.ejercito) }}
            </button>
            <span
              v-else-if="ejercito(jugador.companero.ejercito)"
              class="d-block text-caption text-medium-emphasis text-truncate"
            >
              {{ ejercito(jugador.companero.ejercito) }}
            </span>
          </template>
        </div>
        <span
          :class="[
            'marcador-lectura text-h6',
            esGanador(jugador) ? 'font-weight-bold' : 'text-medium-emphasis',
          ]"
        >
          {{ jugador.puntos ?? "-" }}
        </span>
        <!-- Flecha hacia la puntuación ganadora; hueco fijo para que los marcadores se alineen -->
        <v-icon
          size="small"
          :class="['ganador-icono', { invisible: !esGanador(jugador) }]"
        >
          mdi-menu-left
        </v-icon>
      </div>
    </div>

    <!-- Pie: resultado del jugador destacado, escenario y puntos de partida -->
    <v-divider />
    <div
      class="d-flex align-center ga-2 px-4 py-2 text-caption text-medium-emphasis"
    >
      <span
        :class="['font-weight-bold text-no-wrap', `text-${resultado.color}`]"
      >
        {{ resultado.etiqueta }}
      </span>
      <template v-if="eloVariacion != null">
        <span>·</span>
        <span
          :class="['font-weight-bold text-no-wrap', `text-${colorElo}`]"
        >
          {{ eloVariacion > 0 ? "+" : "" }}{{ eloVariacion }} ELO
        </span>
      </template>
      <template v-if="escenario">
        <span>·</span>
        <span class="flex-grow-1 min-w-0 text-truncate">{{ escenario }}</span>
      </template>
      <span v-if="puntosPartida" class="text-no-wrap ml-auto">
        {{ puntosPartida }} pts
      </span>
    </div>

    <!-- Acciones de quien la usa, como validar una amistosa pendiente -->
    <template v-if="$slots.default">
      <v-divider />
      <div class="px-4 py-2"><slot /></div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface JugadorPartidaLectura {
  idUsuario: number;
  nick?: string;
  ejercito?: string | null;
  puntos?: number | null;
  // Solo en Parejas: compañero del jugador, en su mismo lado
  companero?: JugadorPartidaLectura | null;
}

//eslint-disable-next-line no-undef
const props = defineProps<{
  jugador1: JugadorPartidaLectura;
  jugador2: JugadorPartidaLectura;
  // Texto pequeño de la cabecera: torneo, ronda, ELO...
  contexto?: string;
  fecha?: string;
  escenario?: string | null;
  puntosPartida?: number | null;
  // 0 o null: empate
  idGanador?: number | null;
  // Jugador desde cuyo punto de vista se muestra el resultado (el del perfil)
  idUsuarioDestacado?: number;
  // Si es true el ejército es pulsable y emite verLista
  listasVisibles?: boolean;
  // ELO ganado o perdido por el jugador destacado; null si no contó o no se sabe
  eloVariacion?: number | null;
}>();

//eslint-disable-next-line no-undef
const emit = defineEmits<{
  (e: "verLista", jugador: JugadorPartidaLectura): void;
}>();

// En Parejas el destacado puede ser el compañero: cuenta su lado entero
const esDelLado = (jugador: JugadorPartidaLectura) =>
  props.idUsuarioDestacado !== undefined &&
  (jugador.idUsuario === props.idUsuarioDestacado ||
    jugador.companero?.idUsuario === props.idUsuarioDestacado);

const jugadores = computed(() => {
  const lista = [props.jugador1, props.jugador2];
  return esDelLado(props.jugador2) ? lista.reverse() : lista;
});

// El ganador de la partida es el jugador de cada lado, no el compañero
const idLadoDestacado = computed(() => {
  if (esDelLado(props.jugador2)) return props.jugador2.idUsuario;
  if (esDelLado(props.jugador1)) return props.jugador1.idUsuario;
  return props.idUsuarioDestacado;
});

const esGanador = (jugador: JugadorPartidaLectura) =>
  !!props.idGanador && props.idGanador === jugador.idUsuario;

const ejercito = (nombre?: string | null) =>
  nombre && nombre !== "N/A" ? nombre : "";

// Colores del tema como texto: se leen bien sobre fondo oscuro
const resultado = computed(() => {
  if (!props.idGanador) return { etiqueta: "Empate", color: "warning" };
  return props.idGanador === idLadoDestacado.value
    ? { etiqueta: "Victoria", color: "success" }
    : { etiqueta: "Derrota", color: "error" };
});

const colorElo = computed(() => {
  if (!props.eloVariacion) return "medium-emphasis";
  return props.eloVariacion > 0 ? "success" : "error";
});
</script>

<style scoped>
.contexto {
  overflow-wrap: anywhere;
}

.ganador-icono {
  flex-shrink: 0;
  margin-left: -4px;
}

.invisible {
  visibility: hidden;
}

.min-w-0 {
  min-width: 0;
}

/* Subrayado siempre visible: en móvil no hay hover que delate el enlace */
.nick-enlace {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgba(var(--v-theme-on-surface), 0.4);
  text-underline-offset: 3px;
}

.nick-enlace:hover {
  text-decoration-color: currentColor;
}

/* Mismo subrayado que el nick: en móvil se ve que se puede pulsar */
.ejercito-enlace {
  padding: 2px 0;
  background: none;
  border: 0;
  color: inherit;
  text-align: left;
  text-decoration: underline;
  text-decoration-color: rgba(var(--v-theme-on-surface), 0.4);
  text-underline-offset: 3px;
  cursor: pointer;
}

.ejercito-enlace:hover {
  text-decoration-color: currentColor;
}

.mw-100 {
  max-width: 100%;
}

/* Nombre propio para no heredar los tamaños globales de .marcador de las cards de live */
.marcador-lectura {
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  text-align: right;
}
</style>
