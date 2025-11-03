<script setup lang="ts">
import { ref, computed, defineProps } from "vue";
import PartidaCard from './PartidaCard.vue';
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { getlistaTorneo } from "@/services/ListasService";
import { ListaTorneoRequestDTO } from "@/interfaces/Lista";
import { ListaDTO } from "@/interfaces/Usuario";

// PROPS
const props = defineProps<{ partidas: PartidaTorneoDTO[] }>();

// Calcular rondas disponibles a partir de las partidas
const rondasDisponibles = computed(() => {
  const set = new Set<number>();
  props.partidas.forEach(p => set.add(p.numeroRonda));
  return Array.from(set).sort((a, b) => a - b);
});

const activeTab = ref<number>(rondasDisponibles.value[0] ?? 1); // Mostrar la primera ronda disponible por defecto
const idUsuario = ref<number>();
const showModificarPartidaTorneoModal = ref<boolean>(false);
const showModificarPairingModal = ref<boolean>(false);
const showEliminarPartidaModal = ref<boolean>(false);

// Agrupar partidas por ronda
const partidasPorRonda = computed(() => {
  return props.partidas.reduce(
    (acc, partida) => {
      const { numeroRonda } = partida;
      if (!acc[numeroRonda]) {
        acc[numeroRonda] = [];
      }
      acc[numeroRonda].push(partida);
      return acc;
    },
    {} as Record<number, PartidaTorneoDTO[]>
  );
});

const isLoadingImage = ref<boolean>(false);
const listaData = ref<string>("");
const listaDTO = ref<ListaDTO>();
const currentEjercito = ref<string>();
const nickJugador = ref<string>("");
const idPartidaSeleccionada = ref<number>();
const usuarioSeleccionado = ref<1 | 2>();
const isModalValidarVisible = ref<boolean>(false);
const partidaActual = ref<PartidaTorneoDTO>({
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

const abrirModalValidar = (idPartida: number, usuario: 1 | 2) => {
            idPartidaSeleccionada.value = idPartida;
            usuarioSeleccionado.value = usuario;
            isModalValidarVisible.value = true;
          };

const verLista = async (idUsuario: number, idTorneo: number, nick: string) => {

            <script setup lang="ts">
            import { ref, computed, defineProps } from "vue";
            import PartidaCard from './PartidaCard.vue';
            import { PartidaTorneoDTO } from "@/interfaces/Partidas";
            import { getlistaTorneo } from "@/services/ListasService";
            import { ListaTorneoRequestDTO } from "@/interfaces/Lista";
            import { ListaDTO } from "@/interfaces/Usuario";

            // PROPS
            const props = defineProps<{ partidas: PartidaTorneoDTO[] }>();

            // Calcular rondas disponibles a partir de las partidas
            const rondasDisponibles = computed(() => {
              const set = new Set<number>();
              props.partidas.forEach(p => set.add(p.numeroRonda));
              return Array.from(set).sort((a, b) => a - b);
            });

            const activeTab = ref<number>(rondasDisponibles.value[0] ?? 1); // Mostrar la primera ronda disponible por defecto
            const idUsuario = ref<number>();
            const showModificarPartidaTorneoModal = ref<boolean>(false);
            const showModificarPairingModal = ref<boolean>(false);
            const showEliminarPartidaModal = ref<boolean>(false);

            // Agrupar partidas por ronda
            const partidasPorRonda = computed(() => {
              return props.partidas.reduce(
                (acc, partida) => {
                  const { numeroRonda } = partida;
                  if (!acc[numeroRonda]) {
                    acc[numeroRonda] = [];
                  }
                  acc[numeroRonda].push(partida);
                  return acc;
                },
                {} as Record<number, PartidaTorneoDTO[]>
              );
            });

            const isLoadingImage = ref<boolean>(false);
            const listaData = ref<string>("");
            const listaDTO = ref<ListaDTO>();
            const currentEjercito = ref<string>();
            const nickJugador = ref<string>("");
            const idPartidaSeleccionada = ref<number>();
            const usuarioSeleccionado = ref<1 | 2>();
            const isModalValidarVisible = ref<boolean>(false);
            const partidaActual = ref<PartidaTorneoDTO>({
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

            const abrirModalValidar = (idPartida: number, usuario: 1 | 2) => {
              idPartidaSeleccionada.value = idPartida;
              usuarioSeleccionado.value = usuario;
              isModalValidarVisible.value = true;
            };

            const verLista = async (idUsuario: number, idTorneo: number, nick: string) => {
              isLoadingImage.value = true;
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
                  // Aquí podrías mostrar un modal si lo deseas
                } catch (error) {
                  console.error(error);
                  isLoadingImage.value = false;
                } finally {
                  isLoadingImage.value = false;
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

const modificarPartida = (partidaRecibida: PartidaTorneoDTO) => {
  partidaActual.value = partidaRecibida;
  showModificarPartidaTorneoModal.value = true;
};

const modificarPairing = (partidaRecibida: PartidaTorneoDTO) => {
  partidaActual.value = partidaRecibida;
  showModificarPairingModal.value = true;
};

const eliminarPartida = (partidaRecibida: PartidaTorneoDTO) => {
  partidaActual.value = partidaRecibida;
  showEliminarPartidaModal.value = true;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};
</script>

<template>
  <div>
    <div
      class="mb-4"
      style="display: flex; justify-content: center; align-items: center"
    >
      <v-select
        v-model="activeTab"
        :items="rondasDisponibles"
        :label="'Selecciona ronda'"
        :item-title="(ronda: number) => `Ronda ${ronda}`"
        :item-value="(ronda: number) => ronda"
        dense
        outlined
        style="max-width: 200px"
      />
    </div>
    <div>
      <div
        v-for="(partida, index) in partidasPorRonda[activeTab]"
        :key="partida.idPartidaTorneo"
        class="card-container"
      >
        <PartidaCard
          :partida="partida"
          :mesaIndex="index + 1"
          :idUsuario="idUsuario"
          :getGanador="getGanador"
          :formatDate="formatDate"
          @abrir-modal-validar="abrirModalValidar"
          @ver-lista="verLista"
          @modificar-partida="modificarPartida"
          @modificar-pairing="modificarPairing"
          @eliminar-partida="eliminarPartida"
        />
      </div>
    </div>
  </div>
</template>
