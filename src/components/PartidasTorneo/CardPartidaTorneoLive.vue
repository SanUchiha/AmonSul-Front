<template>
    <v-hover v-slot:default="{ props }">
      <v-card v-bind="props" class="match-card mt-3">
        <v-card-title class="text-center text-wrap match-title">
          {{ mesa }}
        </v-card-title>

        <v-divider></v-divider>
        
        <v-card-text class="text-center match-content">
          <v-row align="center" justify="center" class="match-score" no-gutters>
            <v-col cols="5" class="player-name text-left">
              <span class="ml-2 text-wrap" :class="{highlight: match.idUsuario1 === idUsuario,}">{{ match.nick1 }}</span><br>
            </v-col>

            <v-col cols="2" class="score text-center marcador">
              <p>vs</p>
              <p>{{ match.resultadoUsuario1 }}-{{ match.resultadoUsuario2 }}</p>
            </v-col>

            <v-col cols="5" class="player-name text-right">
              <span class="ml-2 text-wrap" :class="{highlight: match.idUsuario2 === idUsuario,}">{{ match.nick2 }}</span><br>
            </v-col>
          </v-row>

          <v-row align="center" justify="center" class="army-buttons">
            <v-col cols="6" class="text-left">
              <v-btn block class="army-btn" @click="verLista(match.idUsuario1, match.idTorneo, match.nick1)" style="font-size: 10px;" variant="tonal">
                <span class="text-wrap">{{ match.ejercitoUsuario1 }}</span>
              </v-btn>
            </v-col>
            <v-col cols="6" class="text-right">
              <v-btn block class="army-btn" @click="verLista(match.idUsuario2, match.idTorneo, match.nick2)" style="font-size: 10px;" variant="tonal">
                <span class="text-wrap">{{ match.ejercitoUsuario2 }}</span>
              </v-btn>
            </v-col>
          </v-row>

          <v-row align="center" justify="center">
            <v-col cols="6" class="text-center">
              <v-card-subtitle class="text-wrap">
                <p>Líder enemigo</p>
                <p class="text-center">
                  <v-icon color="green" v-if="match.liderMuertoUsuario1 === true">mdi-check-circle</v-icon>
                  <v-icon color="red" v-else-if="match.liderMuertoUsuario1 === false">mdi-close-circle</v-icon>
                  <v-icon v-else>mdi-dots-horizontal</v-icon>
                </p>
              </v-card-subtitle>
            </v-col>
            <v-col cols="6" class="text-center">
              <v-card-subtitle class="text-wrap">
                <p>Líder enemigo</p>
                <p class="text-center">
                  <v-icon color="green" v-if="match.liderMuertoUsuario2 === true">mdi-check-circle</v-icon>
                  <v-icon color="red" v-else-if="match.liderMuertoUsuario2 === false">mdi-close-circle</v-icon>
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
            <v-col cols="5" class="text-center" >
              <v-chip :color="getColorGanador(match, match.idUsuario1)" class="outcome-chip">
                <p v-if="match.nick1 === getGanador(match)">Vencedor</p>
                <p v-else-if="match.nick2 === getGanador(match)">Derrota</p>
                <p v-else>Empate</p>
              </v-chip>
            </v-col>

            <v-col cols="2" class="text-center"></v-col>

            <v-col cols="5" class="text-center">
              <v-chip :color="getColorGanador(match, match.idUsuario2)" class="outcome-chip">
                <p v-if="match.nick2 === getGanador(match)">Vencedor</p>
                <p v-else-if="match.nick1 === getGanador(match)">Derrota</p>
                <p v-else>Empate</p>
              </v-chip>
            </v-col>
          </v-row>

          <v-row class="mt-3 match-scenario">
            <v-col cols="12" class="text-center">
              <v-icon left class="location-icon">mdi-map-marker</v-icon> Escenario:
              <strong>{{ match.escenarioPartida || "No disponible" }}</strong>
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
          <v-row v-else>

          </v-row>
        </v-card-text>
      </v-card>
    </v-hover>

  <v-spacer class="my-3"></v-spacer>

  <!-- Modal Lista -->
  <ModalListaResultadoTorneo
    v-if="isModalListaVisible"
    :listaData="listaData"
    :nickJugador="nickJugador"
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
      <v-card-text class="d-flex justify-center align-center" style="height: 150px">
        <v-progress-circular indeterminate color="blue-lighten-3" :size="57"></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

  
  <script setup lang="ts">
  import { defineProps, ref, onMounted } from "vue";
  import { PartidaTorneoDTO } from "@/interfaces/Partidas";
  import { useRouter } from "vue-router";
  import { formatFechaSpa } from "@/utils/Fecha";
  import { ListaTorneoRequestDTO } from "@/interfaces/Lista";
  import { getlistaTorneo } from "@/services/ListasService";
  import ModalListaResultadoTorneo from "@/components/ResultadosTorneos/ModalListaResultadoTorneo.vue";
  import ModalValidarPartida from "@/components/ResultadosTorneos/ModalValidarPartida.vue";
  import { updatePartidaTorneo } from "@/services/PartidaTorneoService";
  import { UpdatePartidaTorneoDTO } from "@/interfaces/Live";
  import ModalEditarPartida from "@/components/ResultadosTorneos/ModalEditarPartida.vue";

  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const router = useRouter();
  const listaData = ref<string>("");
  const nickJugador = ref<string>("");
  const isModalListaVisible = ref<boolean>(false);

  const fechaPartidaFormateada = ref<string>("");

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
  });

  const props = defineProps<{
    match: PartidaTorneoDTO;
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
            console.log("listaResponse.data",listaResponse.data)
            listaData.value = listaResponse.data;
            nickJugador.value = nick;
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
          return 'green';
      } else if (partida.ganadorPartidaTorneo != null) {
          return 'red';
      } else {
          return "orange";
      }
  };  

  const abrirModalValidar = (match:PartidaTorneoDTO)=>{
    idPartidaSeleccionada.value = match.idPartidaTorneo;
    isModalValidarVisible.value = true;
    props.idUsuario === match.idUsuario1 ? usuarioSeleccionado.value = 1 : usuarioSeleccionado.value = 2;
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
        console.error("confirmarValidar",error);
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

    if (idUsuario === partida.idUsuario1) idUsuarioSelected.value = 1;
    else idUsuarioSelected.value = 2;

    isModalEditarPartidaVisible.value = true;
  };

  const confirmarEditarPartida = async (partida: PartidaTorneoDTO) => {
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

  onMounted(initializeComponent);
  </script>
  <style>
    .highlight {
      color: rgb(224, 175, 13);
      font-weight: bold;
    }


  .match-card {
    background: linear-gradient(to right, #111, #222);
    border: 1px solid #ffcc00;
    border-radius: 10px;
    color: #fff;
    font-family: 'Orbitron', sans-serif;
    text-transform: uppercase;
  }

  .match-card .title {
    font-weight: bold;
    color: #ffcc00;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  .match-card .score {
    color: #fff;
    text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    display: inline-block;
  }

  .match-card .player {
    font-weight: bold;
    color: #fff;
  }

  .match-card .details {     
    color: #aaa;
  }


</style>
 
  