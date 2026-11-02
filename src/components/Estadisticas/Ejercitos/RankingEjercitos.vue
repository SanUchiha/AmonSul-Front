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

    <div class="d-flex flex-wrap justify-center align-center ga-1 mb-2">
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
        <a href="#" class="text-primary" @click.prevent="verComo = !verComo">¿Qué es «Rinde»?</a>
      </p>
      <p v-if="verComo" class="text-caption text-medium-emphasis mt-1 mb-0">
        El % de victorias engaña: un ejército parece mejor si lo llevan los mejores jugadores. «Rinde» compara cada
        resultado con lo que esperaba el ELO de los dos jugadores: +5 es que gana 5 puntos de porcentaje más de lo
        esperado y −5, que gana 5 menos. Un empate cuenta como media victoria.
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
const verComo = ref(false);

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
