<template>
  <v-container class="text-center">
    <v-row dense>
      <v-col cols="12" md="12" class="text-center">
        <div v-if="isLoading">
          <LoadingGandalf />
        </div>
        <div v-else>
          <!-- Lo esencial, siempre a la vista -->
          <CabeceraJugador :usuario="usuarioData" :partidas="partidas" />

          <div ref="pestanas">
            <v-tabs v-model="tab" color="primary" grow show-arrows>
              <v-tab value="resumen">Resumen</v-tab>
              <v-tab value="amistosas">Amistosas</v-tab>
              <v-tab value="eventos">Eventos</v-tab>
              <v-tab value="resultados">Resultados</v-tab>
            </v-tabs>
          </div>

          <v-window v-model="tab">
            <v-window-item value="resumen">
              <div class="pa-2">
                <ResumenJugador
                  :usuario="usuarioData"
                  :partidas="partidas"
                  :idUsuarioQueMira="idUsuarioQueMira"
                  @filtrar="verPartidasFiltradas"
                />
              </div>
            </v-window-item>

            <v-window-item value="amistosas">
              <div class="pa-2">
                <PartidasJugador
                  :partidas="partidas"
                  origen="amistosa"
                  :idUsuario="usuarioData.idUsuario"
                  :filtro="filtroConNick"
                  @update:filtro="filtroPartidas = $event"
                />
              </div>
            </v-window-item>

            <v-window-item value="eventos">
              <div class="pa-2">
                <PartidasJugador
                  :partidas="partidas"
                  origen="torneo"
                  :idUsuario="usuarioData.idUsuario"
                  :filtro="filtroConNick"
                  @update:filtro="filtroPartidas = $event"
                />
              </div>
            </v-window-item>

            <v-window-item value="resultados">
              <div class="pa-2">
              <TablaTorneosDisputados
                :clasificacionTorneos="usuarioData.clasificacionTorneos"
                :tournamentMatches="tournamentMatches"
                :idUsuario="usuarioData.idUsuario"
                :isLoading="isLoadingTournamentMatches"
              />
              </div>
            </v-window-item>
          </v-window>
        </div>
      </v-col>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn
            color="orange"
            variant="tonal"
            class="login-form__button mt-4"
            @click="goBack"
          >
            Volver
          </v-btn>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, ComputedRef, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CabeceraJugador from "@/components/DetalleJugador/CabeceraJugador.vue";
import ResumenJugador from "@/components/DetalleJugador/ResumenJugador.vue";
import { FiltroPartidas, partidasJugadas } from "@/utils/historialJugador";
import { useAuth } from "@/composables/useAuth";
import {
  ViewPartidaAmistosaDTO,
  ViewPartidaTorneoDTO,
} from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from "@/store/usuarios";
import PartidasJugador from "@/components/DetalleJugador/PartidasJugador.vue";
import { getTournamentMatches } from "@/services/PartidaTorneoService";
import TablaTorneosDisputados from "@/components/DetalleJugador/TablaTorneosDisputados.vue";

const router = useRouter();
const route = useRoute();

// La pestaña y el filtro van en la URL (?pestana=eventos&rival=12): volver atrás los conserva y se pueden compartir
const PESTANAS = ["resumen", "amistosas", "eventos", "resultados"] as const;
type Pestana = (typeof PESTANAS)[number];
const textoDeQuery = (valor: unknown) => (typeof valor === "string" && valor ? valor : undefined);
const pestanaDeRuta = (): Pestana => {
  const pestana = textoDeQuery(route.query.pestana) as Pestana | undefined;
  return pestana && PESTANAS.includes(pestana) ? pestana : "resumen";
};
const filtroDeRuta = (): FiltroPartidas | null => {
  const idRival = Number(route.query.rival);
  if (Number.isInteger(idRival) && idRival > 0) return { idRival };
  const ejercito = textoDeQuery(route.query.ejercito);
  return ejercito ? { ejercito } : null;
};

const tab = ref<Pestana>(pestanaDeRuta());
const pestanas = ref<HTMLElement>();

// Un ejército o un rival pulsado en el resumen: sus partidas, en eventos o en amistosas, con las pestañas a la vista
const filtroPartidas = ref<FiltroPartidas | null>(filtroDeRuta());
const verPartidasFiltradas = async (filtro: FiltroPartidas, origen: "torneo" | "amistosa") => {
  filtroPartidas.value = filtro;
  tab.value = origen === "amistosa" ? "amistosas" : "eventos";
  await nextTick();
  // Por debajo de la barra de arriba, que es fija
  const arriba = pestanas.value?.getBoundingClientRect().top;
  if (arriba !== undefined)
    window.scrollTo({ top: window.scrollY + arriba - 72, behavior: "smooth" });
};
const usuariosStore = useUsuariosStore();

const isLoading = ref(true);
const isLoadingTournamentMatches = ref<boolean>(false);

watch([tab, filtroPartidas], () => {
  const query: Record<string, string> = {};
  if (tab.value !== "resumen") query.pestana = tab.value;
  if (filtroPartidas.value?.idRival != null) query.rival = String(filtroPartidas.value.idRival);
  else if (filtroPartidas.value?.ejercito) query.ejercito = filtroPartidas.value.ejercito;
  const actual = route.query;
  const igual =
    Object.keys(query).length === Object.keys(actual).length &&
    Object.entries(query).every(([clave, valor]) => actual[clave] === valor);
  if (!igual) router.replace({ query });
});
const usuarioData: ComputedRef<UsuarioDataDTO> = computed(
  () => usuariosStore.usuarioData
);

const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const validMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const tournamentMatches = ref<ViewPartidaTorneoDTO[]>([]);

// Torneo y amistosas juntas, solo las jugadas: para la cabecera y el resumen
const partidas = computed(() =>
  usuarioData.value?.idUsuario
    ? partidasJugadas(usuarioData.value.idUsuario, tournamentMatches.value, validMatches.value)
    : []
);
// Con el rival en la URL solo viene su id: el nick sale de sus partidas
const filtroConNick = computed<FiltroPartidas | null>(() => {
  const filtro = filtroPartidas.value;
  if (filtro?.idRival == null || filtro.nickRival) return filtro;
  const idRival = filtro.idRival;
  const partida = partidas.value.find(p => p.idsRivales.includes(idRival));
  return { ...filtro, nickRival: partida?.nicksRivales[partida.idsRivales.indexOf(idRival)] || "su rival" };
});
const { getidUsuario } = useAuth();
const idUsuarioQueMira = computed(() =>
  getidUsuario.value ? Number(getidUsuario.value) : null
);

const cargarPartidasTorneos = async () => {
  try {
    isLoadingTournamentMatches.value = true;
    const response = await getTournamentMatches(usuarioData.value.idUsuario);

    tournamentMatches.value = response.data;
    tournamentMatches.value = tournamentMatches.value.sort((a, b) => {
      return (
        new Date(b.fechaPartida).getTime() - new Date(a.fechaPartida).getTime()
      );
    });
  } catch (error) {
    console.error("Error al obtener las partidas de torneo:", error);
  } finally {
    isLoadingTournamentMatches.value = false;
  }
};

const initializeComponent = async () => {
  isLoading.value = true;
  try {
    const idRecibido = String(route.params.idUsuario);
    await usuariosStore.requestUsuarioData(parseInt(idRecibido));

    // Verifica la estructura de usuarioResponse
    if (usuarioData.value.idUsuario) {
      validMatches.value = usuarioData.value.partidasValidadas.sort((a, b) => {
        return (
          new Date(b.fechaPartida).getTime() -
          new Date(a.fechaPartida).getTime()
        );
      });
      pendingMatches.value = usuarioData.value.partidasPendientes.sort(
        (a, b) => {
          return (
            new Date(b.fechaPartida).getTime() -
            new Date(a.fechaPartida).getTime()
          );
        }
      );
      cargarPartidasTorneos();
    }
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeComponent);

// Ir de un jugador a otro (p. ej. pulsando un nick) reutiliza esta vista: recargar datos
watch(
  () => route.params.idUsuario,
  (nuevoId, anteriorId) => {
    if (nuevoId && nuevoId !== anteriorId) {
      // Lo que diga la URL del otro jugador: sin nada, su resumen; al volver atrás, lo que se estaba viendo
      tab.value = pestanaDeRuta();
      filtroPartidas.value = filtroDeRuta();
      initializeComponent();
    }
  }
);

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.separated {
  margin-bottom: 20px;
}

.login-form {
  position: relative;

  @media screen and (max-width: 720px) {
    height: 100%;
  }

  &__button {
    @media screen and (max-width: 720px) {
      width: calc(100% - 24px);
    }
  }
}
</style>
