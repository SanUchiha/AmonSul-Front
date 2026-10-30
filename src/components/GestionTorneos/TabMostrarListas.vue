<template>
  <!-- Sencilla a propósito: cada jugador con sus ejércitos; el bando, solo en el filtro -->
  <v-card flat class="listas-live mx-auto">
    <!-- Cabecera: resumen, buscador y filtro por bando -->
    <div class="pa-3">
      <p v-if="!isLoading" class="text-caption text-medium-emphasis mb-2">{{ resumen }}</p>

      <v-text-field
        v-model="search"
        :placeholder="porEquipos ? 'Buscar equipo, jugador o ejército' : 'Buscar jugador o ejército'"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="mb-2"
      />

      <v-chip-group v-model="filtroBando" mandatory selected-class="text-primary" column>
        <v-chip value="todos" size="small" variant="text">Todas ({{ cuentaBando.todos }})</v-chip>
        <v-chip value="good" size="small" variant="text">Luz ({{ cuentaBando.good }})</v-chip>
        <v-chip value="evil" size="small" variant="text">Oscuridad ({{ cuentaBando.evil }})</v-chip>
      </v-chip-group>
    </div>

    <v-divider />

    <div v-if="isLoading" class="pa-3">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item-avatar-two-line" />
    </div>

    <!-- INDIVIDUAL: un jugador por fila, con cada una de sus listas debajo -->
    <template v-else-if="!porEquipos">
      <p v-if="jugadoresVisibles.length === 0" class="text-center text-medium-emphasis pa-6">
        {{ textoVacio }}
      </p>
      <div v-for="jugador in jugadoresVisibles" :key="jugador.idUsuario" class="fila-jugador">
        <FilaListasJugador
          :jugador="jugador"
          :cargandoLista="cargandoLista"
          @ver="verLista"
          @perfil="goToUserDetail"
        />
      </div>
    </template>

    <!-- EQUIPOS Y PAREJAS: un desplegable por equipo -->
    <template v-else>
      <p v-if="equiposVisibles.length === 0" class="text-center text-medium-emphasis pa-6">
        {{ textoVacio }}
      </p>
      <v-expansion-panels v-else v-model="equiposAbiertos" multiple variant="accordion">
        <v-expansion-panel
          v-for="equipo in equiposVisibles"
          :key="equipo.nombre"
          :value="equipo.nombre"
        >
          <v-expansion-panel-title>
            <div class="d-flex align-center ga-2 min-w-0">
              <span class="font-weight-bold text-truncate">{{ equipo.nombre }}</span>
              <!-- Los que tiene el equipo, aunque la búsqueda solo muestre a alguno -->
              <span class="text-caption text-medium-emphasis flex-shrink-0">
                {{ equipo.total }} {{ equipo.total === 1 ? "jugador" : "jugadores" }}
              </span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="panel-equipo">
            <div v-for="jugador in equipo.jugadores" :key="jugador.idUsuario" class="fila-jugador">
              <FilaListasJugador
                :jugador="jugador"
                :cargandoLista="cargandoLista"
                @ver="verLista"
                @perfil="goToUserDetail"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </v-card>

  <ModalVerLista v-model:isVisible="showVerListaModal" :listaJugador="listaJugador!" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Torneo, TorneoGestionInfoDTO, TorneoGestionInfoMasDTO } from "@/interfaces/Torneo";
import { TorneoEquipoGestionInfoDTO } from "@/interfaces/Inscripcion";
import { JugadorListas, ListaDeJugador, ListaJugador } from "@/interfaces/Lista";
import { getListaById } from "@/services/ListasService";
import {
  getInfoTorneoCreado,
  getInfoTorneoCreadoMasAsync,
  getInfoTorneoEquipoCreado,
} from "@/services/TorneosService";
import { appsettings } from "@/settings/appsettings";
import { esUsuarioBye } from "@/utils/bye";
import ModalVerLista from "../Inscripcion/ModalVerLista.vue";
import FilaListasJugador from "./FilaListasJugador.vue";

const props = defineProps<{
  torneo: Torneo | undefined;
}>();

type Bando = "good" | "evil";
type Filtro = "todos" | Bando;
interface EquipoListas {
  nombre: string;
  jugadores: JugadorListas[];
}

const router = useRouter();
const isLoading = ref(true);
const search = ref<string | null>("");
const filtroBando = ref<Filtro>("todos");
const jugadores = ref<JugadorListas[]>([]);
const equipos = ref<EquipoListas[]>([]);
const equiposAbiertos = ref<string[]>([]);
const cargandoLista = ref<number | null>(null);
const listaJugador = ref<ListaJugador>();
const showVerListaModal = ref(false);

const porEquipos = computed(() => !!props.torneo && props.torneo.tipoTorneo !== "Individual");

// El bando de la lista o, si no viene, el de su ejército
const bandoDe = (bando?: string | null, ejercito?: string | null): Bando | null => {
  if (bando === "good" || bando === "evil") return bando;
  const band = appsettings.armies.find(e => e.name === ejercito)?.band;
  return band === "good" || band === "evil" ? band : null;
};

const lista = (idLista?: number | null, ejercito?: string | null, bando?: string | null): ListaDeJugador[] =>
  idLista ? [{ idLista, ejercito: ejercito ?? "Sin ejército", bando: bandoDe(bando, ejercito) }] : [];

const porNick = (a: JugadorListas, b: JugadorListas) =>
  a.nick.localeCompare(b.nick, "es", { sensitivity: "base" });

watch(
  () => props.torneo,
  async torneo => {
    if (!torneo) return;
    isLoading.value = true;
    try {
      if (torneo.tipoTorneo !== "Individual") {
        const info: TorneoEquipoGestionInfoDTO = (await getInfoTorneoEquipoCreado(torneo.idTorneo)).data;
        equipos.value = (info.equipos ?? [])
          .filter(e => !esUsuarioBye(e.idCapitan, e.nombreEquipo))
          .map(e => ({
            nombre: e.nombreEquipo ?? "Equipo",
            jugadores: e.inscripciones
              .map(i => ({
                idUsuario: i.idUsuario,
                nick: i.nick,
                listas: lista(i.idLista, i.ejercito, i.bando),
              }))
              .sort(porNick),
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
      } else if ((torneo.listasPorJugador ?? 1) > 1) {
        // Varias listas por jugador: todas las que ha entregado
        const info: TorneoGestionInfoMasDTO = (await getInfoTorneoCreadoMasAsync(torneo.idTorneo)).data;
        jugadores.value = (info.inscripciones ?? [])
          .filter(i => !esUsuarioBye(i.idUsuario, i.nick))
          .map(i => ({
            idUsuario: i.idUsuario,
            nick: i.nick,
            listas: (i.lista ?? []).flatMap(l => lista(l.idLista, l.ejercito, l.bando)),
          }))
          .sort(porNick);
      } else {
        const info: TorneoGestionInfoDTO = (await getInfoTorneoCreado(torneo.idTorneo)).data;
        jugadores.value = (info.inscripciones ?? [])
          .filter(i => !esUsuarioBye(i.idUsuario, i.nick))
          .map(i => ({
            idUsuario: i.idUsuario,
            nick: i.nick ?? "",
            listas: lista(i.idLista, i.ejercito, i.bando),
          }))
          .sort(porNick);
      }
    } catch (error) {
      console.error("Error al obtener las listas:", error);
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

// Búsqueda sin tildes ni mayúsculas
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const texto = computed(() => normalizar((search.value ?? "").trim()));

// Las listas que pasan el filtro de bando; con «Todas», también quien aún no ha entregado
const filtrarJugador = (jugador: JugadorListas, extra = ""): JugadorListas | null => {
  const listas =
    filtroBando.value === "todos"
      ? jugador.listas
      : jugador.listas.filter(l => l.bando === filtroBando.value);
  if (filtroBando.value !== "todos" && listas.length === 0) return null;
  if (texto.value) {
    const donde = normalizar([extra, jugador.nick, ...listas.map(l => l.ejercito)].join(" "));
    if (!donde.includes(texto.value)) return null;
  }
  return { ...jugador, listas };
};

const jugadoresVisibles = computed(() =>
  jugadores.value.map(j => filtrarJugador(j)).filter((j): j is JugadorListas => j !== null)
);

const equiposVisibles = computed(() =>
  equipos.value
    .map(e => ({
      ...e,
      total: e.jugadores.length,
      jugadores: e.jugadores
        .map(j => filtrarJugador(j, e.nombre))
        .filter((j): j is JugadorListas => j !== null),
    }))
    .filter(e => e.jugadores.length > 0)
);

// Al buscar o filtrar se abren los equipos que coinciden
watch([texto, filtroBando], () => {
  equiposAbiertos.value = texto.value || filtroBando.value !== "todos" ? equiposVisibles.value.map(e => e.nombre) : [];
});

const todasLasListas = computed(() =>
  (porEquipos.value ? equipos.value.flatMap(e => e.jugadores) : jugadores.value).flatMap(j => j.listas)
);
const cuentaBando = computed(() => ({
  todos: todasLasListas.value.length,
  good: todasLasListas.value.filter(l => l.bando === "good").length,
  evil: todasLasListas.value.filter(l => l.bando === "evil").length,
}));

const resumen = computed(() => {
  if (porEquipos.value) {
    const n = equipos.value.length;
    const nombre = props.torneo?.tipoTorneo === "Parejas" ? (n === 1 ? "pareja" : "parejas") : n === 1 ? "equipo" : "equipos";
    return `${n} ${nombre} · ${cuentaBando.value.todos} listas`;
  }
  const n = jugadores.value.length;
  return `${n} ${n === 1 ? "jugador" : "jugadores"} · ${cuentaBando.value.todos} listas`;
});

const textoVacio = computed(() =>
  texto.value || filtroBando.value !== "todos"
    ? "Nada coincide con la búsqueda."
    : "Todavía no hay inscritos."
);

const verLista = async (jugador: JugadorListas, listaElegida: ListaDeJugador) => {
  cargandoLista.value = listaElegida.idLista;
  try {
    const { data } = await getListaById(listaElegida.idLista);
    listaJugador.value = { listaData: data.listaData, nick: jugador.nick, nombreEjercito: listaElegida.ejercito };
    showVerListaModal.value = true;
  } catch (error) {
    console.error("Error al cargar la lista:", error);
  } finally {
    cargandoLista.value = null;
  }
};

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario } });
};
</script>

<style scoped>
/* En el ordenador, estrecha: Ver queda cerca del nombre */
.listas-live {
  max-width: 720px;
}

/* Los jugadores, alineados con el nombre del equipo: la fila ya lleva su propio margen */
.panel-equipo :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 0 0 12px;
}

.fila-jugador + .fila-jugador {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
