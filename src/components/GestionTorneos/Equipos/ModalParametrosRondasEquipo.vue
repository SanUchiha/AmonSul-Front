<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Configurar Ronda {{ props.ronda }}</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form>
          <v-radio-group
            v-model="esRepetirRivalCheck"
            label="¿Se puede repetir rival de la ronda anterior?"
          >
            <v-radio label="SI" value="SI"></v-radio>
            <v-radio label="NO" value="NO"></v-radio>
          </v-radio-group>

          <v-radio-group
            v-if="isImpares"
            v-model="opcionImpares"
            label="Los equipos son impares. ¿Cómo quieres gestionarlo?"
          >
            <v-radio label="Hacer un bye" value="SI"></v-radio>
            <v-radio label="Nada" value="NO"></v-radio>
          </v-radio-group>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-row justify="center" class="ga-5">
          <v-btn
            :disabled="isGenerating"
            @click="confirmarConfiguracion"
            color="primary"
            variant="tonal"
            >Generar ronda</v-btn
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
    message="Ronda generada correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido generarla ronda. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import {
  ClasificacionEquipo,
  GenerarOtraRondaEquiposRequestDTO,
  PairingDTO,
} from "@/interfaces/Torneo";
import { ref, defineProps, defineEmits, watch, computed } from "vue";

import {
  EquipoDTO,
  TorneoEquipoGestionInfoDTO,
} from "@/interfaces/Inscripcion";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import { generarOtraRondaTorneoEquipos } from "@/services/TorneosService";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";

const props = defineProps<{
  isVisible: boolean;
  torneo: TorneoEquipoGestionInfoDTO | null;
  clasificacion: ClasificacionEquipo[];
  ronda: number;
  partidas: PartidaTorneoDTO[];
}>();

const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);

const esRepetirRivalCheck = ref<string>("SI");
const opcionImpares = ref<string>("NO");
const isImpares = ref<boolean>(false);
const numeroRonda = ref<number>();
const isGenerating = ref<boolean>(false);
const errorRonda = ref<string | null>(null);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const clasififacionEquipo = ref<EquipoDTO[]>();

watch(
  () => props.torneo?.equipos,
  (equipos) => {
    if (equipos && equipos.length > 0) {
      isImpares.value = equipos.length % 2 !== 0;
    } else {
      isImpares.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const confirmGenerate = () => {
  internalIsVisible.value = false;
  emit("confirm");
};

watch(numeroRonda, (newValue) => {
  if (newValue) {
    errorRonda.value = null;
  }
});

const equiposOrdenados = computed(() => {
  if (!props.torneo?.equipos || !props.clasificacion) return [];

  const mapEquipos = new Map<number, EquipoDTO>();
  props.torneo.equipos.forEach((equipo) => {
    mapEquipos.set(equipo.idEquipo, equipo);
  });

  return props.clasificacion
    .map((clasificado) => mapEquipos.get(clasificado.idEquipo))
    .filter((equipo): equipo is EquipoDTO => equipo !== undefined);
});

watch(
  equiposOrdenados,
  (nuevaLista) => {
    clasififacionEquipo.value = nuevaLista;
  },
  { immediate: true }
);

function getPairingsRondaAnterior(): PairingDTO[] {
  if (!props.partidas || props.ronda <= 1) return [];

  const vistos = new Set<string>();

  return props.partidas
    .filter(
      (p) =>
        p.numeroRonda === props.ronda - 1 &&
        typeof p.idEquipo1 === "number" &&
        typeof p.idEquipo2 === "number"
    )
    .filter((p) => {
      const id1 = p.idEquipo1 as number;
      const id2 = p.idEquipo2 as number;
      const key = [id1, id2].sort((a, b) => a - b).join("-");
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    })
    .map((p) => ({
      idEquipo1: p.idEquipo1 as number,
      idEquipo2: p.idEquipo2 as number,
    }));
}

const confirmarConfiguracion = async () => {
  isGenerating.value = true;

  let necesitaBye: boolean;
  if (opcionImpares.value == "SI") necesitaBye = true;
  else necesitaBye = false;

  let repetirRival: boolean;
  if (esRepetirRivalCheck.value == "SI") repetirRival = true;
  else repetirRival = false;

  const pairingsPrevios = getPairingsRondaAnterior();

  if (
    clasififacionEquipo.value != undefined &&
    props.partidas.length > 0 &&
    props.torneo
  ) {
    const request: GenerarOtraRondaEquiposRequestDTO = {
      clasificacion: clasififacionEquipo.value,
      permiteRepetirRival: repetirRival,
      necesitaBye: necesitaBye,
      pairingRondaAnterior: pairingsPrevios,
      idTorneo: props.torneo.torneo.idTorneo,
      idRonda: props.ronda,
    };

    try {
      await generarOtraRondaTorneoEquipos(request);

      isGenerating.value = false;
      showSuccessModal.value = true;
      confirmGenerate();
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
      isGenerating.value = false;
    } finally {
      isGenerating.value = false;
      //closeModal();
    }
  }
};
</script>
<style scoped></style>
