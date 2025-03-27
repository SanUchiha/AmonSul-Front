<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Agregar miembro al equipo</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form>
          <v-combobox
            v-model="jugadorSelected"
            :items="props.jugadores"
            item-title="nick"
            item-value="idUsuario"
            label="Selecciona el jugador a añadir"
          ></v-combobox>
          <v-row justify="center" class="my-4 ga-5">
            <v-btn variant="tonal" color="primary" @click="addJugador" large
              >Agregar</v-btn
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
    message="Jugador añadido correctamente al equipo."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido añadir al jugador. Inténtelo de nuevo mas tarde. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";
import { UsuarioSinEquipoDTO } from "@/interfaces/Usuario";
import { CreateMiembroEquipoDTO } from "@/interfaces/Inscripcion";
import { registrarMiembroEquipoAsync } from "@/services/InscripcionesService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const props = defineProps<{
  isVisible: boolean;
  idEquipo: number;
  idTorneo: number;
  jugadores: UsuarioSinEquipoDTO[];
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
const jugadorSelected = ref<UsuarioSinEquipoDTO>();

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const addJugador = async () => {
  try {
    isGenerating.value = true;
    const idTorneo = props.idTorneo;
    const idUsuario = jugadorSelected.value?.idUsuario;
    const idEquipo = props.idEquipo;

    if (idTorneo === undefined || idUsuario === undefined) {
      throw new Error("El idTorneo o idUsuario no están definidos");
    }
    const request: CreateMiembroEquipoDTO = {
      IdUsuario: idUsuario,
      IdTorneo: idTorneo,
      IdEquipo: idEquipo,
    };

    await registrarMiembroEquipoAsync(request);
    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
    emit("confirm", jugadorSelected.value);

    closeModal();
  }
};

onMounted(async () => {
  try {
    // console.log(props.idTorneo);
    // const responseJugadores = await getUsuariosNoInscritosTorneoAsync(
    //   props.idTorneo
    // );
    // jugadores.value = (responseJugadores?.data ?? []).sort(
    //   (a: { nick: string }, b: { nick: string }) => a.nick.localeCompare(b.nick)
    // );
  } catch (error) {
    console.error("Error al obtener la información del torneo:", error);
    //jugadores.value = [];
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
