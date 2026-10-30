<template>
  <div class="text-left">
    <p v-if="propias.length === 0" class="text-body-2 text-medium-emphasis my-4 text-center">
      {{ origen === "torneo" ? "Aún no tiene partidas de eventos." : "Aún no tiene partidas amistosas." }}
    </p>
    <template v-else>
      <!-- Balance de estas partidas, con los filtros aplicados -->
      <v-card class="pa-3 mb-3" variant="outlined">
        <BarraBalance :titulo="titulo" :balance="balance" />
      </v-card>

      <!-- Filtros: los chips se envuelven en móvil -->
      <v-chip-group v-model="filtroResultado" mandatory column selected-class="text-primary">
        <v-chip v-for="r in RESULTADOS" :key="r.valor" :value="r.valor" size="small" filter>
          {{ r.titulo }} ({{ cuantos(r.valor) }})
        </v-chip>
      </v-chip-group>
      <v-chip-group
        v-if="formatos.length > 1"
        v-model="filtroFormato"
        mandatory
        column
        selected-class="text-primary"
      >
        <v-chip value="todos" size="small" filter>Todos</v-chip>
        <v-chip v-for="f in formatos" :key="f" :value="f" size="small" filter>
          {{ plural(f) }}
        </v-chip>
      </v-chip-group>
      <v-text-field
        v-model="busqueda"
        :label="origen === 'torneo' ? 'Buscar rival o evento' : 'Buscar rival'"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        clearable
        hide-details
        class="mt-1 mb-3"
      />

      <p v-if="filtradas.length === 0" class="text-body-2 text-medium-emphasis text-center my-4">
        No hay partidas con estos filtros.
      </p>
      <v-row v-else dense>
        <v-col v-for="partida in visibles" :key="partida.clave" cols="12" sm="6" lg="4">
          <CardPartidaTorneo
            v-if="partida.origen === 'torneo'"
            :idUsuario="idUsuario"
            :match="(partida.original as ViewPartidaTorneoDTO)"
          />
          <ValidadasMatchCard
            v-else
            :idUsuario="idUsuario"
            :match="(partida.original as ViewPartidaAmistosaDTO)"
          />
        </v-col>
      </v-row>
      <!-- Por tandas: con muchas partidas la lista no se hace eterna -->
      <div v-if="filtradas.length > visibles.length" class="text-center mt-2">
        <v-btn variant="tonal" size="small" @click="cuantasVer += TANDA">
          Ver más ({{ filtradas.length - visibles.length }})
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import {
  ViewPartidaAmistosaDTO,
  ViewPartidaTorneoDTO,
} from "@/interfaces/Partidas";
import { nombreEvento } from "@/Constant/FormatoTorneo";
import { balanceDe, PartidaJugada, ResultadoPartida } from "@/utils/historialJugador";
import BarraBalance from "@/components/DetalleJugador/BarraBalance.vue";
import CardPartidaTorneo from "@/components/PartidasTorneo/CardPartidaTorneo.vue";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";

// Las partidas jugadas de un jugador, de eventos o amistosas, con su balance, filtros y buscador
const props = defineProps<{
  // Todas las jugadas, de la más reciente a la más antigua: aquí se quedan las del origen
  partidas: PartidaJugada[];
  origen: "torneo" | "amistosa";
  idUsuario: number;
}>();

const TANDA = 12;
const RESULTADOS: { valor: ResultadoPartida | "todas"; titulo: string }[] = [
  { valor: "todas", titulo: "Todas" },
  { valor: "V", titulo: "Victorias" },
  { valor: "E", titulo: "Empates" },
  { valor: "D", titulo: "Derrotas" },
];

const filtroResultado = ref<ResultadoPartida | "todas">("todas");
const filtroFormato = ref<string>("todos");
const busqueda = ref<string | null>("");
const cuantasVer = ref(TANDA);

const propias = computed(() => props.partidas.filter(p => p.origen === props.origen));

// Torneo, Liga o Copa: el filtro solo sale si ha jugado más de uno
const formatoDe = (p: PartidaJugada) => nombreEvento(p.formato);
const formatos = computed(() =>
  props.origen === "torneo" ? [...new Set(propias.value.map(formatoDe))] : []
);
const plural = (nombre: string) => (nombre === "Torneo" ? "Torneos" : `${nombre}s`);

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Todos los filtros menos el de resultado: así cada pastilla dice cuántas tiene
const sinResultado = computed(() => {
  const texto = normalizar(busqueda.value ?? "").trim();
  return propias.value.filter(
    p =>
      (filtroFormato.value === "todos" || formatoDe(p) === filtroFormato.value) &&
      (!texto ||
        normalizar(p.nickRival).includes(texto) ||
        normalizar(p.evento ?? "").includes(texto))
  );
});
const cuantos = (valor: ResultadoPartida | "todas") =>
  valor === "todas"
    ? sinResultado.value.length
    : sinResultado.value.filter(p => p.resultado === valor).length;

const filtradas = computed(() =>
  filtroResultado.value === "todas"
    ? sinResultado.value
    : sinResultado.value.filter(p => p.resultado === filtroResultado.value)
);
const visibles = computed(() => filtradas.value.slice(0, cuantasVer.value));
const balance = computed(() => balanceDe(sinResultado.value));
const titulo = computed(() => (props.origen === "torneo" ? "En eventos" : "En amistosas"));

// Al cambiar un filtro se vuelve a la primera tanda; al pasar a otro jugador, todo de cero
watch([filtroResultado, filtroFormato, busqueda], () => {
  cuantasVer.value = TANDA;
});
watch(
  () => props.idUsuario,
  () => {
    filtroResultado.value = "todas";
    filtroFormato.value = "todos";
    busqueda.value = "";
    cuantasVer.value = TANDA;
  }
);
</script>
