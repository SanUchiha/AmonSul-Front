<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Agregar jugador manualmente</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form>
          <v-combobox
            v-model="jugadorSelected"
            :items="jugadores"
            item-title="nick"
            item-value="idUsuario"
            label="Selecciona el jugador a añadir"
          ></v-combobox>
          <v-row justify="center" class="my-4 ga-5">
            <v-btn variant="tonal" color="primary" @click="addJugador" large
              >Agregar jugador al torneo</v-btn
            >
            <v-btn variant="tonal" color="secondary" @click="closeModal" large
              >Cancelar</v-btn
            >
          </v-row>
        </v-form>
      </v-card-text>
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
    message="Jugador añadido correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido añadir al jugador. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { JugadorParaEmparejamiento } from "@/interfaces/Live";
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";
import { getUsuariosFast } from "@/services/UsuariosService";
import { UsuarioFastDTO } from "@/interfaces/Usuario";
import {
  CrearInscripcionDTO,
  TorneoEquipoGestionInfoDTO,
} from "@/interfaces/Inscripcion";
import { registrarInscripcion } from "@/services/InscripcionesService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const props = defineProps<{
  isVisible: boolean;
  torneo: TorneoEquipoGestionInfoDTO | null;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const isGenerating = ref<boolean>(false);
const jugadorSelected = ref<JugadorParaEmparejamiento>();
const jugadores = ref<UsuarioFastDTO[]>();

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const addJugador = async () => {
  try {
    isGenerating.value = true;
    const idTorneo = props.torneo?.torneo.idTorneo;
    const idUsuario = jugadorSelected.value?.idUsuario;

    if (idTorneo === undefined || idUsuario === undefined) {
      throw new Error("El idTorneo o idUsuario no están definidos");
    }
    const addInscripcion: CrearInscripcionDTO = {
      idTorneo: idTorneo,
      idUsuario: idUsuario,
    };

    await registrarInscripcion(addInscripcion);
    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    emit("confirm");

    closeModal();
  }
};

onMounted(async () => {
  try {
    const responseJugadores = await getUsuariosFast();
    jugadores.value = responseJugadores.data;
  } catch (error) {
    console.error("Error al obtener la información del torneo:", error);
  }
});
</script>

<style scoped>
.progress-card {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
</style>
