<template>
  <v-dialog v-model="visible" max-width="600px">
    <v-card>
      <v-card-title>Agregar miembro al equipo</v-card-title>

      <v-divider />

      <v-card-text>
        <v-form>
          <v-combobox
            v-model="jugadorSelected"
            :items="props.jugadores"
            item-title="nick"
            item-value="idUsuario"
            label="Selecciona el jugador a añadir"
          />
          <v-row justify="center" class="my-4 ga-5">
            <v-btn variant="tonal" color="primary" @click="addJugador" large>Agregar</v-btn>
            <v-btn variant="tonal" color="secondary" @click="closeModal" large>Cancelar</v-btn>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular indeterminate color="primary" size="70" />
    </v-card>
  </v-dialog>

  <!-- Modal éxito -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Jugador añadido correctamente al equipo."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido añadir al jugador. Inténtelo de nuevo más tarde. Si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from "vue";
import { UsuarioSinEquipoDTO } from "@/interfaces/Usuario";
import { CreateMiembroEquipoDTO } from "@/interfaces/Inscripcion";
import { registrarMiembroEquipoAsync } from "@/services/InscripcionesService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

// Props y emits
const props = defineProps<{
  isVisible: boolean;
  idEquipo: number;
  idTorneo: number;
  jugadores: UsuarioSinEquipoDTO[];
}>();

const emit = defineEmits(["update:isVisible", "close", "confirm"]);

// v-model bidireccional para isVisible
const visible = computed({
  get: () => props.isVisible,
  set: (val: boolean) => emit("update:isVisible", val),
});

const jugadorSelected = ref<UsuarioSinEquipoDTO>();
const isGenerating = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);

// Cerrar modal
const closeModal = () => {
  emit("update:isVisible", false);
  emit("close");
};

// Añadir jugador
const addJugador = async () => {
  try {
    isGenerating.value = true;

    const idTorneo = props.idTorneo;
    const idUsuario = jugadorSelected.value?.idUsuario;
    const idEquipo = props.idEquipo;

    if (!idTorneo || !idUsuario) {
      throw new Error("Faltan datos necesarios para registrar jugador");
    }

    const request: CreateMiembroEquipoDTO = {
      IdUsuario: idUsuario,
      IdTorneo: idTorneo,
      IdEquipo: idEquipo,
    };

    const response = await registrarMiembroEquipoAsync(request);

    const nuevoMiembro = {
      idUsuario: jugadorSelected.value!.idUsuario,
      nick: jugadorSelected.value!.nick,
      idInscripcion: response.idInscripcion,
      listaData: null,
      estadoLista: "NO ENTREGADA",
      ejercito: null,
      esCapitan: false,
      idLista: 0,
      fechaEntregaLista2: undefined,
    };

    showSuccessModal.value = true;
    emit("confirm", nuevoMiembro);
    closeModal();
  } catch (error) {
    console.error("Error al registrar jugador:", error);
    showErrorModal.value = true;
  } finally {
    isGenerating.value = false;
  }
};
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
