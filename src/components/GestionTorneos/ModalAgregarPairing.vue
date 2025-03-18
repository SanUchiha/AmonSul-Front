<template>
  <v-dialog v-model="isModalAgregarPairingVisible" max-width="400">
    <v-card>
      <v-card-title> Agregar emparejamiento </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <!-- Nick del jugador 1 -->
          <v-combobox
            label="Jugador 1"
            v-model="pairingAgregado.idUsuario1"
            :items="jugadores"
            item-title="nick"
            item-value="idUsuario"
            :rules="[rules.required]"
          ></v-combobox>

          <!-- Nombre del jugador 2 -->
          <v-combobox
            label="Jugador 2"
            v-model="pairingAgregado.idUsuario2"
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
            Agregar emparejamiento
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
    message="Pairing agregado correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido agregar el pairing. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, defineProps, onMounted } from "vue";
import { UsuarioFastDTO } from "@/interfaces/Usuario";
import { getUsuariosByTorneo } from "@/services/UsuariosService";
import {
  AddPairingTorneoDTO,
  RequestAddPairingTorneoDTO,
} from "@/interfaces/Live";
import { addPairingTorneo } from "@/services/PartidaTorneoService";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";

const props = defineProps<{
  isVisible: boolean;
  idTorneo: number;
  idRonda: number;
}>();

const emit = defineEmits(["cerrar"]);

const isModalAgregarPairingVisible = ref<boolean>(props.isVisible);
const pairingAgregado = ref<AddPairingTorneoDTO>({
  idTorneo: props.idTorneo,
  idRonda: props.idRonda,
});
const isFormValid = ref<boolean>(false);
const jugadores = ref<UsuarioFastDTO[]>();
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
    isModalAgregarPairingVisible.value = newVal;
  }
);

// Watch para detectar cuando se cierra el modal de éxito
watch(
  () => showSuccessModal.value,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      recargarPagina();
    }
  }
);

const recargarPagina = () => {
  window.location.reload();
};

// Reglas de validación
const rules = {
  required: (value: any) =>
    (value !== null && value !== undefined && value !== "") ||
    "Este campo es obligatorio",
};

const changeJugador = async () => {
  try {
    isGenerating.value = true;

    let idUsuario1 = pairingAgregado.value.idUsuario1;
    let idUsuario2 = pairingAgregado.value.idUsuario2;

    if (typeof idUsuario1 === "object") {
      idUsuario1 = idUsuario1.idUsuario;
    }

    if (typeof idUsuario2 === "object") {
      idUsuario2 = idUsuario2.idUsuario;
    }

    if (props.idTorneo == undefined) {
      console.error("error con el idtorneo");
      return;
    }

    if (props.idRonda == undefined || props.idRonda == 0) {
      console.error("error con la id Ronda");
      return;
    }
    const body: RequestAddPairingTorneoDTO = {
      idTorneo: props.idTorneo,
      idUsuario1: idUsuario1 as number,
      idUsuario2: idUsuario2 as number,
      idRonda: props.idRonda,
    };

    await addPairingTorneo(body);
    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    cerrarModal();
  }
};

onMounted(async () => {
  try {
    const responseJugadores = await getUsuariosByTorneo(props.idTorneo);

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
