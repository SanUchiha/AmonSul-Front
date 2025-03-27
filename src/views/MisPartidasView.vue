<template>
  <v-container class="text-center">
    <!-- Modal aviso -->
    <!-- <ModalAviso /> -->
    <div v-if="isLoading">
      <LoadingGandalf />
    </div>
    <div v-else>
      <!-- Titulo -->
      <CardTitleMisPartidas message="Mis Partidas" textsize="text-h4" />
      <v-spacer class="my-4"></v-spacer>

      <!-- Resumen partidas -->
      <v-card class="section-card stats-section pt-0 mt-0">
        <v-col cols="12"><p class="text-h5 ringbearer">Estadísticas</p></v-col>
        <v-divider></v-divider>
        <v-col cols="12" md="12" class="text-center">
          <!--<CardResumenPartidas :usuario="usuarioData" />-->
          <CardEstadisticas :usuario="usuarioData" @filtroCambiar="filtrarPartidas"/>
        </v-col>
      </v-card>
      <!-- Boton partidas -->
      <div
        v-if="$vuetify.display.mdAndUp"
        class="custom-btn d-flex align-center fab-btn"
        @click="dialog = true"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <transition name="slide-fade">
          <span v-if="isHovering" class="text-button ringbearer"
            >Nueva partida</span
          >
        </transition>
        <img
          src="@/assets/icons/nuevaPartida.png"
          alt="Icono personalizado"
          width="80"
          height="80"
        />
      </div>

      <!-- partidas pendientes -->
      <div v-if="pendingMatches.length > 0 && !isLoadingPending">
        <v-card class="section-card stats-section pt-0 mt-0">
          <!--<v-col cols="12"><CardTitleMisPartidas message="Partidas pendientes de validar" textsize="text-h5"></CardTitleMisPartidas></v-col>-->
          <v-col cols="12"
            ><p class="text-h5 ringbearer">
              Partidas pendientes de validar
            </p></v-col
          >
          <v-divider></v-divider>
          <v-col
            cols="12"
            sm="8"
            offset-sm="2"
            md="6"
            offset-md="3"
            v-for="match in pendingMatches"
            :key="match.idPartidaAmistosa"
          >
            <PendingMatchCard
              :match="match"
              class="mb-4"
              @registroExitoso="refrescarPartidas"
            />
          </v-col>
        </v-card>
      </div>

      <!-- partidas validadas -->
      <!-- TODO Hacer un infinite scroll-->
      <div v-if="!isLoadingValidadas && validMatches.length > 0">
        <v-card class="section-card stats-section pt-0 mt-0">
          <v-col cols="12"
            ><p class="text-h5 ringbearer">Partidas validadas</p></v-col
          >
          <v-divider></v-divider>
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="6"
              lg="4"
              xl="4"
              class="pb-0"
              v-for="match in partidasFiltradas"
              :key="match.idPartidaAmistosa"
            >
              <ValidadasMatchCard
                :idUsuario="idUsuarioLogger"
                :match="match"
                class="mb-4"
              />
            </v-col>
          </v-row>
        </v-card>
      </div>
      <div v-else>
        <h3>No tienes partidas validadas</h3>
      </div>
      <v-divider class="my-3"></v-divider>
    </div>

    <v-bottom-navigation
      v-if="$vuetify.display.smAndDown"
      app
      fixed
      height="64"
      color="primary"
      grow
      class="bottom-nav"
    >
      <!-- Botón 1: Modal registrar partida -->
      <v-btn icon @click="openRegistroPartida" class="animated-btn">
        <img src="@/assets/icons/nuevaPartida.png" alt="Icono personalizado" width="50" height="50">
        Nueva Partida
      </v-btn>

      <!-- Botón 2: Ruta (cuando definas) 
      <v-btn
        icon
        :to="{ path: '/mis-partidas' }"
        :class="{ 'active-btn': $route.path === '/mis-partidas' }"
        class="animated-btn"
      >
        <img src="@/assets/icons/misPartidas.png" alt="Icono personalizado" width="50" height="50">
        Mis Partidas
      </v-btn>-->
      
      <!-- Botón 3: Ruta (cuando definas) 
      <v-btn
        icon
        :to="{ path: '/mis-torneos' }"
        :class="{ 'active-btn': $route.path === '/mis-torneos' }"
        class="animated-btn"
      >
        <img src="@/assets/icons/misTorneos.png" alt="Icono personalizado" width="50" height="50">
        Mis Torneos
      </v-btn>-->
    </v-bottom-navigation>

    <!-- Modal con el componente RegistrarPartidas -->
    <v-dialog v-model="dialog">
      <FormCrearPartida
        @close="dialog = false"
        @registroExitoso="refrescarPartidas"
      />
    </v-dialog>
  </v-container>

  <ModalProteccionDatos
    v-if="showModalProteccionDatos"
    @modalClosed="cerrarModal"
  />
</template>

<script setup lang="ts">
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import CardTitleMisPartidas from "@/components/PartidaAmistosa/CardTitleMisPartidas.vue";
import PendingMatchCard from "@/components/PartidaAmistosa/PendingMatchCard.vue";
import ValidadasMatchCard from "@/components/PartidaAmistosa/ValidadasMatchCard.vue";
import CardEstadisticas from "@/components/Perfil/CardEstadisticas.vue";
import { useAuth } from "@/composables/useAuth";
import { FaccionDTO } from "@/interfaces/Faccion";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { UsuarioDataDTO } from "@/interfaces/Usuario";
import { getFaccionByIdUser } from "@/services/FaccionesService";
import { getPartidasAmistosasByIdUser } from "@/services/PartidasAmistosasService";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import FormCrearPartida from "@/components/PartidaAmistosa/FormCrearPartida.vue";
import { getProteccionDatos } from "@/services/UsuariosService";
import ModalProteccionDatos from "@/components/Usuarios/ModalProteccionDatos.vue";

const isLoading = ref(true);
const { getidUsuario } = useAuth();
const router = useRouter();
const idUsuarioLogger = ref<number>(parseInt(getidUsuario.value));
const matches = ref<ViewPartidaAmistosaDTO[]>([]);
const pendingMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const validMatches = ref<ViewPartidaAmistosaDTO[]>([]);
const isLoadingPending = ref<boolean>(false);
const isLoadingValidadas = ref<boolean>(false);
const faccionDTO = ref<FaccionDTO>({
  idFaccion: 0,
  nombreFaccion: "",
});
const openRegistroPartida = () => {
  dialog.value = true
}
const usuarioData = ref<UsuarioDataDTO>({
  idUsuario: 0,
  nick: "",
  email: "",
  faccion: faccionDTO.value,
  partidasValidadas: [],
  partidasPendientes: [],
  elos: [],
  InscripcionesIndividualTorneo: [],
  InscripcionesEquipoTorneo: [],
  clasificacionElo: 0,
  puntuacionElo: 0,
  numeroPartidasJugadas: 0,
  partidasGanadas: 0,
  partidasEmpatadas: 0,
  partidasPerdidas: 0,
  proteccionDatos: null,
  PartidasTorneo: [],
  ClasificacionTorneos: [],
  rankingElo: 0,
});
const dialog = ref<boolean>(false);
const isHovering = ref<boolean>(false);
const showModalProteccionDatos = ref<boolean>(false);

//Variables para filtrar partidas segun el click en la barra de estadisticas
const filtroActivo = ref<'win' | 'loss' | 'draw' | null>(null);

const partidasFiltradas = computed(() => {
  if (!filtroActivo.value) return matches.value;

  return matches.value.filter((partida) => {
    const esVictoria = partida.ganadorPartida === idUsuarioLogger.value;
    const esEmpate = partida.ganadorPartida === null || partida.ganadorPartida === 0;
    const esDerrota = partida.ganadorPartida && partida.ganadorPartida !== idUsuarioLogger.value;

    return (
      (filtroActivo.value === 'win' && esVictoria) ||
      (filtroActivo.value === 'draw' && esEmpate) ||
      (filtroActivo.value === 'loss' && esDerrota)
    );
  });
});

const initializeComponent = async () => {
  if (idUsuarioLogger.value) {
    isLoading.value = true;
    isLoadingPending.value = true;
    isLoadingValidadas.value = true;
    try {
      const response = await getPartidasAmistosasByIdUser(
        idUsuarioLogger.value
      );
      matches.value = response.data;
      matches.value.forEach((element) => {
        if (element.partidaValidadaUsuario1 && element.partidaValidadaUsuario2)
          validMatches.value.push(element);
        else pendingMatches.value.push(element);
      });
      validMatches.value = validMatches.value.reverse();
      pendingMatches.value = pendingMatches.value.reverse();

      loadComunidad(idUsuarioLogger.value);
      loadResume(validMatches.value);
    } catch (error) {
      console.error(error);
      router.push({ name: "error" });
    } finally {
      isLoading.value = false;
      isLoadingPending.value = false;
      isLoadingValidadas.value = false;

      const response = await getProteccionDatos(idUsuarioLogger.value);

      if (!response.data) showModalProteccionDatos.value = true;

      console.log("aceptado: ", showModalProteccionDatos.value);
    }
  }
};

const cerrarModal = () => {
  showModalProteccionDatos.value = false;
};

const loadResume = async (matches: ViewPartidaAmistosaDTO[]) => {
  usuarioData.value.numeroPartidasJugadas = matches.length;

  let contadorGanadas = 0;
  let contadorEmpatadas = 0;
  let contadorPerdidas = 0;

  matches.forEach((element) => {
    const ganador = element.ganadorPartida;

    if (ganador === idUsuarioLogger.value) {
      contadorGanadas++;
    } else if (!ganador) {
      // Si es null, 0 o undefined, lo tomamos como empate
      contadorEmpatadas++;
    } else {
      contadorPerdidas++;
    }
  });


  usuarioData.value.partidasGanadas = contadorGanadas;
  usuarioData.value.partidasEmpatadas = contadorEmpatadas;
  usuarioData.value.partidasPerdidas = contadorPerdidas;
};

onMounted(initializeComponent);

const loadComunidad = async (idUser: number) => {
  try {
    const response = await getFaccionByIdUser(idUser);
    usuarioData.value.faccion.nombreFaccion = response.data;
  } catch (error) {
    console.error("Error al obtener las comunidades: ", error);
  }
};

const refrescarPartidas = async () => {
  console.log("Refresco partida...");
  pendingMatches.value = [];
  if (idUsuarioLogger.value) {
    // Aquí llamas a la API para obtener las partidas actualizadas
    try {
      const response = await getPartidasAmistosasByIdUser(
        idUsuarioLogger.value
      );
      matches.value = response.data;
      matches.value.forEach((element) => {
        if (element.partidaValidadaUsuario1 && element.partidaValidadaUsuario2)
          validMatches.value.push(element);
        else pendingMatches.value.push(element);
      });
      validMatches.value = validMatches.value.reverse();
      pendingMatches.value = pendingMatches.value.reverse();
    } catch (error) {
      console.error(error);
      router.push({ name: "error" });
    } finally {
      isLoadingPending.value = false;
    }
  }
  console.log("Termino el refresco de partidas", pendingMatches);
};

function filtrarPartidas(tipo: 'win' | 'loss' | 'draw' | null) {
  filtroActivo.value = tipo;
}
</script>

<style scoped>
.section-card {
  margin-bottom: 20px;
  padding: 20px;
  background: #212121;
  color: white;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
}
.fab-btn {
  position: fixed;
  bottom: 60px;
  right: 60px;
  z-index: 1000;
}
/* Estilos del botón */
.custom-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

/* Animación de entrada y salida */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Estilo del texto */
.text-button {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-right: 10px;
  white-space: nowrap;
}
</style>
