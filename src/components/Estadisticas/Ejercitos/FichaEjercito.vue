<template>
  <!-- Todo de un ejército con los filtros de la vista; al cerrarla se sigue en el ranking como estaba -->
  <v-dialog
    :model-value="modelValue"
    :fullscreen="smAndDown"
    max-width="560"
    scrollable
    @update:model-value="cerrar"
  >
    <v-card>
      <v-card-title class="d-flex align-start ga-2 pb-0">
        <span class="text-wrap flex-grow-1">{{ ejercito }}</span>
        <v-chip v-if="ficha?.resumen.bando" size="x-small" :color="colorBando(ficha.resumen.bando)" class="mt-1">
          {{ textoBando(ficha.resumen.bando) }}
        </v-chip>
      </v-card-title>
      <v-card-subtitle class="pb-2">{{ descripcionFiltro }}</v-card-subtitle>

      <v-card-text class="pt-0">
        <div v-if="cargando" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <p v-else-if="error" class="text-body-2 text-error">{{ error }}</p>
        <template v-else-if="ficha">
          <p v-if="ficha.resumen.partidas === 0" class="text-body-2 text-medium-emphasis">
            No hay partidas de este ejército con estos filtros.
          </p>
          <template v-else>
            <div class="metricas mb-4">
              <div class="metrica">
                <div class="text-caption text-medium-emphasis">Partidas</div>
                <div class="text-h6">{{ ficha.resumen.partidas }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ ficha.resumen.victorias }}-{{ ficha.resumen.empates }}-{{ ficha.resumen.derrotas }}
                </div>
              </div>
              <div class="metrica">
                <div class="text-caption text-medium-emphasis">% victorias</div>
                <div class="text-h6">{{ textoPorcentaje(ficha.resumen.porcentaje) }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ textoDecimal(ficha.resumen.puntosFavor) }} a {{ textoDecimal(ficha.resumen.puntosContra) }} de media
                </div>
              </div>
              <div class="metrica">
                <div class="text-caption text-medium-emphasis">Rinde</div>
                <div class="text-h6" :class="colorRinde(ficha.resumen.rinde)">{{ textoRinde(ficha.resumen.rinde) }}</div>
                <div class="text-caption text-medium-emphasis">frente a su ELO</div>
              </div>
              <div v-if="ficha.generalesMatados !== null" class="metrica">
                <div class="text-caption text-medium-emphasis">Mata al general</div>
                <div class="text-h6">{{ textoPorcentaje(ficha.generalesMatados) }}</div>
                <div class="text-caption text-medium-emphasis">de sus partidas</div>
              </div>
            </div>

            <!-- Ganar partidas no es lo mismo que ganar torneos -->
            <template v-if="ficha.resumen.torneos > 0">
              <h3 class="text-subtitle-2 font-weight-bold mb-1">En torneos</h3>
              <div class="d-flex flex-wrap ga-1 mb-1">
                <v-chip size="small" variant="tonal">
                  {{ ficha.resumen.torneos }} {{ ficha.resumen.torneos === 1 ? "torneo" : "torneos" }}
                </v-chip>
                <v-chip
                  size="small"
                  :variant="ficha.resumen.torneosGanados > 0 ? 'flat' : 'tonal'"
                  :color="ficha.resumen.torneosGanados > 0 ? '#FFD700' : undefined"
                >
                  {{ ficha.resumen.torneosGanados }} {{ ficha.resumen.torneosGanados === 1 ? "ganado" : "ganados" }}
                </v-chip>
                <v-chip size="small" variant="tonal">
                  {{ ficha.resumen.podios }} {{ ficha.resumen.podios === 1 ? "podio" : "podios" }}
                </v-chip>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-4">{{ fraseTorneos }}</p>
            </template>

            <h3 class="text-subtitle-2 font-weight-bold mb-1">Según los puntos</h3>
            <div v-for="tramo in ficha.porTramo" :key="tramo.tramo" class="barra text-body-2">
              <span class="text-medium-emphasis">{{ textoTramo(tramo.tramo) }}</span>
              <v-progress-linear
                :model-value="tramo.partidas ? tramo.porcentaje : 0"
                color="primary"
                bg-color="grey"
                height="8"
                rounded
              />
              <span class="text-right">{{ tramo.partidas ? textoPorcentaje(tramo.porcentaje) : "—" }}</span>
              <span class="text-right text-caption text-medium-emphasis">{{ tramo.partidas }}</span>
            </div>

            <template v-if="ficha.porTemporada.length > 1">
              <h3 class="text-subtitle-2 font-weight-bold mt-4 mb-1">Por temporada</h3>
              <div class="fila-cuatro cabecera text-caption text-medium-emphasis">
                <span>Temporada</span>
                <span class="text-right">Part.</span>
                <span class="text-right">% vict.</span>
                <span class="text-right">Rinde</span>
              </div>
              <div v-for="temporada in ficha.porTemporada" :key="temporada.temporada" class="fila-cuatro text-body-2">
                <span class="text-medium-emphasis">{{ temporada.temporada }}</span>
                <span class="text-right">{{ temporada.partidas }}</span>
                <span class="text-right">{{ textoPorcentaje(temporada.porcentaje) }}</span>
                <span class="text-right" :class="colorRinde(temporada.rinde)">{{ textoRinde(temporada.rinde) }}</span>
              </div>
            </template>

            <h3 class="text-subtitle-2 font-weight-bold mt-4 mb-1">Contra quién</h3>
            <p v-if="ficha.rivales.length === 0" class="text-caption text-medium-emphasis mb-0">
              Aún no tiene 5 partidas contra ningún ejército.
            </p>
            <template v-else>
              <div class="fila-cuatro cabecera text-caption text-medium-emphasis">
                <span>Rival</span>
                <span class="text-right">Part.</span>
                <span class="text-right">% vict.</span>
                <span class="text-right">Rinde</span>
              </div>
              <!-- Cada rival lleva a su cruce -->
              <div
                v-for="rival in rivalesVisibles"
                :key="rival.ejercito"
                class="fila-cuatro pulsable text-body-2"
                role="button"
                tabindex="0"
                @click="verCruce(rival.ejercito)"
                @keydown.enter="verCruce(rival.ejercito)"
              >
                <span class="nombre">
                  <v-icon :color="colorBando(rival.bando)" size="10" class="mr-1">mdi-circle</v-icon>{{ rival.ejercito }}
                </span>
                <span class="text-right">{{ rival.partidas }}</span>
                <span class="text-right">{{ textoPorcentaje(rival.porcentaje) }}</span>
                <span class="text-right" :class="colorRinde(rival.rinde)">{{ textoRinde(rival.rinde) }}</span>
              </div>
              <div v-if="ficha.rivales.length > 6" class="text-center">
                <v-btn variant="text" size="small" class="text-none" @click="todosRivales = !todosRivales">
                  {{ todosRivales ? "Solo los extremos" : `Ver los ${ficha.rivales.length}` }}
                </v-btn>
              </div>
              <p class="text-caption text-medium-emphasis mb-0">
                Del que mejor se le da al que peor, con 5 partidas o más. Pulsa uno para ver el cruce entero.
              </p>
            </template>

            <h3 class="text-subtitle-2 font-weight-bold mt-4 mb-1">Quién lo lleva mejor</h3>
            <p v-if="ficha.jugadores.length === 0" class="text-caption text-medium-emphasis mb-0">
              Nadie lo ha llevado 5 veces o más.
            </p>
            <template v-else>
              <div class="fila-cuatro cabecera text-caption text-medium-emphasis">
                <span>Jugador</span>
                <span class="text-right">Part.</span>
                <span class="text-right">% vict.</span>
                <span class="text-right">Rinde</span>
              </div>
              <div v-for="jugador in jugadoresVisibles" :key="jugador.idUsuario" class="fila-cuatro text-body-2">
                <router-link :to="`/detalle-jugador/${jugador.idUsuario}`" class="nombre enlace">
                  {{ jugador.nick }}
                </router-link>
                <span class="text-right">{{ jugador.partidas }}</span>
                <span class="text-right">{{ textoPorcentaje(jugador.porcentaje) }}</span>
                <span class="text-right" :class="colorRinde(jugador.rinde)">{{ textoRinde(jugador.rinde) }}</span>
              </div>
              <div v-if="ficha.jugadores.length > JUGADORES_DE_ENTRADA" class="text-center">
                <v-btn variant="text" size="small" class="text-none" @click="todosJugadores = !todosJugadores">
                  {{ todosJugadores ? "Ver menos" : `Ver los ${ficha.jugadores.length}` }}
                </v-btn>
              </div>
              <p class="text-caption text-medium-emphasis mb-0">
                Ordenados por «Rinde», con 5 partidas o más: lo bien que les va con él frente a lo que espera su ELO.
              </p>
            </template>
          </template>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" class="text-none" @click="cerrar">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import type { FichaEjercitoDTO, FiltroEstadisticas } from "@/interfaces/Estadisticas";
import { getFichaEjercito } from "@/services/EstadisticasService";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import {
  colorBando,
  colorRinde,
  textoBando,
  textoDecimal,
  textoPorcentaje,
  textoRinde,
  textoTramo,
} from "@/utils/estadisticasEjercitos";

const JUGADORES_DE_ENTRADA = 5;

const props = defineProps<{ modelValue: boolean; ejercito: string | null; filtro: FiltroEstadisticas }>();
const emit = defineEmits<{
  (event: "update:modelValue", valor: boolean): void;
  (event: "cruce", cruce: { ejercito: string; rival: string }): void;
}>();

const { smAndDown } = useDisplay();
const ficha = ref<FichaEjercitoDTO | null>(null);
const cargando = ref(false);
const error = ref<string | null>(null);
const todosRivales = ref(false);
const todosJugadores = ref(false);

const cerrar = () => emit("update:modelValue", false);
const verCruce = (rival: string) => {
  if (ficha.value) emit("cruce", { ejercito: ficha.value.resumen.ejercito, rival });
};

// Se carga cada vez que se abre, con los filtros que haya en ese momento
watch(
  () => props.modelValue,
  async abierta => {
    if (!abierta || !props.ejercito) return;
    ficha.value = null;
    error.value = null;
    todosRivales.value = false;
    todosJugadores.value = false;
    cargando.value = true;
    try {
      ficha.value = await getFichaEjercito(props.ejercito, props.filtro);
    } catch (e) {
      error.value = mensajeDelBack(e, "No se ha podido cargar el ejército. Inténtalo de nuevo.");
    } finally {
      cargando.value = false;
    }
  }
);

const descripcionFiltro = computed(() => {
  const partes = [
    props.filtro.temporada ? `Temporada ${props.filtro.temporada}` : "Todas las temporadas",
    props.filtro.tramo ? `${textoTramo(props.filtro.tramo)} puntos` : "todos los puntos",
    props.filtro.amistosas ? "con amistosas" : "sin amistosas",
  ];
  return partes.join(" · ");
});

// Lo que gana en partidas frente a lo que gana en torneos, dicho en una frase
const fraseTorneos = computed(() => {
  const resumen = ficha.value?.resumen;
  if (!resumen || resumen.torneos === 0) return "";
  const partidas = `Gana el ${textoPorcentaje(resumen.porcentaje)} de sus partidas`;
  const deSus = resumen.torneos === 1 ? "su único torneo" : `sus ${resumen.torneos} torneos`;
  if (resumen.torneosGanados === 0)
    return `${partidas}, pero ${resumen.torneos === 1 ? "no ha ganado" : "ninguno de"} ${deSus}.`;
  return `${partidas} y ${resumen.torneosGanados} de ${deSus}.`;
});

// Los tres mejores y los tres peores; o todos, si se piden
const rivalesVisibles = computed(() => {
  const rivales = ficha.value?.rivales ?? [];
  if (todosRivales.value || rivales.length <= 6) return rivales;
  return [...rivales.slice(0, 3), ...rivales.slice(-3)];
});

const jugadoresVisibles = computed(() => {
  const jugadores = ficha.value?.jugadores ?? [];
  return todosJugadores.value ? jugadores : jugadores.slice(0, JUGADORES_DE_ENTRADA);
});
</script>

<style scoped>
.metricas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.metrica {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 8px;
  padding: 8px 10px;
}

.barra {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 40px 28px;
  column-gap: 8px;
  align-items: center;
  padding: 4px 0;
}

.fila-cuatro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px 44px 36px;
  column-gap: 8px;
  padding: 6px 0;
  align-items: center;
}

.fila-cuatro + .fila-cuatro {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cabecera {
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

.enlace {
  color: inherit;
  text-decoration: none;
}

.enlace:hover {
  text-decoration: underline;
}
</style>
