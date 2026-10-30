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

          <v-tabs v-model="tab" color="primary" grow show-arrows>
            <v-tab value="1">Resumen</v-tab>
            <v-tab value="2">Amistosas</v-tab>
            <v-tab value="3">Eventos</v-tab>
            <v-tab value="4">Resultados</v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item value="1">
              <div class="pa-2">
                <ResumenJugador
                  :usuario="usuarioData"
                  :partidas="partidas"
                  :idUsuarioQueMira="idUsuarioQueMira"
                />
              </div>
            </v-window-item>

            <v-window-item value="2">
              <div class="pa-2">
                <PartidasJugador
                  :partidas="partidas"
                  origen="amistosa"
                  :idUsuario="usuarioData.idUsuario"
                />
              </div>
            </v-window-item>

            <v-window-item value="3">
              <div class="pa-2">
                <PartidasJugador
                  :partidas="partidas"
                  origen="torneo"
                  :idUsuario="usuarioData.idUsuario"
                />
              </div>
            </v-window-item>

            <v-window-item value="4">
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
import { ref, onMounted, computed, ComputedRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import CabeceraJugador from "@/components/DetalleJugador/CabeceraJugador.vue";
import ResumenJugador from "@/components/DetalleJugador/ResumenJugador.vue";
import { partidasJugadas } from "@/utils/historialJugador";
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

const tab = ref<string>("1");
const usuariosStore = useUsuariosStore();

const isLoading = ref(true);
const isLoadingTournamentMatches = ref<boolean>(false);

const router = useRouter();
const route = useRoute();
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
    if (nuevoId && nuevoId !== anteriorId) initializeComponent();
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
