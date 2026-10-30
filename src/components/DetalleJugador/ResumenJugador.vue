<template>
  <div class="text-left">
    <!-- ELO -->
    <h2 class="text-subtitle-1 font-weight-bold mb-1">Evolución del ELO</h2>
    <SparklineElo :idUsuario="usuario.idUsuario" />

    <!-- Balance -->
    <h2 class="text-subtitle-1 font-weight-bold mt-4 mb-1">Balance</h2>
    <v-card class="pa-3 mb-2" variant="outlined">
      <p v-if="balanceTotal.total === 0" class="text-body-2 text-medium-emphasis">
        Aún no tiene partidas jugadas.
      </p>
      <template v-else>
        <BarraBalance
          v-for="fila in filasBalance"
          :key="fila.titulo"
          :titulo="fila.titulo"
          :balance="fila.balance"
          class="mb-3"
        />
      </template>
    </v-card>

    <!-- Ejércitos -->
    <template v-if="partidas.some(p => p.ejercito)">
      <h2 class="text-subtitle-1 font-weight-bold mt-4 mb-1">Ejércitos más jugados</h2>
      <v-card class="pa-3 mb-2" variant="outlined">
        <v-chip-group
          v-model="origenEjercitos"
          mandatory
          column
          selected-class="text-primary"
          class="mb-1"
        >
          <v-chip v-for="o in ORIGENES" :key="o.valor" :value="o.valor" size="small" filter>
            {{ o.titulo }}
          </v-chip>
        </v-chip-group>
        <p v-if="ejercitos.length === 0" class="text-body-2 text-medium-emphasis">
          No tiene {{ origenEjercitos === "torneo" ? "partidas de eventos" : "amistosas" }} con ejército.
        </p>
        <!-- Los tres más jugados siempre; el resto, al desplegar -->
        <div
          v-for="ejercito in ejercitosVisibles"
          :key="ejercito.nombre"
          class="d-flex align-center ga-2 mb-2"
        >
          <v-icon
            size="small"
            icon="mdi-shield"
            :color="ejercito.bando === 'good' ? 'success' : ejercito.bando === 'evil' ? 'purple' : 'grey'"
            :title="ejercito.bando === 'good' ? 'Bien' : ejercito.bando === 'evil' ? 'Oscuridad' : ''"
          />
          <div class="flex-grow-1 min-w-0">
            <div class="text-body-2 font-weight-bold text-wrap">{{ ejercito.nombre }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ ejercito.balance.total }} {{ ejercito.balance.total === 1 ? "partida" : "partidas" }} ·
              {{ ejercito.balance.victorias }}-{{ ejercito.balance.empates }}-{{ ejercito.balance.derrotas }}
            </div>
          </div>
          <span class="text-body-2 font-weight-bold">{{ ejercito.balance.porcentaje }}%</span>
        </div>
        <v-btn
          v-if="ejercitos.length > 3"
          variant="text"
          size="small"
          class="px-0"
          :append-icon="verTodosEjercitos ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="verTodosEjercitos = !verTodosEjercitos"
        >
          {{
            verTodosEjercitos
              ? "Ver solo los tres más jugados"
              : `Ver ${ejercitos.length - 3 === 1 ? "el otro" : `los otros ${ejercitos.length - 3}`}`
          }}
        </v-btn>
      </v-card>
    </template>

    <!-- Mejores resultados -->
    <h2 class="text-subtitle-1 font-weight-bold mt-4 mb-1">Mejores resultados</h2>
    <v-card class="pa-3 mb-2" variant="outlined">
      <p v-if="resultados.length === 0" class="text-body-2 text-medium-emphasis mb-0">
        Aún no tiene resultados en eventos.
      </p>
      <template v-else>
        <!-- Los tres mejores siempre; el resto, al desplegar -->
        <div
          v-for="resultado in resultadosVisibles"
          :key="`${resultado.idTorneo}-${resultado.nombreTorneo}`"
          class="d-flex align-center ga-2 mb-1"
        >
          <v-icon
            size="small"
            :icon="resultado.resultado <= 3 ? 'mdi-trophy' : 'mdi-flag-checkered'"
            :color="colorPuesto(resultado.resultado)"
          />
          <span class="text-body-2 flex-grow-1 text-wrap">{{ resultado.nombreTorneo }}</span>
          <span class="text-body-2 font-weight-bold text-no-wrap">
            {{ textoPosicion(resultado.resultado, resultado.totalJugadores) }}
          </span>
        </div>
        <v-btn
          v-if="resultados.length > 3"
          variant="text"
          size="small"
          class="mt-1 px-0"
          :append-icon="verTodosResultados ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="verTodosResultados = !verTodosResultados"
        >
          {{
            verTodosResultados
              ? "Ver solo los tres mejores"
              : `Ver ${resultados.length - 3 === 1 ? "el otro" : `los otros ${resultados.length - 3}`}`
          }}
        </v-btn>
      </template>
    </v-card>

    <!-- Cara a cara con quien mira -->
    <template v-if="caraACara">
      <h2 class="text-subtitle-1 font-weight-bold mt-4 mb-1">Tú contra {{ usuario.nick }}</h2>
      <v-card class="pa-3 mb-2" variant="outlined">
        <v-chip-group
          v-model="origenCara"
          mandatory
          column
          selected-class="text-primary"
          class="mb-1"
        >
          <v-chip v-for="o in ORIGENES" :key="o.valor" :value="o.valor" size="small" filter>
            {{ o.titulo }}
          </v-chip>
        </v-chip-group>
        <p v-if="caraACara.balance.total === 0" class="text-body-2 text-medium-emphasis mb-0">
          {{
            origenCara === "todas"
              ? "Aún no habéis jugado ninguna partida."
              : origenCara === "torneo"
                ? "Aún no habéis jugado en ningún evento."
                : "Aún no habéis jugado ninguna amistosa."
          }}
        </p>
        <template v-else>
          <div class="d-flex justify-space-around text-center mb-2">
            <div>
              <div class="text-h6 text-success">{{ caraACara.balance.victorias }}</div>
              <div class="text-caption">Ganadas</div>
            </div>
            <div>
              <div class="text-h6 text-medium-emphasis">{{ caraACara.balance.empates }}</div>
              <div class="text-caption">Empatadas</div>
            </div>
            <div>
              <div class="text-h6 text-error">{{ caraACara.balance.derrotas }}</div>
              <div class="text-caption">Perdidas</div>
            </div>
          </div>
          <!-- Todas las partidas entre los dos, de la más reciente a la más antigua -->
          <v-btn
            variant="text"
            size="small"
            class="mt-1 px-0"
            :append-icon="verPartidasCara ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="verPartidasCara = !verPartidasCara"
          >
            {{ verPartidasCara ? "Ocultar las partidas" : `Ver ${caraACara.partidas.length === 1 ? "la partida" : `las ${caraACara.partidas.length} partidas`}` }}
          </v-btn>
          <v-expand-transition>
            <div v-show="verPartidasCara">
              <div
                v-for="partida in caraACara.partidas"
                :key="partida.clave"
                class="partida-cara py-2"
              >
                <div class="d-flex align-center ga-2">
                  <v-chip size="x-small" label :color="colorResultado(partida.resultado)">
                    {{ partida.resultado }}
                  </v-chip>
                  <span class="text-body-2 font-weight-bold">
                    Tú {{ partida.rival }} - {{ partida.propios }} {{ usuario.nick }}
                  </span>
                  <span class="text-caption text-medium-emphasis ms-auto text-no-wrap">
                    {{ fecha(partida.fecha) }}
                  </span>
                </div>
                <div class="text-caption text-medium-emphasis text-wrap">
                  {{ partida.evento ?? "Amistosa" }}
                </div>
                <div
                  v-if="partida.ejercito || partida.ejercitoRival"
                  class="text-caption text-wrap"
                >
                  {{ partida.ejercitoRival ?? "—" }} contra {{ partida.ejercito ?? "—" }}
                </div>
              </div>
            </div>
          </v-expand-transition>
        </template>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, watch } from "vue";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { appsettings } from "@/settings/appsettings";
import {
  balanceDe,
  PartidaJugada,
  ResultadoPartida,
  textoPosicion,
} from "@/utils/historialJugador";
import SparklineElo from "@/components/Elo/SparklineElo.vue";
import BarraBalance from "@/components/DetalleJugador/BarraBalance.vue";

const props = defineProps<{
  usuario: UsuarioDataDTO;
  // Ya ordenadas de la más reciente a la más antigua
  partidas: PartidaJugada[];
  // Quien mira, para el cara a cara; si es el mismo jugador, no sale
  idUsuarioQueMira?: number | null;
}>();


// Qué partidas cuentan en los ejércitos y en el cara a cara: las de eventos, las amistosas o todas
type Origen = "todas" | "torneo" | "amistosa";
const ORIGENES: { valor: Origen; titulo: string }[] = [
  { valor: "todas", titulo: "Todas" },
  { valor: "torneo", titulo: "Eventos" },
  { valor: "amistosa", titulo: "Amistosas" },
];
const origenEjercitos = ref<Origen>("todas");
const origenCara = ref<Origen>("todas");
const deOrigen = (partidas: PartidaJugada[], origen: Origen) =>
  origen === "todas" ? partidas : partidas.filter(p => p.origen === origen);
const fecha = (valor: string) => new Date(valor).toLocaleDateString("es-ES");

const balanceTotal = computed(() => balanceDe(props.partidas));
const filasBalance = computed(() => [
  { titulo: "Total", balance: balanceTotal.value },
  { titulo: "Eventos", balance: balanceDe(props.partidas.filter(p => p.origen === "torneo")) },
  { titulo: "Amistosas", balance: balanceDe(props.partidas.filter(p => p.origen === "amistosa")) },
]);

// Los nombres de ejército no siempre se escriben igual: sin mayúsculas, tildes ni "The" delante para agruparlos y
// buscar su bando
const normalizar = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "");
const ejercitosApp = new Map(appsettings.armies.map(a => [normalizar(a.name), a]));

// Todos, del más jugado al menos; a igual número de partidas, el de más victorias
const ejercitos = computed(() => {
  const porEjercito = new Map<string, { nombre: string; partidas: PartidaJugada[] }>();
  deOrigen(props.partidas, origenEjercitos.value).forEach(p => {
    if (!p.ejercito) return;
    const clave = normalizar(p.ejercito);
    const grupo = porEjercito.get(clave) ?? {
      nombre: ejercitosApp.get(clave)?.name ?? p.ejercito,
      partidas: [],
    };
    grupo.partidas.push(p);
    porEjercito.set(clave, grupo);
  });
  return [...porEjercito.entries()]
    .map(([clave, { nombre, partidas }]) => ({
      nombre,
      bando: ejercitosApp.get(clave)?.band,
      balance: balanceDe(partidas),
    }))
    .sort((a, b) => b.balance.total - a.balance.total || b.balance.porcentaje - a.balance.porcentaje);
});

// Los eventos con posición final, del mejor puesto al peor; a igual puesto, el más reciente primero
const resultados = computed(() =>
  [...(props.usuario.clasificacionTorneos ?? [])]
    .filter(r => r.resultado > 0)
    .sort((a, b) => a.resultado - b.resultado || (b.idTorneo ?? 0) - (a.idTorneo ?? 0))
);
const resultadosVisibles = computed(() =>
  verTodosResultados.value ? resultados.value : resultados.value.slice(0, 3)
);
const colorPuesto = (puesto: number) =>
  puesto === 1 ? "amber" : puesto === 2 ? "blue-grey-lighten-2" : puesto === 3 ? "brown-lighten-1" : "grey";

// Visto desde quien mira: las victorias del jugador son sus derrotas
const invertir = (resultado: ResultadoPartida): ResultadoPartida =>
  resultado === "V" ? "D" : resultado === "D" ? "V" : "E";
const caraACara = computed(() => {
  const id = props.idUsuarioQueMira;
  if (!id || id === props.usuario.idUsuario) return null;
  const entreLosDos = deOrigen(props.partidas, origenCara.value)
    .filter(p => p.idsRivales.includes(id))
    .map(p => ({ ...p, resultado: invertir(p.resultado) }));
  return {
    balance: balanceDe(entreLosDos),
    partidas: entreLosDos,
  };
});
// Los desplegables, cerrados al empezar y al pasar a otro jugador: la vista se reutiliza
const verPartidasCara = ref(false);
const verTodosResultados = ref(false);
const verTodosEjercitos = ref(false);
watch(
  () => props.usuario.idUsuario,
  () => {
    verPartidasCara.value = false;
    verTodosResultados.value = false;
    verTodosEjercitos.value = false;
  }
);
const ejercitosVisibles = computed(() =>
  verTodosEjercitos.value ? ejercitos.value : ejercitos.value.slice(0, 3)
);
const colorResultado = (resultado: ResultadoPartida) =>
  resultado === "V" ? "success" : resultado === "D" ? "error" : "grey";
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}
.partida-cara + .partida-cara {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
