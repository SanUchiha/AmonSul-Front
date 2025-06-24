<template>
  <v-dialog v-model="isVisible" max-width="500">
    <v-card>
      <v-card-title class="text-h5">Cambiar Pairing</v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-select
              v-model="jugadorEquipo1Seleccionado"
              :items="equipo1?.componentesEquipoDTO || []"
              item-title="nick"
              item-value="idUsuario"
              :label="`${nombreEquipo1}`"
              :disabled="(equipo1?.componentesEquipoDTO?.length || 0) === 0"
              :loading="isloading"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="jugadorEquipo2Seleccionado"
              :items="equipo2?.componentesEquipoDTO || []"
              item-title="nick"
              item-value="idUsuario"
              :label="`${nombreEquipo2}`"
              :disabled="(equipo2?.componentesEquipoDTO?.length || 0) === 0"
              :loading="isloading"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="grey" variant="tonal" @click="cerrar">Cerrar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          @click="actualizar"
          :disabled="!jugadorEquipo1Seleccionado || !jugadorEquipo2Seleccionado"
        >
          Actualizar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { JugadoresEquipoParaCambioDTO } from "@/interfaces/Inscripcion";
import { ActualizarPairingEquiposDTO } from "@/interfaces/Partidas";
import { getJugadoresEquipos } from "@/services/InscripcionesService";
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps<{
  isVisible: boolean;
  idEquipo1: number;
  idEquipo2: number;
  nombreEquipo1: string;
  nombreEquipo2: string;
}>();

const emit = defineEmits<{
  (e: "actualizar", payload: ActualizarPairingEquiposDTO): void;
  (e: "cerrar"): void;
}>();

const isVisible = ref(props.isVisible);
watch(
  () => props.isVisible,
  (val) => (isVisible.value = val)
);

const jugadorEquipo1Seleccionado = ref<number | null>(null);
const jugadorEquipo2Seleccionado = ref<number | null>(null);
const equipos = ref<JugadoresEquipoParaCambioDTO[]>([]);
const equipo1 = ref<JugadoresEquipoParaCambioDTO>();
const equipo2 = ref<JugadoresEquipoParaCambioDTO>();
const isloading = ref<boolean>(false);

const cargarJugadores = async () => {
  isloading.value = true;
  try {
    const response = await getJugadoresEquipos(
      props.idEquipo1,
      props.idEquipo2
    );
    equipos.value = response.data;
    equipo1.value = equipos.value.find((e) => e.idEquipo === props.idEquipo1);
    equipo2.value = equipos.value.find((e) => e.idEquipo === props.idEquipo2);
  } catch (error) {
    console.error("Error cargando jugadores", error);
  } finally {
    isloading.value = false;
  }
};

const resetSeleccion = () => {
  jugadorEquipo1Seleccionado.value = null;
  jugadorEquipo2Seleccionado.value = null;
};

watch(isVisible, (val) => {
  if (val) {
    cargarJugadores();
    resetSeleccion();
  }
});

const actualizar = () => {
  if (
    jugadorEquipo1Seleccionado.value &&
    jugadorEquipo2Seleccionado.value &&
    equipo1.value &&
    equipo2.value
  ) {
    const jugador1 = equipo1.value.componentesEquipoDTO.find(
      (j) => j.idUsuario === jugadorEquipo1Seleccionado.value
    );
    const jugador2 = equipo2.value.componentesEquipoDTO.find(
      (j) => j.idUsuario === jugadorEquipo2Seleccionado.value
    );

    if (jugador1 && jugador2) {
      emit("actualizar", {
        idJugador1: jugador1.idUsuario,
        nombreEquipo1: props.nombreEquipo1,
        ejercitoEquipo1: jugador1.ejercito,
        nick1: jugador1.nick,
        idJugador2: jugador2.idUsuario,
        nombreEquipo2: props.nombreEquipo2,
        ejercitoEquipo2: jugador2.ejercito,
        nick2: jugador2.nick,
      });
      cerrar();
    }
  }
};
const cerrar = () => emit("cerrar");
</script>
