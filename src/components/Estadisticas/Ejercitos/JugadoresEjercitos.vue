<template>
  <div>
    <v-autocomplete
      v-model="idUsuario"
      :items="jugadores"
      item-title="nick"
      item-value="idUsuario"
      placeholder="Busca un jugador"
      prepend-inner-icon="mdi-account-search"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-3"
    />

    <p v-if="!idUsuario" class="text-body-2 text-medium-emphasis text-center">
      Busca un jugador para ver con qué ejércitos juega.
    </p>

    <div v-else-if="cargando" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <p v-else-if="error" class="text-body-2 text-error text-center">
      {{ error }}
    </p>
    <template v-else-if="datos">
      <div class="d-flex align-center ga-2 mb-1">
        <h3 class="text-subtitle-1 font-weight-bold flex-grow-1">
          {{ datos.nick }}
        </h3>
        <v-btn
          :to="`/detalle-jugador/${datos.idUsuario}`"
          variant="text"
          size="small"
          color="primary"
          class="text-none"
          append-icon="mdi-chevron-right"
        >
          Su ficha
        </v-btn>
      </div>

      <p
        v-if="datos.resumen.partidas === 0"
        class="text-body-2 text-medium-emphasis"
      >
        No tiene partidas con estos filtros.
      </p>
      <template v-else>
        <p class="text-body-2 mb-1">
          {{ datos.resumen.partidas }} partidas ·
          {{ datos.resumen.victorias }}-{{ datos.resumen.empates }}-{{
            datos.resumen.derrotas
          }}
          · {{ textoPorcentaje(datos.resumen.porcentaje) }} de victorias ·
          <span :class="colorRinde(datos.resumen.rinde)">{{
            textoRinde(datos.resumen.rinde)
          }}</span>
          de «Rinde»
        </p>
        <!-- Lo que más interesa: con qué ejército le va mejor o peor que de costumbre, no solo cuál gana más -->
        <p v-if="comparacion" class="text-body-2 text-medium-emphasis mb-3">
          {{ comparacion }}
        </p>

        <h4 class="text-subtitle-2 font-weight-bold mb-1">Sus ejércitos</h4>
        <div class="fila cabecera text-caption text-medium-emphasis">
          <span>Ejército</span>
          <span class="text-right">Part.</span>
          <span class="text-right">% vict.</span>
          <span class="text-right">Rinde</span>
        </div>
        <!-- Cada ejército abre su ficha -->
        <div
          v-for="fila in datos.ejercitos"
          :key="fila.ejercito"
          class="fila pulsable text-body-2"
          role="button"
          tabindex="0"
          @click="emit('ver', fila.ejercito)"
          @keydown.enter="emit('ver', fila.ejercito)"
        >
          <span class="nombre">
            <v-icon :color="colorBando(fila.bando)" size="10" class="mr-1"
              >mdi-circle</v-icon
            >{{ fila.ejercito }}
          </span>
          <span
            class="text-right"
            :class="{ 'text-medium-emphasis': fila.partidas < MINIMO }"
          >
            {{ fila.partidas
            }}<template v-if="fila.partidas < MINIMO">*</template>
          </span>
          <span class="text-right">{{ textoPorcentaje(fila.porcentaje) }}</span>
          <span class="text-right" :class="colorRinde(fila.rinde)">{{
            textoRinde(fila.rinde)
          }}</span>
        </div>
        <p class="text-caption text-medium-emphasis mt-1 mb-0">
          * Menos de {{ MINIMO }} partidas con ese ejército.
        </p>

        <h4 class="text-subtitle-2 font-weight-bold mt-4 mb-1">
          Le cuesta contra
        </h4>
        <p
          v-if="datos.rivalesDificiles.length === 0"
          class="text-caption text-medium-emphasis mb-0"
        >
          No hay ningún ejército contra el que pierda más de lo que gana, con 3
          partidas o más.
        </p>
        <template v-else>
          <div class="fila cabecera text-caption text-medium-emphasis">
            <span>Rival</span>
            <span class="text-right">Part.</span>
            <span class="text-right">% vict.</span>
            <span class="text-right">Rinde</span>
          </div>
          <div
            v-for="rival in datos.rivalesDificiles"
            :key="rival.ejercito"
            class="fila text-body-2"
          >
            <span class="nombre">
              <v-icon :color="colorBando(rival.bando)" size="10" class="mr-1"
                >mdi-circle</v-icon
              >{{ rival.ejercito }}
            </span>
            <span class="text-right">{{ rival.partidas }}</span>
            <span class="text-right">{{
              textoPorcentaje(rival.porcentaje)
            }}</span>
            <span class="text-right" :class="colorRinde(rival.rinde)">{{
              textoRinde(rival.rinde)
            }}</span>
          </div>
          <p class="text-caption text-medium-emphasis mt-1 mb-0">
            Con 3 partidas o más, del peor al menos malo.
          </p>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, onMounted, ref, watch } from "vue";
import type {
  EjercitosJugadorDTO,
  FiltroEstadisticas,
} from "@/interfaces/Estadisticas";
import type { UsuarioIdNickDTO } from "@/interfaces/Usuario";
import { getEjercitosJugador } from "@/services/EstadisticasService";
import { getUsuariosIdNick } from "@/services/UsuariosService";
import { useAuth } from "@/composables/useAuth";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import {
  colorBando,
  colorRinde,
  textoPorcentaje,
  textoRinde,
} from "@/utils/estadisticasEjercitos";

// Con menos, un ejército no dice mucho de cómo le va
const MINIMO = 5;

const props = defineProps<{
  filtro: FiltroEstadisticas;
  jugadorInicial?: number | null;
}>();
const emit = defineEmits<{ (event: "ver", ejercito: string): void }>();

// Se empieza por el jugador pedido o, si no, por quien mira
const { getidUsuario } = useAuth();
const idUsuario = ref<number | null>(
  props.jugadorInicial ?? (Number(getidUsuario.value) || null)
);
const jugadores = ref<UsuarioIdNickDTO[]>([]);
const datos = ref<EjercitosJugadorDTO | null>(null);
const cargando = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const respuesta = await getUsuariosIdNick();
    jugadores.value = (respuesta.data as UsuarioIdNickDTO[]).sort((a, b) =>
      a.nick.localeCompare(b.nick, "es")
    );
  } catch (e) {
    console.error("Error al cargar los jugadores:", e);
  }
});

watch(
  () => props.jugadorInicial,
  inicial => {
    if (inicial) idUsuario.value = inicial;
  }
);

const cargar = async () => {
  // Al limpiar el buscador no queda nadie elegido
  if (!idUsuario.value) {
    datos.value = null;
    return;
  }
  cargando.value = true;
  error.value = null;
  try {
    datos.value = await getEjercitosJugador(idUsuario.value, props.filtro);
  } catch (e) {
    error.value = mensajeDelBack(
      e,
      "No se han podido cargar sus ejércitos. Inténtalo de nuevo."
    );
  } finally {
    cargando.value = false;
  }
};
watch([idUsuario, () => props.filtro], cargar, { deep: true, immediate: true });

// Entre los ejércitos con bastantes partidas, el que más se sale de su media por arriba y el que más por abajo
const comparacion = computed(() => {
  if (!datos.value) return "";
  const media = datos.value.resumen.rinde;
  const fiables = datos.value.ejercitos.filter(e => e.partidas >= MINIMO);
  if (fiables.length < 2) return "";
  const ordenados = [...fiables].sort((a, b) => b.rinde - a.rinde);
  const mejor = ordenados[0];
  const peor = ordenados[ordenados.length - 1];
  const partes: string[] = [];
  if (mejor.rinde - media >= 1)
    partes.push(`le va mejor que de costumbre con ${mejor.ejercito}`);
  if (media - peor.rinde >= 1) partes.push(`peor con ${peor.ejercito}`);
  if (partes.length === 0)
    return "Le va más o menos igual con todos sus ejércitos.";
  const texto = partes.join(" y ");
  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}.`;
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
  padding-bottom: 2px;
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
