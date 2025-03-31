<template>
  <v-dialog v-model="isModalPairingVisible" max-width="400">
    <v-card>
      <v-card-title> Editar emparejamiento </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <v-combobox
            label="Selecciona el nuevo jugador 1"
            v-model="pairingEditado.idUsuario1"
            :items="jugadores"
            item-title="nick"
            item-value="idUsuario"
            :rules="[rules.required]"
          ></v-combobox>
          <v-combobox
            label="Selecciona el nuevo jugador 2"
            v-model="pairingEditado.idUsuario2"
            :items="jugadores"
            item-title="nick"
            item-value="idUsuario"
            :rules="[rules.required]"
          ></v-combobox>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center" class="my-4 ga-5">
          <v-btn
            variant="tonal"
            color="primary"
            @click="() => changeJugador()"
            large
          >
            Modificar emparejamiento
          </v-btn>

          <v-btn small variant="tonal" color="secondary" @click="cerrarModal">
            Cancelar
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
      ></v-progress-circular>
    </v-card>
  </v-dialog>

  <!-- Modal response eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Pairing modificado correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido modificar el pairing. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, defineProps, onMounted } from "vue";
import {
  UsuarioFastDTO,
  UsuarioInscripcionTorneoDTO,
} from "@/interfaces/Usuario";
import { getUsuariosByTorneo } from "@/services/UsuariosService";
import {
  RequestUpdatePairingTorneoDTO,
  UpdatePairingTorneoDTO,
} from "@/interfaces/Live";
import { updatePairingTorneo } from "@/services/PartidaTorneoService";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";

const props = defineProps<{
  isVisible: boolean;
  partida: UpdatePairingTorneoDTO;
  idTorneo: number;
}>();

const emit = defineEmits(["confirm", "cerrar"]);

const isModalPairingVisible = ref<boolean>(props.isVisible);
const pairingEditado = ref<UpdatePairingTorneoDTO>({
  nick1: props.partida.nick1,
  nick2: props.partida.nick2,
  idPartidaTorneo: props.partida.idPartidaTorneo,
  idTorneo: props.partida.idTorneo,
  idUsuario1: props.partida.idUsuario1,
  idUsuario2: props.partida.idUsuario2,
});
const isFormValid = ref<boolean>(false);
const jugadores = ref<UsuarioInscripcionTorneoDTO[]>();
const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

// Función para cerrar el modal
const cerrarModal = () => {
  emit("cerrar");
};

// Monitorea cambios en la visibilidad del modal
watch(
  () => props.isVisible,
  (newVal) => {
    isModalPairingVisible.value = newVal;
  }
);

watch(
  () => props.partida,
  (newPartida) => {
    pairingEditado.value.idUsuario1 = newPartida.idUsuario1;
    pairingEditado.value.idUsuario2 = newPartida.idUsuario2;
  },
  { immediate: true }
);

// Reglas de validación
const rules = {
  required: (value: any) =>
    (value !== null && value !== undefined && value !== "") ||
    "Este campo es obligatorio",
};

const changeJugador = async () => {
  try {
    isGenerating.value = true;

    let idUsuario1 = pairingEditado.value.idUsuario1;
    let idUsuario2 = pairingEditado.value.idUsuario2;

    if (typeof idUsuario1 === "object") {
      idUsuario1 = idUsuario1.idUsuario;
    }

    if (typeof idUsuario2 === "object") {
      idUsuario2 = idUsuario2.idUsuario;
    }

    const body: RequestUpdatePairingTorneoDTO = {
      idPartidaTorneo: props.partida.idPartidaTorneo,
      idUsuario1: idUsuario1 as number,
      idUsuario2: idUsuario2 as number,
    };

    await updatePairingTorneo(body);
    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    emit("confirm");
    cerrarModal();
  }
};

onMounted(async () => {
  try {
    const responseJugadores = await getUsuariosByTorneo(props.idTorneo);
    jugadores.value = responseJugadores.data;

    // Mapeamos el array de jugadores para obtener solo el idUsuario y el nick
    jugadores.value = responseJugadores.data.map((jugador: UsuarioFastDTO) => ({
      idUsuario: jugador.idUsuario,
      nick: jugador.nick,
    }));
  } catch (error) {
    console.error("Error al obtener la información del torneo:", error);
  }
});
</script>

<style>
.progress-card {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
</style>
