<template>
  <div>
    <v-autocomplete
      v-model="ejercito"
      :items="nombres"
      placeholder="Elige un ejército"
      prepend-inner-icon="mdi-shield"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-2"
    />

    <div class="d-flex flex-wrap justify-center align-center ga-1 mb-2">
      <span class="text-caption text-medium-emphasis mr-1">contra</span>
      <v-chip
        size="small"
        :color="contra === 'ejercito' ? 'primary' : undefined"
        @click="contra = 'ejercito'"
      >
        Otro ejército
      </v-chip>
      <v-chip
        size="small"
        :color="contra === 'good' ? 'primary' : undefined"
        @click="contra = 'good'"
      >
        Todo el Bien
      </v-chip>
      <v-chip
        size="small"
        :color="contra === 'evil' ? 'primary' : undefined"
        @click="contra = 'evil'"
      >
        Todo el Mal
      </v-chip>
    </div>

    <v-autocomplete
      v-if="contra === 'ejercito'"
      v-model="rival"
      :items="nombres"
      placeholder="Elige el rival"
      prepend-inner-icon="mdi-shield-half-full"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-3"
    />

    <div v-if="cargando" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <p v-else-if="error" class="text-body-2 text-error text-center">
      {{ error }}
    </p>

    <!-- El cruce elegido -->
    <template v-else-if="cruce">
      <h3 class="text-subtitle-1 font-weight-bold mb-1">
        {{ cruce.ejercito }} contra {{ textoRival }}
      </h3>
      <p
        v-if="cruce.resumen.partidas === 0"
        class="text-body-2 text-medium-emphasis"
      >
        Aún no se han enfrentado con estos filtros.
      </p>
      <template v-else>
        <div class="reparto mb-1" aria-hidden="true">
          <div :style="{ flex: cruce.resumen.victorias }" class="bg-success" />
          <div :style="{ flex: cruce.resumen.empates }" class="bg-grey" />
          <div :style="{ flex: cruce.resumen.derrotas }" class="bg-error" />
        </div>
        <p class="text-body-2 mb-1">
          {{ cruce.resumen.partidas }} partidas ·
          {{ cruce.resumen.victorias }} ganadas · {{ cruce.resumen.empates }}
          {{ cruce.resumen.empates === 1 ? "empate" : "empates" }} ·
          {{ cruce.resumen.derrotas }} perdidas
        </p>
        <p class="text-body-2 mb-1">
          {{ textoPorcentaje(cruce.resumen.porcentaje) }} de victorias ·
          <span :class="colorRinde(cruce.resumen.rinde)">{{
            textoRinde(cruce.resumen.rinde)
          }}</span>
          de «Rinde» · {{ textoDecimal(cruce.resumen.puntosFavor) }} a
          {{ textoDecimal(cruce.resumen.puntosContra) }} de media
        </p>
        <p
          v-if="cruce.resumen.partidas < POCAS_PARTIDAS_CRUCE"
          class="text-caption text-medium-emphasis mb-1"
        >
          Pocas partidas: tómalo con cautela.
        </p>

        <h4 class="text-subtitle-2 font-weight-bold mt-3 mb-1">
          Según los puntos
        </h4>
        <div
          v-for="tramo in cruce.porTramo"
          :key="tramo.tramo"
          class="barra text-body-2"
        >
          <span class="text-medium-emphasis">{{
            textoTramo(tramo.tramo)
          }}</span>
          <v-progress-linear
            :model-value="tramo.partidas ? tramo.porcentaje : 0"
            color="primary"
            bg-color="grey"
            height="8"
            rounded
          />
          <span class="text-right">{{
            tramo.partidas ? textoPorcentaje(tramo.porcentaje) : "—"
          }}</span>
          <span class="text-right text-caption text-medium-emphasis">{{
            tramo.partidas
          }}</span>
        </div>

        <h4 class="text-subtitle-2 font-weight-bold mt-3 mb-1">Partidas</h4>
        <!-- Las de torneo llevan a los resultados del evento -->
        <div
          v-for="partida in cruce.partidas"
          :key="`${partida.esAmistosa}-${partida.idPartida}`"
          class="partida"
          :class="{ pulsable: partida.idTorneo }"
          :role="partida.idTorneo ? 'button' : undefined"
          :tabindex="partida.idTorneo ? 0 : undefined"
          @click="irAlEvento(partida)"
          @keydown.enter="irAlEvento(partida)"
        >
          <div class="text-caption text-medium-emphasis">
            {{ formatFechaSpaWhitoutAsync(partida.fecha) }} ·
            {{ partida.esAmistosa ? "Amistosa" : partida.nombreTorneo }}
            <template v-if="partida.ronda">
              · ronda {{ partida.ronda }}</template
            >
            <template v-if="partida.puntos">
              · {{ partida.puntos }} puntos</template
            >
          </div>
          <div class="text-body-2 d-flex align-center ga-2">
            <span class="lado">
              {{ partida.nick }}
              <span
                v-if="cruce.rival !== partida.ejercitoRival"
                class="text-medium-emphasis"
              >
                contra {{ partida.ejercitoRival }}
              </span>
            </span>
            <strong
              :class="colorResultado(partida.puntuacion)"
              class="flex-shrink-0"
            >
              {{ partida.resultado }} - {{ partida.resultadoRival }}
            </strong>
            <span class="lado text-right">{{ partida.nickRival }}</span>
          </div>
        </div>
        <p
          v-if="cruce.partidas.length < cruce.resumen.partidas"
          class="text-caption text-medium-emphasis mt-1 mb-0"
        >
          Las {{ cruce.partidas.length }} más recientes de
          {{ cruce.resumen.partidas }}.
        </p>
      </template>
    </template>

    <!-- Sin cruce elegido: los más jugados y los más desequilibrados; al pulsar uno, se elige -->
    <template v-else-if="destacados">
      <h3 class="text-subtitle-2 font-weight-bold mb-1">Los más jugados</h3>
      <div class="cabecera-cruces text-caption text-medium-emphasis">
        <span>Cruce</span>
        <span class="text-right">Part.</span>
        <span class="text-right">% vict.</span>
        <span class="text-right">Rinde</span>
      </div>
      <FilaCruce
        v-for="c in destacados.masJugados"
        :key="`j-${c.ejercito}-${c.rival}`"
        :cruce="c"
        @elegir="elegir"
      />
      <h3 class="text-subtitle-2 font-weight-bold mt-4 mb-1">
        Los más desequilibrados
      </h3>
      <div class="cabecera-cruces text-caption text-medium-emphasis">
        <span>Cruce</span>
        <span class="text-right">Part.</span>
        <span class="text-right">% vict.</span>
        <span class="text-right">Rinde</span>
      </div>
      <FilaCruce
        v-for="c in destacados.masDesequilibrados"
        :key="`d-${c.ejercito}-${c.rival}`"
        :cruce="c"
        @elegir="elegir"
      />
      <p class="text-caption text-medium-emphasis mt-1 mb-0">
        Con {{ MINIMO_DESEQUILIBRADO }} partidas o más, cada uno visto desde el
        ejército que se impone.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import type {
  Bando,
  CruceEjercitosDTO,
  CrucesDestacadosDTO,
  FiltroEstadisticas,
  PartidaCruceDTO,
} from "@/interfaces/Estadisticas";
import {
  getCruce,
  getCrucesDestacados,
  getRankingEjercitos,
} from "@/services/EstadisticasService";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import { formatFechaSpaWhitoutAsync } from "@/utils/Fecha";
import {
  colorRinde,
  textoBando,
  textoDecimal,
  textoPorcentaje,
  textoRinde,
  textoTramo,
} from "@/utils/estadisticasEjercitos";
import FilaCruce from "./FilaCruce.vue";

const POCAS_PARTIDAS_CRUCE = 10;
const MINIMO_DESEQUILIBRADO = 10;

const props = defineProps<{
  filtro: FiltroEstadisticas;
  // Para llegar con un cruce ya elegido, como desde la ficha de un ejército
  inicial?: { ejercito: string; rival: string } | null;
}>();

const router = useRouter();
const nombres = ref<string[]>([]);
const ejercito = ref<string | null>(props.inicial?.ejercito ?? null);
const contra = ref<"ejercito" | Bando>("ejercito");
const rival = ref<string | null>(props.inicial?.rival ?? null);
const cruce = ref<CruceEjercitosDTO | null>(null);
const destacados = ref<CrucesDestacadosDTO | null>(null);
const cargando = ref(false);
const error = ref<string | null>(null);

// Todos los ejércitos que se han jugado alguna vez, por orden alfabético
onMounted(async () => {
  try {
    const todos = await getRankingEjercitos({ amistosas: true }, 1);
    nombres.value = todos
      .map(e => e.ejercito)
      .sort((a, b) => a.localeCompare(b, "es"));
  } catch (e) {
    console.error("Error al cargar los ejércitos:", e);
  }
});

watch(
  () => props.inicial,
  inicial => {
    if (!inicial) return;
    ejercito.value = inicial.ejercito;
    contra.value = "ejercito";
    rival.value = inicial.rival;
  }
);

const listo = computed(
  () => !!ejercito.value && (contra.value !== "ejercito" || !!rival.value)
);
const textoRival = computed(() =>
  contra.value === "ejercito"
    ? (cruce.value?.rival ?? "")
    : `todo el ${textoBando(contra.value)}`
);

const cargar = async () => {
  cargando.value = true;
  error.value = null;
  try {
    if (listo.value && ejercito.value) {
      destacados.value = null;
      cruce.value = await getCruce(
        ejercito.value,
        contra.value === "ejercito"
          ? { ejercito: rival.value }
          : { bando: contra.value },
        props.filtro
      );
    } else {
      cruce.value = null;
      destacados.value = await getCrucesDestacados(props.filtro);
    }
  } catch (e) {
    error.value = mensajeDelBack(
      e,
      "No se han podido cargar los cruces. Inténtalo de nuevo."
    );
  } finally {
    cargando.value = false;
  }
};
watch([ejercito, contra, rival, () => props.filtro], cargar, {
  deep: true,
  immediate: true,
});

const elegir = (elegido: { ejercito: string; rival: string }) => {
  ejercito.value = elegido.ejercito;
  contra.value = "ejercito";
  rival.value = elegido.rival;
};

const irAlEvento = (partida: PartidaCruceDTO) => {
  if (partida.idTorneo)
    router.push(`/detalle-evento/${partida.idTorneo}?tab=resultados`);
};

const colorResultado = (puntuacion: number) =>
  puntuacion === 1
    ? "text-success"
    : puntuacion === 0
      ? "text-error"
      : "text-medium-emphasis";
</script>

<style scoped>
/* Las mismas columnas que FilaCruce */
.cabecera-cruces {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px 44px 36px;
  column-gap: 8px;
  padding: 0 4px 2px;
}

.reparto {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

.barra {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 40px 28px;
  column-gap: 8px;
  align-items: center;
  padding: 4px 0;
}

.partida {
  padding: 8px 4px;
}

.partida + .partida {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.pulsable {
  cursor: pointer;
}

.pulsable:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.lado {
  flex: 1 1 0;
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
