<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Configurar Ronda {{ props.ronda }}</v-card-title>

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
              inline
              v-model="goodVsEvilCheckString"
              label="¿Prevalece luz vs oscuridad?"
            >
              <v-radio label="SI" value="SI"></v-radio>
              <v-radio label="NO" value="NO"></v-radio>
            </v-radio-group>

            <v-radio-group
              inline
              v-model="esRepetirRivalCheck"
              label="¿Se pueden repetir emparejamientos?"
            >
              <v-radio label="SI" value="SI"></v-radio>
              <v-radio label="NO" value="NO"></v-radio>
            </v-radio-group>
          </div>

          <v-radio-group
            v-if="isImpares"
            v-model="opcionImpares"
            label="Los jugadores son impares. ¿Cómo quieres gestionarlo?"
          >
            <v-radio label="Hacer un bye" value="bye"></v-radio>
          </v-radio-group>

          <div v-if="retosCheck">
            <v-combobox
              v-model="jugador1"
              :items="jugadoresNick"
              item-title="nick"
              item-value="idUsuario"
              label="Jugador 1"
            ></v-combobox>

            <v-combobox
              v-model="jugador2"
              :items="jugadoresNick"
              item-title="nick"
              item-value="idUsuario"
              label="Jugador 2"
            ></v-combobox>

            <v-btn
              :disabled="!isAddEmparejamientoEnabled"
              variant="tonal"
              color="blue"
              @click="addEmparejamiento"
              >Agregar Emparejamiento</v-btn
            >
          </div>
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
    :message="mensajeError"
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import {
  Clasificacion,
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
import { getPartidasTorneo } from "@/services/TorneosService";
import { emparejarSinRepetir } from "@/utils/emparejamientoSinRepetir";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const props = defineProps<{
  isVisible: boolean;
  torneo: TorneoGestionInfoMasDTO;
  clasificacion: Clasificacion[];
  clasificacionDividida: Clasificacion[];
  ronda: number;
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
const goodVsEvilCheck = ref<boolean>(false);
const isTorneoNarsil = ref<string>("NO");

const goodVsEvilCheckString = ref<string>("NO");
const retosCheck = ref<boolean>(false);
const esEloCheck = ref<boolean>(false);
const esRepetirRivalCheck = ref<string>("SI");
const opcionImpares = ref<string | null>(null);
const isImpares = ref<boolean>(false);
const numeroRonda = ref<number>();
const jugadoresObj = ref<InscripcionTorneoCreadoMasDTO[]>();
const jugadoresNick = ref<JugadorParaEmparejamiento[]>();
const jugador1 = ref<JugadorParaEmparejamiento>();
const jugador2 = ref<JugadorParaEmparejamiento>();
const rondas = ref<number[]>();
const isGenerating = ref<boolean>(false);
const torneoSelected = ref<TorneoGestionInfoMasDTO>();
const clasificacionDividida = ref<Clasificacion[]>([]);
const clasificacionZona1 = ref<Clasificacion[]>([]);
const clasificacionZona2 = ref<Clasificacion[]>([]);
const errorRonda = ref<string | null>(null);
const showErrorModal = ref<boolean>(false);
const MENSAJE_ERROR_GENERAL =
  "No se ha podido generar la ronda. Inténtalo de nuevo y si el error persiste contacta con el administrador.";
const MENSAJE_ERROR_SIN_REPETIR =
  "No se ha podido generar la ronda sin repetir emparejamientos. Prueba a permitir que se repitan.";
const mensajeError = ref<string>(MENSAJE_ERROR_GENERAL);
const showSuccessModal = ref<boolean>(false);
const emparejamientos = ref<
  { jugador1: JugadorParaEmparejamiento; jugador2: JugadorParaEmparejamiento }[]
>([]);
const isAddEmparejamientoEnabled = computed(() => {
  return jugador1.value && jugador2.value && jugador1.value !== jugador2.value;
});

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

watch(numeroRonda, (newValue) => {
  if (newValue) {
    errorRonda.value = null;
  }
});

onMounted(async () => {
  torneoSelected.value = props.torneo;

  // Si hay inscripciones, procesar jugadores
  if (torneoSelected.value?.inscripciones) {
    jugadoresObj.value = torneoSelected.value.inscripciones;
    isImpares.value = jugadoresObj.value?.length % 2 !== 0;

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

const dividirClasificacionEnZonas = () => {
  clasificacionDividida.value = props.clasificacionDividida;
  const totalJugadores: number = clasificacionDividida.value.length;
  const esImpar: boolean = totalJugadores % 2 !== 0;

  const mitad: number = Math.floor(totalJugadores / 2);

  var zona1Size: number = esImpar ? mitad + 1 : mitad;
  if (zona1Size % 2 !== 0) zona1Size = zona1Size + 1;

  clasificacionZona1.value = clasificacionDividida.value.slice(0, zona1Size);
  clasificacionZona2.value = clasificacionDividida.value.slice(zona1Size);
};

const generarEmparejamientos = (
  clasificacion: Clasificacion[]
): Emparejamiento[] => {
  const emparejamientos: Emparejamiento[] = [];

  if (props.torneo?.torneo.idTorneo == 7 && props.ronda > 2) {
    dividirClasificacionEnZonas();
    const zona1 = clasificacionZona1.value;
    const zona2 = clasificacionZona2.value;

    // Emparejar a los jugadores de zona 1
    const jugadoresZona1 = props.clasificacion.filter((jugador) =>
      zona1.some((z) => z.idUsuario === jugador.idUsuario)
    );

    for (let i = 0; i < jugadoresZona1.length; i += 2) {
      if (i + 1 < jugadoresZona1.length) {
        const jugador1 = jugadoresZona1[i];
        const jugador2 = jugadoresZona1[i + 1];

        emparejamientos.push({
          jugador1: { idUsuario: jugador1.idUsuario, nick: jugador1.nick },
          jugador2: { idUsuario: jugador2.idUsuario, nick: jugador2.nick },
        });
      }
    }

    // Emparejar a los jugadores de zona 2
    const jugadoresZona2 = props.clasificacion.filter((jugador) =>
      zona2.some((z) => z.idUsuario === jugador.idUsuario)
    );

    for (let i = 0; i < jugadoresZona2.length; i += 2) {
      if (i + 1 < jugadoresZona2.length) {
        const jugador1 = jugadoresZona2[i];
        const jugador2 = jugadoresZona2[i + 1];

        emparejamientos.push({
          jugador1: { idUsuario: jugador1.idUsuario, nick: jugador1.nick },
          jugador2: { idUsuario: jugador2.idUsuario, nick: jugador2.nick },
        });
      }
    }
  } else {
    // Emparejar en formato suizo
    for (let i = 0; i < clasificacion.length; i += 2) {
      if (i + 1 < clasificacion.length) {
        const jugador1 = clasificacion[i];
        const jugador2 = clasificacion[i + 1];

        emparejamientos.push({
          jugador1: { idUsuario: jugador1.idUsuario, nick: jugador1.nick },
          jugador2: { idUsuario: jugador2.idUsuario, nick: jugador2.nick },
        });
      }
    }
  }

  return emparejamientos;
};

const generarEmparejamientosLuzVsOscuridad = (
  clasificacion: Clasificacion[]
): Emparejamiento[] => {
  const emparejamientos: Emparejamiento[] = [];

  // Si es por zonas Hardcode domadores
  if (props.torneo?.torneo.idTorneo == 7 && props.ronda > 2) {
    dividirClasificacionEnZonas();
    const zona1 = clasificacionZona1.value;
    const zona2 = clasificacionZona2.value;

    // Emparejar a los jugadores de zona 1
    const jugadoresZona1 = props.clasificacion.filter((jugador) =>
      zona1.some((z) => z.idUsuario === jugador.idUsuario)
    );

    for (let i = 0; i < jugadoresZona1.length; i += 2) {
      if (i + 1 < jugadoresZona1.length) {
        const jugador1 = jugadoresZona1[i];
        const jugador2 = jugadoresZona1[i + 1];

        emparejamientos.push({
          jugador1: { idUsuario: jugador1.idUsuario, nick: jugador1.nick },
          jugador2: { idUsuario: jugador2.idUsuario, nick: jugador2.nick },
        });
      }
    }

    // Emparejar a los jugadores de zona 2
    const jugadoresZona2 = props.clasificacion.filter((jugador) =>
      zona2.some((z) => z.idUsuario === jugador.idUsuario)
    );

    for (let i = 0; i < jugadoresZona2.length; i += 2) {
      if (i + 1 < jugadoresZona2.length) {
        const jugador1 = jugadoresZona2[i];
        const jugador2 = jugadoresZona2[i + 1];

        emparejamientos.push({
          jugador1: { idUsuario: jugador1.idUsuario, nick: jugador1.nick },
          jugador2: { idUsuario: jugador2.idUsuario, nick: jugador2.nick },
        });
      }
    }
  } else {
    // Emparejar en formato suizo luz vs osc
    var clasificacionLuz: Clasificacion[] = [];
    var clasificacionOsc: Clasificacion[] = [];

    clasificacion.forEach((element) => {
      if (element.bando == "evil") clasificacionOsc.push(element);
      else clasificacionLuz.push(element);
    });

    do {
      const jugador1 = clasificacionLuz[0];
      const jugador2 = clasificacionOsc[0];
      emparejamientos.push({
        jugador1: { idUsuario: jugador1.idUsuario, nick: jugador1.nick },
        jugador2: { idUsuario: jugador2.idUsuario, nick: jugador2.nick },
      });

      clasificacionLuz.shift();
      clasificacionOsc.shift();

      clasificacion = clasificacion.filter(
        (element) =>
          element.idUsuario !== jugador1.idUsuario &&
          element.idUsuario !== jugador2.idUsuario
      );
    } while (clasificacionLuz.length > 0 && clasificacionOsc.length > 0);

    if (clasificacion.length > 1) {
      do {
        const jugador1 = clasificacion[0];
        const jugador2 = clasificacion[1];
        emparejamientos.push({
          jugador1: { idUsuario: jugador1.idUsuario, nick: jugador1.nick },
          jugador2: { idUsuario: jugador2.idUsuario, nick: jugador2.nick },
        });

        clasificacion.shift();
        clasificacion.shift();
      } while (clasificacion.length > 1);
    }
  }

  return emparejamientos;
};

// Sin repetir ningún emparejamiento de las rondas anteriores, bye incluido
const generarEmparejamientosSinRepetir = (
  clasificacion: Clasificacion[],
  partidasAnteriores: PartidaTorneoDTO[],
  luzVsOscuridad: boolean
): Emparejamiento[] | null => {
  // Hardcode para domadores: cada zona por separado
  if (props.torneo?.torneo.idTorneo == 7 && props.ronda > 2) {
    dividirClasificacionEnZonas();
    const emparejamientos: Emparejamiento[] = [];
    for (const zona of [clasificacionZona1.value, clasificacionZona2.value]) {
      const jugadoresZona = props.clasificacion.filter((jugador) =>
        zona.some((z) => z.idUsuario === jugador.idUsuario)
      );
      const emparejamientosZona = emparejarSinRepetir(
        jugadoresZona,
        partidasAnteriores
      );
      if (!emparejamientosZona) return null;
      emparejamientos.push(...emparejamientosZona);
    }
    return emparejamientos;
  }

  return emparejarSinRepetir(clasificacion, partidasAnteriores, luzVsOscuridad);
};

// Partidas de todas las rondas anteriores: así no se repite ningún emparejamiento en todo el torneo
const getPartidasRondasAnteriores = async (
  idTorneo: number
): Promise<PartidaTorneoDTO[]> => {
  const response = await getPartidasTorneo(idTorneo);
  return (response.data as PartidaTorneoDTO[]).filter(
    (partida) => partida.numeroRonda < props.ronda
  );
};

const confirmarConfiguracion = async () => {
  mensajeError.value = MENSAJE_ERROR_GENERAL;
  numeroRonda.value = props.ronda;
  if (!numeroRonda.value) {
    errorRonda.value = "El número de ronda es obligatorio.";
    return;
  }
  if (!props.torneo?.torneo.idTorneo) {
    console.error("El idTorneo no está definido");
    return;
  }

  let isNarsil = false;
  if (isTorneoNarsil.value === "SI") {
    isNarsil = true;
    mismaComunidadCheck.value = false;
    goodVsEvilCheck.value = false;
  }

  if (goodVsEvilCheckString.value === "SI") goodVsEvilCheck.value = true;
  else goodVsEvilCheck.value = false;

  // Guerra civil
  if (!goodVsEvilCheck.value) {
    //Si no se puede repetir el rival
    if (esRepetirRivalCheck.value == "NO" && !isNarsil) {
      errorRonda.value = null;

      const emparejamientosGenerados = generarEmparejamientosSinRepetir(
        props.clasificacion,
        await getPartidasRondasAnteriores(props.torneo.torneo.idTorneo),
        false
      );
      // Sin forma de emparejar a todos sin repetir: mejor no generar la ronda
      if (!emparejamientosGenerados) {
        mensajeError.value = MENSAJE_ERROR_SIN_REPETIR;
        showErrorModal.value = true;
        return;
      }

      const configuracion: GenerarRonda = {
        mismaComunidadCheck: mismaComunidadCheck.value,
        luzVsOscCheck: goodVsEvilCheck.value,
        retosCheck: retosCheck.value,
        emparejamientos: emparejamientosGenerados,
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

      //emit("confirm", configuracion);
      //closeModal();
    }
    //Si se puede repetir rival
    else {
      errorRonda.value = null;

      const emparejamientosGenerados: Emparejamiento[] = generarEmparejamientos(
        props.clasificacion
      );

      const configuracion: GenerarRonda = {
        mismaComunidadCheck: mismaComunidadCheck.value,
        luzVsOscCheck: goodVsEvilCheck.value,
        retosCheck: retosCheck.value,
        emparejamientos: emparejamientosGenerados,
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
    }
  }
  // luz vs oscuridad
  else {
    //Si no se puede repetir el rival

    if (esRepetirRivalCheck.value == "NO" && !isNarsil) {
      errorRonda.value = null;

      const emparejamientosGenerados = generarEmparejamientosSinRepetir(
        props.clasificacion,
        await getPartidasRondasAnteriores(props.torneo.torneo.idTorneo),
        true
      );
      // Sin forma de emparejar a todos sin repetir: mejor no generar la ronda
      if (!emparejamientosGenerados) {
        mensajeError.value = MENSAJE_ERROR_SIN_REPETIR;
        showErrorModal.value = true;
        return;
      }

      const configuracion: GenerarRonda = {
        mismaComunidadCheck: mismaComunidadCheck.value,
        luzVsOscCheck: goodVsEvilCheck.value,
        retosCheck: retosCheck.value,
        emparejamientos: emparejamientosGenerados,
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
    }
    //Si se puede repetir rival
    else {
      errorRonda.value = null;

      const emparejamientosGenerados: Emparejamiento[] =
        generarEmparejamientosLuzVsOscuridad(props.clasificacion);

      const configuracion: GenerarRonda = {
        mismaComunidadCheck: mismaComunidadCheck.value,
        luzVsOscCheck: goodVsEvilCheck.value,
        retosCheck: retosCheck.value,
        emparejamientos: emparejamientosGenerados,
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
    }
  }
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
