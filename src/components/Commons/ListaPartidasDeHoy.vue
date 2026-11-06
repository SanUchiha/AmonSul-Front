<template>
  <!-- Como en la gestión; si le toca, el jugador (o el capitán) mete su resultado o valida el del rival -->
  <CardPartidaGestion
    v-for="(partida, idx) in partidasVisibles"
    :key="partida.idPartidaTorneo || idx"
    :partida="partida"
    :editable="false"
    :etiqueta="
      esCopa
        ? etiquetaPartidaCopa(partida, null, estaJugando.rondasEliminatoria)
        : esLiga
          ? `Jornada ${partida.numeroRonda}`
          : etiquetaRonda(partida)
    "
    :idJugador="idUsuario"
    :meterResultado="editarPartidaPJ(partida)"
    :soloValidar="soloValidarPJ(partida)"
    :listaPorPareja="estaJugando.listaPorPareja === true"
    :cambiarPairing="estaJugando.torneoType !== 'Individual'"
  />
</template>

<script setup lang="ts">
import { compartirSistemaAleman } from "@/composables/useSistemaAleman";
import { juegaEn } from "@/composables/useRondasEnPestana";
import { EstaJugandoDTO, PartidaTorneoDTO } from "@/interfaces/Partidas";
import { computed, defineProps } from "vue";
import { FORMATO_COPA, FORMATO_LIGA } from "@/Constant/FormatoTorneo";
import { etiquetaPartidaCopa } from "@/utils/cuadroCopa";
import CardPartidaGestion from "@/components/GestionTorneos/CardPartidaGestion.vue";

const props = defineProps<{
  estaJugando: EstaJugandoDTO;
  idUsuario: number;
  // Solo las de este evento: con dos eventos el mismo día vienen las de los dos
  idTorneo?: number;
  // Solo la ronda en juego, con la suya primero: por equipos vienen las de todo el equipo
  soloRondaActual?: boolean;
}>();

// Con el sistema alemán, las partidas enseñan también los puntos que dan
compartirSistemaAleman(() => props.estaJugando.classificationType);

const esLiga = computed(() => props.estaJugando?.formatoTorneo === FORMATO_LIGA);
// En la copa, por su grupo y jornada o su ronda del cuadro
const esCopa = computed(() => props.estaJugando?.formatoTorneo === FORMATO_COPA);

// «Ronda 2 · Mesa 3»; sin número de mesa (con partidas de dos eventos el mismo día) solo la ronda
const etiquetaRonda = (partida: PartidaTorneoDTO) =>
  partida.numeroMesa
    ? `Ronda ${partida.numeroRonda} · Mesa ${partida.numeroMesa}`
    : `Ronda ${partida.numeroRonda}`;

// La ronda en juego arriba: las ya jugadas del día quedan debajo
const partidasOrdenadas = computed(() =>
  (props.estaJugando?.partidas ?? [])
    .filter(p => props.idTorneo === undefined || p.idTorneo === props.idTorneo)
    .sort((a, b) => (b.numeroRonda ?? 0) - (a.numeroRonda ?? 0))
);

const partidasVisibles = computed(() => {
  if (!props.soloRondaActual) return partidasOrdenadas.value;
  const ronda = partidasOrdenadas.value[0]?.numeroRonda;
  const mia = (p: PartidaTorneoDTO) => (juegaEn(p, props.idUsuario) ? 0 : 1);
  return partidasOrdenadas.value
    .filter(p => p.numeroRonda === ronda)
    .sort((a, b) => mia(a) - mia(b));
});

function editarPartidaPJ(partida: PartidaTorneoDTO) {
  if (
    partida.idCapitan1 === props.idUsuario ||
    partida.idCapitan2 === props.idUsuario
  ) {
    if (
      partida.idCapitan1 === props.idUsuario &&
      (partida.partidaValidadaUsuario1 === false ||
        partida.partidaValidadaUsuario1 === null)
    ) {
      return true;
    } else if (
      partida.idCapitan2 === props.idUsuario &&
      (partida.partidaValidadaUsuario2 === false ||
        partida.partidaValidadaUsuario2 === null)
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    if (
      partida.idUsuario1 === props.idUsuario &&
      (partida.partidaValidadaUsuario1 === false ||
        partida.partidaValidadaUsuario1 === null)
    ) {
      return true;
    } else if (
      partida.idUsuario2 === props.idUsuario &&
      (partida.partidaValidadaUsuario2 === false ||
        partida.partidaValidadaUsuario2 === null)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

function soloValidarPJ(partida: PartidaTorneoDTO) {
  if (
    partida.idCapitan1 === props.idUsuario ||
    partida.idCapitan2 === props.idUsuario
  ) {
    if (
      partida.idCapitan1 === props.idUsuario &&
      (partida.partidaValidadaUsuario1 === false ||
        partida.partidaValidadaUsuario1 === null) &&
      partida.partidaValidadaUsuario2 === true
    ) {
      return true;
    } else if (
      partida.idCapitan2 === props.idUsuario &&
      (partida.partidaValidadaUsuario2 === false ||
        partida.partidaValidadaUsuario2 === null) &&
      partida.partidaValidadaUsuario1 === true
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    if (
      partida.idUsuario1 === props.idUsuario &&
      (partida.partidaValidadaUsuario1 === false ||
        partida.partidaValidadaUsuario1 === null) &&
      partida.partidaValidadaUsuario2 === true
    ) {
      return true;
    } else if (
      partida.idUsuario2 === props.idUsuario &&
      (partida.partidaValidadaUsuario2 === false ||
        partida.partidaValidadaUsuario2 === null) &&
      partida.partidaValidadaUsuario1 === true
    ) {
      return true;
    } else {
      return false;
    }
  }
}
</script>
