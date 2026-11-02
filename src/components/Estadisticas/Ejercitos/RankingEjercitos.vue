<template>
  <div>
    <v-text-field
      v-model="busqueda"
      placeholder="Buscar ejército"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-2"
    />

    <!-- Dos formas de verlo: cómo le va en las partidas o cuántos torneos gana -->
    <div class="d-flex flex-wrap justify-center align-center ga-1 mb-2">
      <span class="text-caption text-medium-emphasis mr-1">Ver por</span>
      <v-chip size="small" :color="vista === 'partidas' ? 'primary' : undefined" @click="vista = 'partidas'">
        Partidas
      </v-chip>
      <v-chip size="small" :color="vista === 'torneos' ? 'primary' : undefined" @click="vista = 'torneos'">
        Torneos
      </v-chip>
    </div>

    <div v-if="vista === 'partidas'" class="d-flex flex-wrap justify-center align-center ga-1 mb-2">
      <span class="text-caption text-medium-emphasis mr-1">Ordenar por</span>
      <v-chip
        v-for="opcion in ORDENES"
        :key="opcion.valor"
        size="small"
        :color="orden === opcion.valor ? 'primary' : undefined"
        @click="orden = opcion.valor"
      >
        {{ opcion.texto }}
      </v-chip>
    </div>

    <div v-if="cargando" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <p v-else-if="error" class="text-body-2 text-error text-center">{{ error }}</p>
    <p v-else-if="visibles.length === 0" class="text-body-2 text-medium-emphasis text-center">
      {{ busqueda ? "Ningún ejército coincide con la búsqueda." : "No hay partidas con estos filtros." }}
    </p>
    <!-- Por torneos: los que más ganan, y aparte los que ganan partidas pero no torneos -->
    <template v-else-if="vista === 'torneos'">
      <v-card v-if="sinRematar.length" variant="tonal" color="warning" class="pa-3 mb-3">
        <div class="text-subtitle-2 font-weight-bold mb-1">Ganan partidas, pero no torneos</div>
        <div v-for="fila in sinRematar" :key="fila.ejercito" class="text-body-2">
          {{ fila.ejercito }}: {{ textoPorcentaje(fila.porcentaje) }} de victorias y ninguno de sus {{ fila.torneos }}
          torneos ({{ fila.podios }} {{ fila.podios === 1 ? "podio" : "podios" }})
        </div>
      </v-card>
      <p v-if="porTorneos.length === 0" class="text-body-2 text-medium-emphasis text-center">
        Ningún ejército ha jugado torneos individuales con estos filtros.
      </p>
      <template v-else>
        <div class="fila-torneos cabecera text-caption text-medium-emphasis">
          <span>Ejército</span>
          <span class="text-right">Torn.</span>
          <span class="text-right">1º</span>
          <span class="text-right">Podios</span>
          <span class="text-right">% vict.</span>
        </div>
        <div
          v-for="fila in porTorneos"
          :key="fila.ejercito"
          class="fila-torneos pulsable text-body-2"
          role="button"
          tabindex="0"
          @click="emit('ver', fila.ejercito)"
          @keydown.enter="emit('ver', fila.ejercito)"
        >
          <span class="nombre">
            <v-icon :color="colorBando(fila.bando)" size="10" class="mr-1">mdi-circle</v-icon>{{ fila.ejercito }}
          </span>
          <span class="text-right">{{ fila.torneos }}</span>
          <span class="text-right" :class="{ 'font-weight-bold oro': fila.torneosGanados > 0 }">{{ fila.torneosGanados }}</span>
          <span class="text-right">{{ fila.podios }}</span>
          <span class="text-right">{{ textoPorcentaje(fila.porcentaje) }}</span>
        </div>
        <p class="text-caption text-medium-emphasis mt-2 mb-0">
          Torneos, ligas y copas individuales con clasificación final. Podio es quedar 1º, 2º o 3º, y el ejército es
          el que más llevó cada jugador en sus partidas de ese evento.
        </p>
      </template>
    </template>
    <template v-else>
      <div class="fila cabecera text-caption text-medium-emphasis">
        <span>Ejército</span>
        <span class="text-right">Part.</span>
        <span class="text-right">% vict.</span>
        <span class="text-right">Rinde</span>
      </div>
      <!-- Cada fila abre la ficha del ejército -->
      <div
        v-for="fila in visibles"
        :key="fila.ejercito"
        class="fila pulsable text-body-2"
        role="button"
        tabindex="0"
        @click="emit('ver', fila.ejercito)"
        @keydown.enter="emit('ver', fila.ejercito)"
      >
        <span class="nombre">
          <v-icon :color="colorBando(fila.bando)" size="10" class="mr-1">mdi-circle</v-icon>{{ fila.ejercito }}
        </span>
        <span class="text-right" :class="{ 'text-medium-emphasis': fila.partidas < POCAS_PARTIDAS }">
          {{ fila.partidas }}<template v-if="fila.partidas < POCAS_PARTIDAS">*</template>
        </span>
        <span class="text-right">{{ textoPorcentaje(fila.porcentaje) }}</span>
        <span class="text-right" :class="colorRinde(fila.rinde)">{{ textoRinde(fila.rinde) }}</span>
      </div>

      <p class="text-caption text-medium-emphasis mt-2 mb-0">
        * Menos de {{ POCAS_PARTIDAS }} partidas: tómalo con cautela.
      </p>
    </template>

    <div class="text-center mt-1">
      <v-btn variant="text" size="small" color="primary" class="text-none" @click="todos = !todos">
        {{ todos ? `Solo los de ${MINIMO} partidas o más` : `Ver también los de menos de ${MINIMO} partidas` }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import type { EjercitoBalanceDTO, FiltroEstadisticas } from "@/interfaces/Estadisticas";
import { getRankingEjercitos } from "@/services/EstadisticasService";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import {
  POCAS_PARTIDAS,
  colorBando,
  colorRinde,
  textoPorcentaje,
  textoRinde,
} from "@/utils/estadisticasEjercitos";

const MINIMO = 10;
const ORDENES = [
  { valor: "porcentaje", texto: "% victorias" },
  { valor: "rinde", texto: "Rinde" },
  { valor: "partidas", texto: "Partidas" },
] as const;

const props = defineProps<{ filtro: FiltroEstadisticas }>();
const emit = defineEmits<{ (event: "ver", ejercito: string): void }>();

const filas = ref<EjercitoBalanceDTO[]>([]);
const cargando = ref(false);
const error = ref<string | null>(null);
const busqueda = ref<string | null>("");
const orden = ref<(typeof ORDENES)[number]["valor"]>("porcentaje");
const todos = ref(false);
const vista = ref<"partidas" | "torneos">("partidas");

// Para decir que a un ejército «no le da para ganar» hacen falta bastantes torneos y un buen % de victorias
const MINIMO_TORNEOS = 10;
const PORCENTAJE_ALTO = 55;

const cargar = async () => {
  cargando.value = true;
  error.value = null;
  try {
    filas.value = await getRankingEjercitos(props.filtro, todos.value ? 1 : MINIMO);
  } catch (e) {
    error.value = mensajeDelBack(e, "No se han podido cargar las estadísticas. Inténtalo de nuevo.");
  } finally {
    cargando.value = false;
  }
};
watch([() => props.filtro, todos], cargar, { deep: true, immediate: true });

// Sin distinguir mayúsculas ni tildes
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Los que han jugado algún torneo, del que más gana al que menos
const porTorneos = computed(() => {
  const buscado = normalizar(busqueda.value ?? "");
  return filas.value
    .filter(fila => fila.torneos > 0 && (!buscado || normalizar(fila.ejercito).includes(buscado)))
    .sort(
      (a, b) =>
        b.torneosGanados - a.torneosGanados ||
        b.podios - a.podios ||
        b.porcentaje - a.porcentaje ||
        b.torneos - a.torneos
    );
});

const sinRematar = computed(() =>
  porTorneos.value
    .filter(f => f.torneos >= MINIMO_TORNEOS && f.porcentaje >= PORCENTAJE_ALTO && f.torneosGanados === 0)
    .sort((a, b) => b.porcentaje - a.porcentaje)
);

const visibles = computed(() => {
  const buscado = normalizar(busqueda.value ?? "");
  return filas.value
    .filter(fila => !buscado || normalizar(fila.ejercito).includes(buscado))
    .sort((a, b) => b[orden.value] - a[orden.value] || b.partidas - a.partidas);
});
</script>

<style scoped>
.fila {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px 52px 44px;
  column-gap: 8px;
  padding: 8px 4px;
  align-items: center;
}

.fila + .fila {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cabecera {
  padding-top: 0;
}

/* Por torneos, una columna más y algo más estrechas */
.fila-torneos {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px 24px 44px 44px;
  column-gap: 6px;
  padding: 8px 4px;
  align-items: center;
}

.fila-torneos + .fila-torneos {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.oro {
  color: #ffd700;
}

.pulsable {
  cursor: pointer;
}

.pulsable:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.nombre {
  overflow-wrap: anywhere;
}
</style>
