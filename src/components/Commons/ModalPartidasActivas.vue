<template>
  <v-dialog v-model="modelValueProxy" max-width="500">
    <v-card>
      <v-card-title class="headline">Partidas de hoy</v-card-title>
      <v-card-text>
        <div v-if="estaJugando.partidas && estaJugando.partidas.length > 0">
          <div v-if="estaJugando.tipoTorneo == 'Individual'">
            <CardPartidaTorneoLive
              v-for="(partida, idx) in estaJugando.partidas"
              :key="partida.idPartidaTorneo || idx"
              :idUsuario="idUsuario"
              :match="partida"
              :mesa="`Mesa ${partida.numeroMesa}`"
              :completa="
                partida.partidaValidadaUsuario1 === true &&
                partida.partidaValidadaUsuario2 === true
              "
              :editarPartidaPJ="editarPartidaPJ(partida)"
              :soloValidarPJ="soloValidarPJ(partida)"
            />
          </div>
          <div v-else>
            <CardPartidaTorneoEquipoLive
              v-for="(partida, idx) in estaJugando.partidas"
              :key="partida.idPartidaTorneo || idx"
              :idUsuario="idUsuario"
              :match="partida"
              :mesa="`Mesa ${partida.numeroMesa}`"
              :completa="
                partida.partidaValidadaUsuario1 === true &&
                partida.partidaValidadaUsuario2 === true
              "
              :editarPartidaPJ="editarPartidaPJ(partida)"
              :soloValidarPJ="soloValidarPJ(partida)"
              :idEquipo="
                partida.idUsuario1 === idUsuario
                  ? partida.idEquipo1
                  : partida.idEquipo2
              "
            />
          </div>
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
import { EstaJugandoDTO, PartidaTorneoDTO } from "@/interfaces/Partidas";
import { computed } from "vue";
import CardPartidaTorneoEquipoLive from "@/components/PartidasTorneo/CardPartidaTorneoEquipoLive.vue";

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

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

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
