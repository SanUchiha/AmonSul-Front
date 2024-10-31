<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Crear torneo</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form>
          <v-text-field
            v-model="nombreTorneo"
            label="Nombre del torneo"
            required
            type="text"
          ></v-text-field>
          <v-text-field
            v-model="limiteParticipantes"
            label="Limite de jugadores"
            required
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="descripcionTorneo"
            label="Descripción del torneo (opcional)"
            type="text"
          ></v-text-field>
          <v-text-field
            v-model="fechaInicioTorneo"
            label="Día del torneo"
            required
          ></v-text-field>
          <v-text-field
            v-model="fechaFinTorneo"
            label="Último día del torneo"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-row justify="center" class="my-4 ga-5">
          <v-btn
            :disabled="isGenerating"
            @click="confirmarConfiguracion"
            color="primary"
            variant="tonal"
            >Crear</v-btn
          >
          <v-btn variant="tonal" color="secondary" @click="closeModal" large
            >Cancelar</v-btn
          >
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
    message="Torneo creado correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido crear el torneo. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { CrearTorneoDTO } from "@/interfaces/Torneo";

const props = defineProps<{
  isVisible: boolean;
  idUsuario: number;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const nombreTorneo = ref<string>();
const numeroRondas = ref<number>();
const limiteParticipantes = ref<string>();
const descripcionTorneo = ref<string>();
const fechaInicioTorneo = ref<string>();
const fechaFinTorneo = ref<string>();

const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

onMounted(async () => {
  //
});

const confirmarConfiguracion = async () => {
  const nuevoTorneo: CrearTorneoDTO = {
    idUsuario: props.idUsuario,
    nombreTorneo: nombreTorneo.value!,
    limiteParticipantes: 0,
    fechaInicioTorneo: "",
    fechaFinTorneo: "",
    precioTorneo: 0,
    numeroPartidas: 0,
    puntosTorneo: 0,
    estadoTorneo: 0,
    lugarTorneo: "",
    tipoTorneo: "",
    esLiga: false,
    idRangoTorneo: 0,
    esMatchedPlayTorneo: false,
    fechaEntregaListas: "",
    fechaFinInscripcion: "",
    horaInicioTorneo: "",
    horaFinTorneo: "",
  };
  try {
    isGenerating.value = true;

    showSuccessModal.value = true;
  } catch (error) {
    showErrorModal.value = true;
    console.error(error);
  } finally {
    isGenerating.value = false;
  }

  emit("confirm");
  closeModal();
};
</script>
<style scoped>
.remove-btn {
  background-color: transparent;
  color: red;
  margin-left: 16px; /* Espacio entre el texto y el botón */
  padding: 0;
  min-width: auto;
  display: flex;
  align-items: center;
}

.remove-btn .v-icon {
  font-size: 18px; /* Tamaño del ícono */
}

.emparejamientos-container {
  display: flex;
  flex-direction: column;
}

.emparejamiento-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.emparejamiento-text {
  flex-grow: 1;
}

.progress-card {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
</style>
