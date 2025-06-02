<template>
  <v-hover v-slot:default="{ props }">
    <v-card v-bind="props" class="match-card mt-3">
      <v-card-title
        class="text-center text-h5 text-wrap"
        style="font-family: 'Roboto', sans-serif; color: #ffcc00"
      >
        {{ mesa }}
      </v-card-title>

      <v-divider></v-divider>
      <v-card-title class="text-wrap match-title">
        <v-row align="center" justify="center" no-gutters>
          <v-col
            cols="5"
            @click.prevent="verProfileUser(match.idUsuario1)"
            class="player text-left"
          >
            <span
              class="text-wrap"
              :class="{ highlight: match.idUsuario1 === idUsuario }"
              >{{ match.nick1 }}</span
            >
          </v-col>

          <v-col cols="2" class="score text-center marcador">
            <p>vs</p>
            <p>{{ match.resultadoUsuario1 }}-{{ match.resultadoUsuario2 }}</p>
          </v-col>

          <v-col
            cols="5"
            @click.prevent="verProfileUser(match.idUsuario2)"
            class="player text-right"
          >
            <span
              class="text-wrap"
              :class="{ highlight: match.idUsuario2 === idUsuario }"
              >{{ match.nick2 }}</span
            >
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text class="match-content">
        <v-row align="center" justify="center" class="army-buttons">
          <v-col cols="6" class="text-left">
            <div
              v-for="(lista, index) in match.listasJugador1 ?? []"
              :key="lista?.idLista ?? index"
            >
              <v-btn
                block
                class="army-btn"
                v-if="lista.idLista !== undefined"
                @click="verLista(lista.idLista, match.nick1)"
                style="font-size: 10px"
                variant="tonal"
              >
                <span class="text-wrap">{{ lista.ejercito }}</span>
              </v-btn>
            </div>
          </v-col>
          <v-col cols="6" class="text-right">
            <div
              v-for="(lista, index) in match.listasJugador2 ?? []"
              :key="lista?.idLista ?? index"
            >
              <v-btn
                block
                class="army-btn"
                v-if="lista.idLista !== undefined"
                @click="verLista(lista.idLista, match.nick2)"
                style="font-size: 10px"
                variant="tonal"
              >
                <span class="text-wrap">{{ lista.ejercito }}</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Escenario -->
        <v-row class="mt-3 match-scenario">
          <v-col cols="12" class="text-center">
            <v-icon left class="location-icon">mdi-map-marker</v-icon>
            Escenario:
            <strong>{{ match.escenarioPartida || "No disponible" }}</strong>
          </v-col>
        </v-row>

        <!-- General enemigo matado -->
        <v-row align="center" justify="center">
          <v-col cols="6" class="text-center">
            <v-card-subtitle class="text-wrap">
              <p>General enemigo matado</p>
              <p class="text-center">
                <v-icon color="green" v-if="match.liderMuertoUsuario1 === true"
                  >mdi-check-circle</v-icon
                >
                <v-icon
                  color="red"
                  v-else-if="match.liderMuertoUsuario1 === false"
                  >mdi-close-circle</v-icon
                >
                <v-icon v-else>mdi-dots-horizontal</v-icon>
              </p>
            </v-card-subtitle>
          </v-col>
          <!-- General enemigo matado -->
          <v-col cols="6" class="text-center">
            <v-card-subtitle class="text-wrap">
              <p>General enemigo matado</p>
              <p class="text-center">
                <v-icon color="green" v-if="match.liderMuertoUsuario2 === true"
                  >mdi-check-circle</v-icon
                >
                <v-icon
                  color="red"
                  v-else-if="match.liderMuertoUsuario2 === false"
                  >mdi-close-circle</v-icon
                >
                <v-icon v-else>mdi-dots-horizontal</v-icon>
              </p>
            </v-card-subtitle>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Información de la partida -->
      <v-card-text>
        <v-row align="center" v-if="completa" class="match-outcome">
          <v-col cols="5" class="text-center">
            <v-chip
              :color="getColorGanador(match, match.idUsuario1)"
              class="outcome-chip"
            >
              <p v-if="match.nick1 === getGanador(match)">Victoria</p>
              <p v-else-if="match.nick2 === getGanador(match)">Derrota</p>
              <p v-else>Empate</p>
            </v-chip>
          </v-col>

          <v-col cols="2" class="text-center"></v-col>

          <v-col cols="5" class="text-center">
            <v-chip
              :color="getColorGanador(match, match.idUsuario2)"
              class="outcome-chip"
            >
              <p v-if="match.nick2 === getGanador(match)">Victoria</p>
              <p v-else-if="match.nick1 === getGanador(match)">Derrota</p>
              <p v-else>Empate</p>
            </v-chip>
          </v-col>
        </v-row>
        <v-row v-else class="text-center">
          <v-col cols="12" class="text-center">
            <span class="partida-en-juego"
              ><v-icon>mdi-sword-cross</v-icon> Partida en juego...</span
            >
          </v-col>
        </v-row>

        <!-- Botón de validación 
           Si la partida no está completa, miramos si solo tiene que validar 
           o validar y meter datos de la partida -->
        <v-row v-if="!completa && editarPartidaPJ && !soloValidarPJ">
          <v-col cols="12" class="text-center">
            <v-btn color="success" @click="editPartida(match, idUsuario)">
              Validar Resultado
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="!completa && soloValidarPJ">
          <v-col cols="12" class="text-center">
            <v-btn color="success" @click="abrirModalValidar(match)">
              Validar Resultado
            </v-btn>
          </v-col>
        </v-row>
        <v-row v-else> </v-row>
      </v-card-text>
    </v-card>
  </v-hover>

  <v-spacer class="my-3"></v-spacer>

  <!-- Modal Lista -->
  <ModalListaResultadoTorneo
    v-if="isModalListaVisible"
    :listaData="listaData"
    :nickJugador="nickJugador"
    :ejercito="currentEjercito"
    @close="isModalListaVisible = false"
  />

  <!-- Modal editar -->
  <ModalEditarPartida
    v-if="isModalEditarPartidaVisible"
    :isVisible="isModalEditarPartidaVisible"
    :partida="partidaSelected"
    :idUsuario="idUsuarioSelected"
    @confirmar="confirmarEditarPartida"
    @cerrar="cerrarModalEditarPartida"
  />

  <!-- Modal validar -->
  <ModalValidarPartida
    v-if="isModalValidarVisible"
    :isVisible="isModalValidarVisible"
    :idPartidaTorneo="idPartidaSeleccionada"
    @confirmar="confirmarValidar"
    @cerrar="cerrarModalValidar"
  />

  <!-- Spinner Modal -->
  <v-dialog v-model="isLoading" persistent width="300">
    <v-card>
      <v-card-text
        class="d-flex justify-center align-center"
        style="height: 150px"
      >
        <v-progress-circular
          indeterminate
          color="blue-lighten-3"
          :size="57"
        ></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted } from "vue";
import { PartidaTorneoMasDTO } from "@/interfaces/Partidas";
import { useRouter } from "vue-router";
import { formatFechaSpa } from "@/utils/Fecha";
import { getListaById } from "@/services/ListasService";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalValidarPartida from "@/components/ResultadosTorneos/ModalValidarPartida.vue";
import { updatePartidaTorneo } from "@/services/PartidaTorneoService";
import { UpdatePartidaTorneoDTO } from "@/interfaces/Live";
import ModalEditarPartida from "@/components/ResultadosTorneos/ModalEditarPartida.vue";
import { ListaDTO } from "@/interfaces/Usuario";

const isLoading = ref(true);
const error = ref<string | null>(null);
const router = useRouter();
const listaData = ref<string>("");
const listaDTO = ref<ListaDTO>();
const nickJugador = ref<string>("");
const isModalListaVisible = ref<boolean>(false);
const currentEjercito = ref<string>();

const fechaPartidaFormateada = ref<string>("");

//Variables para el modal validar partida
const isModalValidarVisible = ref<boolean>(false);
const idPartidaSeleccionada = ref<number>();
const usuarioSeleccionado = ref<1 | 2>();

//Variables para el modal de editar partida para validar (ModalEditarPartida)
const isModalEditarPartidaVisible = ref<boolean>(false);
const idUsuarioSelected = ref<number>(0);
const partidaSelected = ref<PartidaTorneoMasDTO>({
  escenarioPartida: null,
  fechaPartida: "",
  ganadorPartidaTorneo: null,
  idPartidaTorneo: 0,
  idTorneo: 0,
  idUsuario1: 0,
  idUsuario2: 0,
  liderMuertoUsuario1: null,
  liderMuertoUsuario2: null,
  nick1: "",
  nick2: "",
  numeroRonda: 0,
  partidaValidadaUsuario1: null,
  partidaValidadaUsuario2: null,
  resultadoUsuario1: null,
  resultadoUsuario2: null,
  listasJugador1: [],
  listasJugador2: [],
});

const props = defineProps<{
  match: PartidaTorneoMasDTO;
  idUsuario: number;
  mesa: string;
  completa: boolean;
  editarPartidaPJ: boolean;
  soloValidarPJ: boolean;
}>();

const initializeComponent = async () => {
  try {
    isLoading.value = true;
    fechaPartidaFormateada.value = await formatFechaSpa(
      props.match.fechaPartida
    );
  } catch (err) {
    console.error(error);
    error.value = (err as Error).message;
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }
};

const verLista = async (idLista: number, nick: string) => {
  isLoading.value = true;
  if (idLista) {
    try {
      const listaResponse = await getListaById(idLista);
      listaDTO.value = listaResponse.data;
      if (listaDTO.value != undefined)
        listaData.value = listaDTO.value.listaData ?? "";
      nickJugador.value = nick;
      currentEjercito.value = listaDTO.value?.ejercito;
      isModalListaVisible.value = true;
    } catch (error) {
      console.error(error);
      isModalListaVisible.value = false;
      isLoading.value = false;
    } finally {
      isLoading.value = false;
    }
  }
};

const getGanador = (partida: PartidaTorneoMasDTO) => {
  if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
    return partida.nick1;
  } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
    return partida.nick2;
  } else {
    return "Empate";
  }
};
const getColorGanador = (partida: PartidaTorneoMasDTO, idUsuario: number) => {
  if (partida.ganadorPartidaTorneo === idUsuario) {
    return "green";
  } else if (partida.ganadorPartidaTorneo != null) {
    return "red";
  } else {
    return "orange";
  }
};

const abrirModalValidar = (match: PartidaTorneoMasDTO) => {
  idPartidaSeleccionada.value = match.idPartidaTorneo;
  isModalValidarVisible.value = true;
  props.idUsuario === match.idUsuario1
    ? (usuarioSeleccionado.value = 1)
    : (usuarioSeleccionado.value = 2);
};

const confirmarValidar = async () => {
  if (idPartidaSeleccionada.value) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: idPartidaSeleccionada.value,
    };

    if (usuarioSeleccionado.value === 1) body.partidaValidadaUsuario1 = true;
    else body.partidaValidadaUsuario2 = true;

    try {
      await updatePartidaTorneo(body);
    } catch (error) {
      console.error("confirmarValidar", error);
    } finally {
      isModalValidarVisible.value = false;
      window.location.reload();
    }
  }
};

const cerrarModalValidar = () => {
  isModalValidarVisible.value = false;
};

//Metodo que recoje el click del botón Validar Resultado y prepara los datos para enviar al backend
const editPartida = (partida: PartidaTorneoMasDTO, idUsuario: number) => {
  partidaSelected.value = partida;

  if (idUsuario === partida.idUsuario1) idUsuarioSelected.value = 1;
  else idUsuarioSelected.value = 2;

  isModalEditarPartidaVisible.value = true;
};

const confirmarEditarPartida = async (partida: PartidaTorneoMasDTO) => {
  if (partida) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: partida.idPartidaTorneo,
      resultadoUsuario1: partida.resultadoUsuario1,
      resultadoUsuario2: partida.resultadoUsuario2,
      escenarioPartida: partida.escenarioPartida,
      liderMuertoUsuario1: partida.liderMuertoUsuario1,
      liderMuertoUsuario2: partida.liderMuertoUsuario2,
    };

    if (partida.partidaValidadaUsuario1) body.partidaValidadaUsuario1 = true;
    else body.partidaValidadaUsuario2 = true;

    try {
      await updatePartidaTorneo(body);
    } catch (error) {
      console.error(error);
    } finally {
      isModalEditarPartidaVisible.value = false;
      window.location.reload();
    }
  }
};

const cerrarModalEditarPartida = () => {
  isModalEditarPartidaVisible.value = false;
};

const verProfileUser = (idUser: number) => {
  if (navigator.vibrate) {
    navigator.vibrate(500);
    router.push({ name: "detalle-jugador", params: { idUsuario: idUser } });
  } else {
    console.warn("La vibración no es compatible en este navegador.");
  }
};

onMounted(initializeComponent);
</script>

<style scoped>
.highlight {
  color: rgb(224, 175, 13);
  font-weight: bold;
}
</style>
