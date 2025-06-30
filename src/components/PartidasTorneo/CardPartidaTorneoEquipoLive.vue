<template>
  <v-hover v-slot:default="{ props }">
    <v-card v-bind="props" class="match-card mt-3">
      <v-card-title
        class="text-center text-h5 text-wrap"
        style="
          position: relative;
          font-family: 'Roboto', sans-serif;
          color: #ffcc00;
          text-align: center;
        "
      >
        <!-- Botón a la izquierda si es Capitán1 -->
        <v-btn
          v-if="localMatch.idCapitan1 === idUsuario && !partidaCompleta"
          size="small"
          color="primary"
          variant="tonal"
          style="
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            margin-left: 8px;
          "
          @click="cambiarPairing"
        >
          Cambiar
        </v-btn>

        <!-- Título centrado -->
        <span class="text-h5">{{ mesa }}</span>

        <!-- Botón a la derecha si es Capitán2 -->
        <v-btn
          v-if="localMatch.idCapitan2 === idUsuario && !partidaCompleta"
          size="small"
          color="primary"
          variant="tonal"
          style="
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            margin-right: 8px;
          "
          @click="cambiarPairing"
        >
          Cambiar
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>
      <v-card-title class="text-wrap match-title">
        <v-row align="center" justify="center" no-gutters>
          <v-col
            cols="5"
            @click.prevent="verProfileUser(localMatch.idUsuario1)"
            class="player text-left"
          >
            <span
              class="text-wrap"
              :class="{ highlight: localMatch.idEquipo1 === idEquipo }"
              >{{ localMatch.nombreEquipo1 }}</span
            >
            <span
              class="text-wrap"
              :class="{ highlight: localMatch.idEquipo1 === idEquipo }"
            >
              ({{ localMatch.nick1 }})</span
            >
          </v-col>

          <v-col cols="2" class="score text-center marcador">
            <p>vs</p>
            <p>
              {{ localMatch.resultadoUsuario1 }}-{{
                localMatch.resultadoUsuario2
              }}
            </p>
          </v-col>

          <v-col
            cols="5"
            @click.prevent="verProfileUser(localMatch.idUsuario2)"
            class="player text-right"
          >
            <span
              class="text-wrap"
              :class="{ highlight: localMatch.idEquipo2 === idEquipo }"
              >{{ localMatch.nombreEquipo2 }}
            </span>
            <span
              class="text-wrap"
              :class="{ highlight: localMatch.idEquipo2 === idEquipo }"
            >
              ({{ localMatch.nick2 }})</span
            >
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text class="match-content">
        <v-row align="center" justify="center" class="army-buttons">
          <v-col cols="6" class="text-left">
            <div>
              <v-btn
                block
                class="army-btn"
                @click="
                  verLista(
                    localMatch.idUsuario1,
                    localMatch.idTorneo,
                    localMatch.nick1
                  )
                "
                style="font-size: 10px"
                variant="tonal"
              >
                <span class="text-wrap">{{
                  localMatch.ejercitoUsuario1 ?? "Lista"
                }}</span>
              </v-btn>
            </div>
          </v-col>
          <v-col cols="6" class="text-right">
            <div>
              <v-btn
                block
                class="army-btn"
                @click="
                  verLista(
                    localMatch.idUsuario2,
                    localMatch.idTorneo,
                    localMatch.nick2
                  )
                "
                style="font-size: 10px"
                variant="tonal"
              >
                <span class="text-wrap">{{
                  localMatch.ejercitoUsuario2 ?? "Lista"
                }}</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Escenario -->
        <v-row class="mt-3 match-scenario">
          <v-col cols="12" class="text-center">
            <v-icon left class="location-icon">mdi-map-marker</v-icon>
            Escenario:
            <strong>{{
              localMatch.escenarioPartida || "No disponible"
            }}</strong>
          </v-col>
        </v-row>

        <!-- General enemigo matado -->
        <v-row align="center" justify="center">
          <v-col cols="6" class="text-center">
            <v-card-subtitle class="text-wrap">
              <p>General enemigo matado</p>
              <p class="text-center">
                <v-icon
                  color="green"
                  v-if="localMatch.liderMuertoUsuario1 === true"
                  >mdi-check-circle</v-icon
                >
                <v-icon
                  color="red"
                  v-else-if="localMatch.liderMuertoUsuario1 === false"
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
                <v-icon
                  color="green"
                  v-if="localMatch.liderMuertoUsuario2 === true"
                  >mdi-check-circle</v-icon
                >
                <v-icon
                  color="red"
                  v-else-if="localMatch.liderMuertoUsuario2 === false"
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
              :color="getColorGanador(localMatch, localMatch.idUsuario1)"
              class="outcome-chip"
            >
              <p v-if="localMatch.nick1 === getGanador(localMatch)">Victoria</p>
              <p v-else-if="localMatch.nick2 === getGanador(localMatch)">
                Derrota
              </p>
              <p v-else>Empate</p>
            </v-chip>
          </v-col>

          <v-col cols="2" class="text-center"></v-col>

          <v-col cols="5" class="text-center">
            <v-chip
              :color="getColorGanador(localMatch, localMatch.idUsuario2)"
              class="outcome-chip"
            >
              <p v-if="localMatch.nick2 === getGanador(localMatch)">Victoria</p>
              <p v-else-if="localMatch.nick1 === getGanador(localMatch)">
                Derrota
              </p>
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
        <v-row v-if="!partidaCompleta && editarPartidaPJ && esCapitan">
          <v-col cols="12" class="text-center">
            <v-btn color="success" @click="editPartida(localMatch, idUsuario)">
              Validar Resultadoo
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-else-if="!partidaCompleta && soloValidarPJ && esCapitan">
          <v-col cols="12" class="text-center">
            <v-btn color="success" @click="abrirModalValidar(localMatch)">
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

  <!-- Modal éxito -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Partida validada con éxito."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal error -->
  <ModalError
    :isVisible="showErrorModal"
    message="Ha ocurrido un error al validar la partida. Inténtalo de nuevo o contacta al administrador del torneo."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Modal error -->
  <ModalError
    :isVisible="showErrorCambiarPairingModal"
    message="Ha ocurrido un error al cambiar el emparejamiento. Inténtalo de nuevo o contacta al administrador del torneo."
    @update:isVisible="showErrorCambiarPairingModal = $event"
  />

  <!-- Modal cambiar pairing entre equipos -->
  <ModalCambiarPairingEquipo
    :isVisible="showModalCambiarPairing"
    :idEquipo1="idEquipo1!"
    :idEquipo2="idEquipo2!"
    :nombreEquipo1="nombreEquipo1!"
    :nombreEquipo2="nombreEquipo2!"
    @actualizar="actualizarPairing"
    @cerrar="showModalCambiarPairing = false"
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
import { defineProps, ref, onMounted, computed, watch, reactive } from "vue";
import {
  ActualizarPairingEquiposDTO,
  PartidaTorneoDTO,
} from "@/interfaces/Partidas";
import { useRouter } from "vue-router";
import { formatFechaSpa } from "@/utils/Fecha";
import { ListaTorneoRequestDTO } from "@/interfaces/Lista";
import { getlistaTorneo } from "@/services/ListasService";
import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
import ModalValidarPartida from "@/components/ResultadosTorneos/ModalValidarPartida.vue";
import {
  updatePairingTorneo,
  updatePartidaTorneo,
} from "@/services/PartidaTorneoService";
import {
  RequestUpdatePairingTorneoDTO,
  UpdatePartidaTorneoDTO,
} from "@/interfaces/Live";
import ModalEditarPartida from "@/components/ResultadosTorneos/ModalEditarPartida.vue";
import { ListaDTO } from "@/interfaces/Usuario";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import ModalCambiarPairingEquipo from "./ModalCambiarPairingEquipo.vue";

const props = defineProps<{
  match: PartidaTorneoDTO;
  idUsuario: number;
  mesa: string;
  completa: boolean;
  editarPartidaPJ: boolean;
  soloValidarPJ: boolean;
  idEquipo: number | null;
}>();

const localMatch = reactive({ ...props.match });

const isLoading = ref(true);
const error = ref<string | null>(null);
const router = useRouter();
const listaData = ref<string>("");
const listaDTO = ref<ListaDTO>();
const nickJugador = ref<string>("");
const isModalListaVisible = ref<boolean>(false);
const currentEjercito = ref<string>();
const fechaPartidaFormateada = ref<string>("");
const showErrorModal = ref<boolean>(false);
const showErrorCambiarPairingModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

//Variables para el modal validar partida
const isModalValidarVisible = ref<boolean>(false);
const idPartidaSeleccionada = ref<number>();
const usuarioSeleccionado = ref<1 | 2>();

//Variables para el modal de editar partida para validar (ModalEditarPartida)
const isModalEditarPartidaVisible = ref<boolean>(false);
const idUsuarioSelected = ref<number>(0);
const partidaSelected = ref<PartidaTorneoDTO>({
  ejercitoUsuario1: null,
  ejercitoUsuario2: null,
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
  idEquipo1: null,
  idEquipo2: null,
  nombreEquipo1: null,
  nombreEquipo2: null,
  idCapitan1: null,
  idCapitan2: null,
});

//Variables para cambiar pairing entre equipos
const showModalCambiarPairing = ref<boolean>(false);
const idEquipo1 = ref<number | null>(localMatch.idEquipo1);
const idEquipo2 = ref<number | null>(localMatch.idEquipo2);
const nombreEquipo1 = ref<string | null>(localMatch.nombreEquipo1);
const nombreEquipo2 = ref<string | null>(localMatch.nombreEquipo2);

const partidaCompleta = ref<boolean>(props.completa);
watch(
  () => props.completa,
  (nuevoValor) => {
    partidaCompleta.value = nuevoValor;
  }
);

const cambiarPairing = () => {
  showModalCambiarPairing.value = true;
};

const actualizarPairing = async (payload: ActualizarPairingEquiposDTO) => {
  // enviar al backend
  const isUpdate: boolean = await sendUpdateBack(
    payload.idJugador1,
    payload.idJugador2
  );

  if (isUpdate) {
    // Actualizas localMatch según el nuevo pairing
    localMatch.idUsuario1 = payload.idJugador1;
    localMatch.idUsuario2 = payload.idJugador2;
    localMatch.ejercitoUsuario1 = payload.ejercitoEquipo1;
    localMatch.ejercitoUsuario2 = payload.ejercitoEquipo2;
    localMatch.nick1 = payload.nick1;
    localMatch.nick2 = payload.nick2;

    // Si necesitas actualizar también nombres o algo más, hazlo aquí
  } else {
    // manejar error
  }
  showModalCambiarPairing.value = false;
};

const sendUpdateBack = async (idJugador1: number, idJugador2: number) => {
  try {
    isLoading.value = true;

    const body: RequestUpdatePairingTorneoDTO = {
      idPartidaTorneo: localMatch.idPartidaTorneo,
      idUsuario1: idJugador1,
      idUsuario2: idJugador2,
    };

    await updatePairingTorneo(body);
    return true;
  } catch (error) {
    console.error(error);
    showErrorCambiarPairingModal.value = true;
    return false;
  } finally {
    isLoading.value = false;
  }
};

const esCapitan = computed(() => {
  return (
    localMatch.idCapitan1 === props.idUsuario ||
    localMatch.idCapitan2 === props.idUsuario
  );
});

const initializeComponent = async () => {
  try {
    isLoading.value = true;
    fechaPartidaFormateada.value = await formatFechaSpa(
      localMatch.fechaPartida
    );
  } catch (err) {
    console.error(error);
    error.value = (err as Error).message;
    router.push({ name: "error" });
  } finally {
    isLoading.value = false;
  }
};

const verLista = async (idUsuario: number, idTorneo: number, nick: string) => {
  isLoading.value = true;
  if (idTorneo && idUsuario && nick) {
    const body: ListaTorneoRequestDTO = {
      idTorneo: idTorneo,
      idUsuario: idUsuario,
    };

    try {
      const listaResponse = await getlistaTorneo(body);
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

const getGanador = (partida: PartidaTorneoDTO) => {
  if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
    return partida.nick1;
  } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
    return partida.nick2;
  } else {
    return "Empate";
  }
};

const getColorGanador = (partida: PartidaTorneoDTO, idUsuario: number) => {
  if (partida.ganadorPartidaTorneo === idUsuario) {
    return "green";
  } else if (partida.ganadorPartidaTorneo != null) {
    return "red";
  } else {
    return "orange";
  }
};

const abrirModalValidar = (match: PartidaTorneoDTO) => {
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

    if (usuarioSeleccionado.value == 1) body.partidaValidadaUsuario1 = true;
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
const editPartida = (partida: PartidaTorneoDTO, idUsuario: number) => {
  partidaSelected.value = partida;

  if (idUsuario == partida.idCapitan1) idUsuarioSelected.value = 1;
  else idUsuarioSelected.value = 2;

  isModalEditarPartidaVisible.value = true;
};

const confirmarEditarPartida = async (partida: PartidaTorneoDTO) => {
  isLoading.value = true;
  if (partida) {
    const body: UpdatePartidaTorneoDTO = {
      idPartidaTorneo: partida.idPartidaTorneo,
      resultadoUsuario1: partida.resultadoUsuario1,
      resultadoUsuario2: partida.resultadoUsuario2,
      escenarioPartida: partida.escenarioPartida,
      liderMuertoUsuario1: partida.liderMuertoUsuario1,
      liderMuertoUsuario2: partida.liderMuertoUsuario2,
      partidaValidadaUsuario1: partida.partidaValidadaUsuario1,
      partidaValidadaUsuario2: partida.partidaValidadaUsuario2,
    };

    try {
      const response = await updatePartidaTorneo(body);

      if (response.data) {
        showSuccessModal.value = true;
        partidaCompleta.value = true;
      }
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
    } finally {
      isModalEditarPartidaVisible.value = false;
      isLoading.value = false;
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
