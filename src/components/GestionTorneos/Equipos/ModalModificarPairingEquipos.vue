<template>
  <v-dialog v-model="dialogVisible" max-width="400">
    <v-card>
      <v-card-title>Modificar emparejamiento</v-card-title>
      <v-card-text>
        <div class="mb-4">
          <p><strong>Emparejamiento actual:</strong></p>
          <p>
            {{ equipoOriginal1?.nombre }} vs {{ equipoOriginal2?.nombre }}
            {{ showSuccessModal }}
          </p>
        </div>
        <v-select
          v-model="nuevoIdEquipo1"
          :items="equiposDisponibles"
          item-title="nombreEquipo"
          item-value="idEquipo"
          label="Nuevo equipo 1"
        />

        <v-select
          v-model="nuevoIdEquipo2"
          :items="equiposDisponibles"
          item-title="nombreEquipo"
          item-value="idEquipo"
          label="Nuevo equipo 2"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          variant="tonal"
          text
          @click="emit('update:modelValue', false)"
          >Cancelar</v-btn
        >
        <v-btn color="primary" variant="tonal" @click="confirmarCambio"
          >Guardar</v-btn
        >
      </v-card-actions>
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
    message="Emparejamiento cambiado con exito."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal error -->
  <ModalError
    :isVisible="showErrorModal"
    message="Ha ocurrido un error. Inténtalo de nuevo o contacta al administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import ModalError from "@/components/Commons/ModalError.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import {
  EquipoDisponibleParaModificacionDTO,
  ModificarPairingTorneoEquiposDTO,
} from "@/interfaces/Torneo";
import {
  getEquiposDisponiblesAsync,
  modificarPairingTorneoEquipos,
} from "@/services/TorneosService";
import { ref, watch, defineProps, defineEmits, computed, onMounted } from "vue";

interface Equipo {
  id: number;
  nombre: string;
}

const props = defineProps<{
  modelValue: boolean;
  equipoOriginal1: Equipo | null;
  equipoOriginal2: Equipo | null;
  numeroRonda: number;
  idTorneo: number;
}>();

const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const nuevoIdEquipo1 = ref<number | null>(null);
const nuevoIdEquipo2 = ref<number | null>(null);
const equiposDisponibles = ref<EquipoDisponibleParaModificacionDTO[]>([]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "guardar",
    payload: {
      idEquipo1Anterior: number;
      idEquipo2Anterior: number;
      idEquipo1Nuevo: number;
      idEquipo2Nuevo: number;
    }
  ): void;
}>();

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.equipoOriginal1 && props.equipoOriginal2) {
      nuevoIdEquipo1.value = props.equipoOriginal1.id;
      nuevoIdEquipo2.value = props.equipoOriginal2.id;
    }
  },
  { immediate: true }
);

watch(
  () => showSuccessModal.value,
  (nuevo, anterior) => {
    if (!nuevo && anterior) {
      location.reload();
    }
  }
);

onMounted(async () => {
  const response = await getEquiposDisponiblesAsync(props.idTorneo);
  equiposDisponibles.value = response.data;
});

async function confirmarCambio() {
  isGenerating.value = true;

  if (
    props.equipoOriginal1 &&
    props.equipoOriginal2 &&
    nuevoIdEquipo1.value &&
    nuevoIdEquipo2.value
  ) {
    const request: ModificarPairingTorneoEquiposDTO = {
      idEquipo1Old: props.equipoOriginal1.id,
      idEquipo2Old: props.equipoOriginal2.id,
      idEquipo1: nuevoIdEquipo1.value,
      idEquipo2: nuevoIdEquipo2.value,
      numeroRonda: props.numeroRonda,
      idTorneo: props.idTorneo,
    };

    try {
      await modificarPairingTorneoEquipos(request);
      showSuccessModal.value = true;
    } catch (error) {
      showErrorModal.value = true;
    } finally {
      isGenerating.value = false;
    }
  }
}
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
