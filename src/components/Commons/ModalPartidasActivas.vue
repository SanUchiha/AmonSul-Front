<template>
  <v-dialog v-model="modelValueProxy" max-width="500">
    <v-card>
      <v-card-title class="headline">Partidas de hoy</v-card-title>
      <v-card-text>
        <div v-if="estaJugando.partidas && estaJugando.partidas.length > 0">
          <!-- Como en la gestión; si le toca, el jugador (o el capitán) mete su resultado o valida el del rival -->
          <CardPartidaGestion
            v-for="(partida, idx) in partidasOrdenadas"
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
        </div>
        <div v-else>No tienes partidas activas.</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="tonal" @click="close">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { compartirSistemaAleman } from "@/composables/useSistemaAleman";
import { EstaJugandoDTO, PartidaTorneoDTO } from "@/interfaces/Partidas";
import { computed } from "vue";
import { FORMATO_COPA, FORMATO_LIGA } from "@/Constant/FormatoTorneo";
import { etiquetaPartidaCopa } from "@/utils/cuadroCopa";
import CardPartidaGestion from "@/components/GestionTorneos/CardPartidaGestion.vue";

// eslint-disable-next-line no-undef
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  estaJugando: {
    type: Object as () => EstaJugandoDTO,
    default: () => ({}),
  },
  idUsuario: {
    type: Number,
    required: true,
  },
});
// Con el sistema alemán, las partidas enseñan también los puntos que dan
compartirSistemaAleman(() => props.estaJugando.classificationType);

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const esLiga = computed(
  () => props.estaJugando?.formatoTorneo === FORMATO_LIGA
);
// En la copa, por su grupo y jornada o su ronda del cuadro
const esCopa = computed(
  () => props.estaJugando?.formatoTorneo === FORMATO_COPA
);

// «Ronda 2 · Mesa 3»; sin número de mesa (con partidas de dos eventos el mismo día) solo la ronda
const etiquetaRonda = (partida: PartidaTorneoDTO) =>
  partida.numeroMesa
    ? `Ronda ${partida.numeroRonda} · Mesa ${partida.numeroMesa}`
    : `Ronda ${partida.numeroRonda}`;

// La ronda en juego arriba: las ya jugadas del día quedan debajo
const partidasOrdenadas = computed(() =>
  [...(props.estaJugando?.partidas ?? [])].sort((a, b) => (b.numeroRonda ?? 0) - (a.numeroRonda ?? 0))
);

function close() {
  emit("update:modelValue", false);
}

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

<style scoped>
.v-dialog {
  z-index: 2000;
}
</style>
