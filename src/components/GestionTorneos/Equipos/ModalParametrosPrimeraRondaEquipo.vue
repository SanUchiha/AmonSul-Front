<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Configurar Ronda {{ numeroRonda }}</v-card-title>

      <v-divider class="my-2" />

      <v-card-subtitle class="text-subtitle-1 font-weight-medium">
        Opciones de configuración
      </v-card-subtitle>

      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12">
              <v-switch
                v-model="configuracionManual"
                color="primary"
                inset
                label="¿Configurar la ronda manualmente?"
                disabled
              />
            </v-col>
          </v-row>

          <v-row v-if="configuracionManual">
            <v-col
              v-for="(mesa, mesaIndex) in numeroMesas"
              :key="mesaIndex"
              cols="12"
            >
              <v-sheet
                class="pa-4 mb-4 rounded-lg"
                elevation="1"
                style="border: 1px solid #e0e0e0"
              >
                <h3 class="text-subtitle-1 font-weight-bold mb-4">
                  Mesa {{ mesaIndex + 1 }}
                </h3>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      label="Equipo 1"
                      :items="equiposDisponiblesParaSlot(mesaIndex, 0)"
                      v-model="emparejamientos[mesaIndex][0]"
                      item-title="nombreEquipo"
                      item-value="idEquipo"
                      return-object
                      variant="outlined"
                      clearable
                      dense
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      label="Equipo 2"
                      :items="equiposDisponiblesParaSlot(mesaIndex, 1)"
                      v-model="emparejamientos[mesaIndex][1]"
                      item-title="nombreEquipo"
                      item-value="idEquipo"
                      return-object
                      variant="outlined"
                      clearable
                      dense
                    />
                  </v-col>
                </v-row>
              </v-sheet>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-row justify="center" class="my-4 gap-3">
          <v-btn
            :disabled="isGenerating"
            @click="handlerGenerarRonda"
            color="primary"
            variant="tonal"
          >
            Generar ronda
          </v-btn>
          <v-btn variant="tonal" color="secondary" @click="closeModal" large>
            Cancelar
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular indeterminate color="primary" size="70" />
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
    message="No se ha podido generarla ronda. Inténtalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <v-snackbar
    v-model="snackBarShow"
    :color="snackbarColor"
    :timeout="snackBarTimeOut"
    location="top"
    vertical
    rounded
    elevation="6"
  >
    {{ snackBarMessage }}
    <template #actions>
      <v-btn text icon @click="snackBarShow = false" aria-label="Close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>

  <v-dialog v-model="showByeConfirmDialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h6">Confirmar Bye</v-card-title>
      <v-card-text>
        Los equipos son impares. ¿Quieres proceder con un bye?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          color="primary"
          variant="tonal"
          @click="showByeConfirmDialog = false"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          @click="
            () => {
              showByeConfirmDialog = false;
              generaRonda();
            }
          "
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";
import {
  EquipoDTO,
  TorneoEquipoGestionInfoDTO,
} from "@/interfaces/Inscripcion";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";
import { generarRondaTorneoEquipos } from "@/services/TorneosService";
import {
  EmparejamientoEquiposDTO,
  GenerarRondaEquiposRequestDTO,
} from "@/interfaces/Torneo";

const props = defineProps<{
  isVisible: boolean;
  torneo: TorneoEquipoGestionInfoDTO | null;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
    if (newValue) initEmparejamientos();
  }
);

const numeroRonda = ref<number>(1);
const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const configuracionManual = ref<boolean>(false);
const necesitaBye = ref<boolean>(false);
const showByeConfirmDialog = ref(false);

const numeroMesas = ref<number>(0);

const equiposDisponibles = ref<EquipoDTO[]>([]);
const emparejamientos = ref<(EquipoDTO | null)[][]>([]);

const snackBarShow = ref<boolean>(false);
const snackBarMessage = ref<string>("");
const snackBarTimeOut = ref<number>(3000);
const snackbarColor = ref<string>("error"); // puede ser 'error', 'success', 'info', etc.

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

function initEmparejamientos() {
  if (!props.torneo) return;
  equiposDisponibles.value = [...props.torneo.equipos];

  numeroMesas.value = Math.ceil(equiposDisponibles.value.length / 2);
  necesitaBye.value = equiposDisponibles.value.length % 2 != 0;

  // Inicializar emparejamientos con null
  emparejamientos.value = Array(numeroMesas.value)
    .fill(null)
    .map(() => [null, null]);
}

function equiposDisponiblesParaSlot(mesaIndex: number, slotIndex: number) {
  const seleccionados = new Set<number>();

  emparejamientos.value.forEach((mesa, mIndex) => {
    mesa.forEach((equipo, sIndex) => {
      if (equipo !== null && !(mIndex === mesaIndex && sIndex === slotIndex)) {
        seleccionados.add(equipo.idEquipo);
      }
    });
  });

  return equiposDisponibles.value.filter(
    (equipo) => !seleccionados.has(equipo.idEquipo)
  );
}

const handlerGenerarRonda = () => {
  if (configuracionManual.value) {
    if (emparejamientos.value.length === 0) {
      snackBarMessage.value = "Añade al menos un emparejamiento";
      snackbarColor.value = "error";
      snackBarShow.value = true;
      return;
    }
    const allPairsValid = emparejamientos.value.every(
      (pair) => pair[0] !== null && pair[1] !== null
    );
    if (!allPairsValid) {
      if (necesitaBye.value) {
        showByeConfirmDialog.value = true;
        return;
      } else {
        snackBarMessage.value =
          "Completa todos los emparejamientos antes de generar la ronda";
        snackbarColor.value = "error";
        snackBarShow.value = true;
        return;
      }
    }
  }

  if (necesitaBye.value) {
    showByeConfirmDialog.value = true;
    return;
  }

  generaRonda();
};

const generaRonda = async () => {
  if (props.torneo?.torneo.idTorneo) {
    isGenerating.value = true;

    let emparejamientosDTO: EmparejamientoEquiposDTO[] = [];

    if (configuracionManual.value && emparejamientos.value.length > 0) {
      emparejamientosDTO = emparejamientos.value.map((par) => {
        return {
          equipo1: par[0] as EquipoDTO,
          equipo2: par[1] as EquipoDTO,
        };
      });
    }
    const request: GenerarRondaEquiposRequestDTO = {
      idTorneo: props.torneo?.torneo.idTorneo,
      idRonda: numeroRonda.value,
      isTorneoNarsil: false,
      necesitaBye: necesitaBye.value,
      emparejamientosEquipos: emparejamientosDTO,
    };
    try {
      await generarRondaTorneoEquipos(request);
      showSuccessModal.value = true;
      emit("confirm");
      closeModal();
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
    } finally {
      isGenerating.value = false;
    }
  }
};

onMounted(() => {
  if (internalIsVisible.value) initEmparejamientos();
  necesitaBye.value = equiposDisponibles.value.length % 2 != 0;

  if (necesitaBye.value)
    equiposDisponibles.value.push({
      idEquipo: 0,
      idCapitan: 0,
      inscripciones: [],
      nombreEquipo: "Equipo BYE",
    });
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
