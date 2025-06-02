<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title style="white-space: normal">
        Configurar Ronda
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form>
          <v-radio-group v-model="isTorneoNarsil" class="text-wrap">
            <template #label>
              <div style="white-space: normal">¿Eres el mítico Narsil?</div>
            </template>
            <v-radio label="Sí" value="SI" />
            <v-radio label="No" value="NO" />
          </v-radio-group>

          <div v-if="isTorneoNarsil === 'NO'">
            <v-radio-group
              v-model="mismaComunidadCheckString"
              class="text-wrap"
            >
              <template #label>
                <div style="white-space: normal">
                  ¿Se permiten emparejamientos de la misma comunidad de juego?
                </div>
              </template>
              <v-radio label="Sí" value="SI" />
              <v-radio label="No" value="NO" />
            </v-radio-group>

            <v-radio-group v-model="goodVsEvilCheckString" class="text-wrap">
              <template #label>
                <div style="white-space: normal">
                  ¿Prevalece luz vs oscuridad?
                </div>
              </template>
              <v-radio label="Sí" value="SI" />
              <v-radio label="No" value="NO" />
            </v-radio-group>
          </div>

          <v-radio-group
            v-if="isImpares"
            v-model="opcionImpares"
            class="text-wrap"
          >
            <template #label>
              <div style="white-space: normal">
                Los jugadores son impares. ¿Cómo quieres gestionarlo?
              </div>
            </template>
            <v-radio label="Hacer un bye" value="bye" />
          </v-radio-group>

          <v-checkbox
            v-model="retosCheck"
            label="¿Tenemos algún reto para esta ronda?"
            class="text-wrap"
            style="white-space: normal"
          ></v-checkbox>

          <div v-if="retosCheck">
            <v-combobox
              v-model="jugador1"
              :items="jugadoresNick"
              item-title="nick"
              item-value="idUsuario"
              label="Jugador 1"
              class="mb-2"
            ></v-combobox>

            <v-combobox
              v-model="jugador2"
              :items="jugadoresNick"
              item-title="nick"
              item-value="idUsuario"
              label="Jugador 2"
              class="mb-2"
            ></v-combobox>

            <v-btn
              :disabled="!isAddEmparejamientoEnabled"
              variant="tonal"
              color="blue"
              @click="addEmparejamiento"
              block
              class="mt-2"
            >
              Agregar Emparejamiento
            </v-btn>
          </div>

          <v-divider class="my-3"></v-divider>

          <div
            v-if="emparejamientos.length > 0"
            class="emparejamientos-container"
          >
            <h4 style="white-space: normal">Emparejamientos:</h4>
            <div
              v-for="(emparejamiento, index) in emparejamientos"
              :key="index"
              class="emparejamiento-item d-flex align-center justify-space-between my-2"
            >
              <span style="white-space: normal">
                Mesa {{ index + 1 }}: {{ emparejamiento.jugador1.nick }} vs
                {{ emparejamiento.jugador2.nick }}
              </span>
              <v-btn
                class="remove-btn"
                @click="removeEmparejamiento(index)"
                icon
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-row justify="center" class="my-4" no-gutters>
          <v-col cols="12" sm="auto" class="mb-2 mb-sm-0">
            <v-btn
              :disabled="isGenerating"
              @click="confirmarConfiguracion"
              color="primary"
              variant="tonal"
              block
            >
              Generar ronda
            </v-btn>
          </v-col>
          <v-col cols="12" sm="auto">
            <v-btn variant="tonal" color="secondary" @click="closeModal" block>
              Cancelar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" hide-overlay persistent>
    <v-card class="progress-card d-flex justify-center pa-5">
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
      ></v-progress-circular>
    </v-card>
  </v-dialog>

  <!-- Modal success -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Ronda generada correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido generarla ronda. Inténtalo de nuevo y si el error persiste, contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import {
  Emparejamiento,
  GenerarRonda,
  JugadorParaEmparejamiento,
} from "@/interfaces/Live";
import {
  InscripcionTorneoCreadoMasDTO,
  TorneoGestionInfoMasDTO,
} from "@/interfaces/Torneo";
import { generarRonda } from "@/services/PartidaTorneoService";
import { ref, defineProps, defineEmits, watch, onMounted, computed } from "vue";
import { getInfoTorneoCreadoMasAsync } from "@/services/TorneosService";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";

const props = defineProps<{
  isVisible: boolean;
  torneo: TorneoGestionInfoMasDTO | null;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const mismaComunidadCheck = ref<boolean>(false);
const mismaComunidadCheckString = ref<string>("SI");
const isTorneoNarsil = ref<string>("NO");
const goodVsEvilCheck = ref<boolean>(false);
const goodVsEvilCheckString = ref<string>("SI");
const retosCheck = ref<boolean>(false);
const esEloCheck = ref<boolean>(false);
const opcionImpares = ref<string | null>(null);
const isImpares = ref<boolean>(false);
const numeroRonda = ref<number>(1);

const inscripciones = ref<InscripcionTorneoCreadoMasDTO[]>();
const jugadoresNick = ref<JugadorParaEmparejamiento[]>();
const jugador1 = ref<JugadorParaEmparejamiento>();
const jugador2 = ref<JugadorParaEmparejamiento>();

const rondas = ref<number[]>();
const isGenerating = ref<boolean>(false);
const torneoSelected = ref<TorneoGestionInfoMasDTO>();

const errorRonda = ref<string | null>(null);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const emparejamientos = ref<
  { jugador1: JugadorParaEmparejamiento; jugador2: JugadorParaEmparejamiento }[]
>([]);
const isAddEmparejamientoEnabled = computed(() => {
  return jugador1.value && jugador2.value && jugador1.value !== jugador2.value;
});

watch(numeroRonda, (newValue) => {
  if (newValue) {
    errorRonda.value = null;
  }
});

onMounted(async () => {
  try {
    if (!props.torneo?.torneo.idTorneo) {
      console.error("El idTorneo no está definido");
      return;
    }
    // Obtener información del torneo creado
    const responseTorneo = await getInfoTorneoCreadoMasAsync(
      props.torneo?.torneo.idTorneo
    );
    torneoSelected.value = responseTorneo.data;

    // Si hay inscripciones, procesar jugadores
    if (torneoSelected.value?.inscripciones) {
      inscripciones.value = torneoSelected.value.inscripciones;
      isImpares.value = inscripciones.value?.length % 2 !== 0;

      // Usamos `for...of` para manejar promesas de manera secuencial o `map` con `Promise.all`
      jugadoresNick.value = torneoSelected.value?.inscripciones.map(
        (element) => ({
          idUsuario: element.idUsuario,
          nick: element.nick,
        })
      );
    }

    // Procesar rondas si existe el número de partidas
    if (torneoSelected.value?.torneo?.numeroPartidas) {
      const totalRondas = torneoSelected.value.torneo.numeroPartidas;
      rondas.value = Array.from({ length: totalRondas }, (_, i) => i + 1);
    }
  } catch (error) {
    console.error("Error al obtener la información del torneo:", error);
  }
});

const addEmparejamiento = () => {
  //Validaciones

  if (!jugador1.value || !jugador2.value) {
    alert("No puedes dejar a los jugadores en blanco");
    return;
  }

  if (jugador1.value.idUsuario === jugador2.value.idUsuario) {
    alert("No puedes emparejar al mismo jugador.");
    return;
  }

  const isJugador1InEmparejamientos: boolean = emparejamientos.value.some(
    (emparejamiento) =>
      emparejamiento.jugador1.idUsuario === jugador1.value!.idUsuario ||
      emparejamiento.jugador2.idUsuario === jugador1.value!.idUsuario
  );
  const isJugador2InEmparejamientos: boolean = emparejamientos.value.some(
    (emparejamiento) =>
      emparejamiento.jugador1.idUsuario === jugador2.value!.idUsuario ||
      emparejamiento.jugador2.idUsuario === jugador2.value!.idUsuario
  );

  if (isJugador1InEmparejamientos || isJugador2InEmparejamientos) {
    alert("Uno o ambos jugadores ya están emparejados.");
    return;
  }

  const emparejamientoTerminado: Emparejamiento = {
    jugador1: jugador1.value,
    jugador2: jugador2.value,
  };
  emparejamientos.value.push(emparejamientoTerminado);

  jugador1.value = undefined;
  jugador2.value = undefined;
};

const removeEmparejamiento = (index: number) => {
  emparejamientos.value.splice(index, 1);
};

const confirmarConfiguracion = async () => {
  if (!numeroRonda.value) {
    errorRonda.value = "El número de ronda es obligatorio.";
    return;
  }
  if (!props.torneo?.torneo.idTorneo) {
    console.error("El idTorneo no está definido");
    return;
  }

  errorRonda.value = null;
  if (mismaComunidadCheckString.value === "SI")
    mismaComunidadCheck.value = true;
  else mismaComunidadCheck.value = false;

  if (goodVsEvilCheckString.value === "SI") goodVsEvilCheck.value = true;
  else goodVsEvilCheck.value = false;

  let isNarsil = false;
  if (isTorneoNarsil.value === "SI") isNarsil = true;

  const configuracion: GenerarRonda = {
    mismaComunidadCheck: mismaComunidadCheck.value,
    luzVsOscCheck: goodVsEvilCheck.value,
    retosCheck: retosCheck.value,
    emparejamientos: emparejamientos.value,
    esEloCheck: esEloCheck.value,
    opcionImpares: opcionImpares.value,
    idTorneo: props.torneo?.torneo.idTorneo,
    idRonda: numeroRonda.value,
    isTorneoNarsil: isNarsil,
  };

  try {
    isGenerating.value = true;

    await generarRonda(configuracion);
    showSuccessModal.value = true;
  } catch (error) {
    showErrorModal.value = true;
    console.error(error);
  } finally {
    isGenerating.value = false;
  }

  emit("confirm", configuracion);
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
