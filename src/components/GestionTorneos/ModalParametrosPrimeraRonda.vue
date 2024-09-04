<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Configurar Ronda</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form>
          <!-- <v-text-field
            v-model="luzVsOsc"
            label="¿Se permite luz vs oscuridad?"
            type="boolean"
            required
          ></v-text-field> -->

          <!-- <v-select
            v-model="mismaComunidad"
            :items="tiposSiNo"
            label="¿Se permite emparejamientos de la misma comunidad?"
            required
          ></v-select>

          <v-select
            v-model="luzVsOsc"
            :items="tiposSiNo"
            label="¿Se permite luz vs oscuridad?"
            required
          ></v-select> -->
          <v-checkbox
            v-model="mismaComunidadCheck"
            label="¿Se permite emparejamientos de la misma comunidad?"
          ></v-checkbox>

          <v-checkbox
            v-model="luzVsOscCheck"
            label="¿Se permite luz vs oscuridad?"
          ></v-checkbox>

          <v-checkbox
            v-model="esEloCheck"
            label="¿Quieres que tus partidas cuenten para el ELO?"
          ></v-checkbox>

          <v-checkbox
            v-model="retosCheck"
            label="¿Tenemos algun reto para esta ronda?"
          ></v-checkbox>

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
            <!-- <v-btn icon @click="removeEmparejamiento(index)" color="red">
              <v-icon>mdi-delete</v-icon>
            </v-btn> -->
            <v-btn
              :disabled="!isAddEmparejamientoEnabled"
              variant="outlined"
              color="blue"
              @click="addEmparejamiento"
              >Agregar Emparejamiento</v-btn
            >
          </div>

          <v-divider class="my-3"></v-divider>

          <div
            v-if="emparejamientos.length > 0"
            class="emparejamientos-container"
          >
            <h4>Emparejamientos:</h4>
            <div
              v-for="(emparejamiento, index) in emparejamientos"
              :key="index"
              class="emparejamiento-item"
            >
              <span class="emparejamiento-text">
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
        <v-spacer></v-spacer>
        <v-btn @click="closeModal">Cancelar</v-btn>
        <v-btn @click="confirmarConfiguracion" color="primary">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  Emparejamiento,
  GenerarRonda,
  JugadorParaEmparejamiento,
} from "@/interfaces/Live";
import {
  InscripcionTorneoCreadoDTO,
  TorneoGestionInfoDTO,
} from "@/interfaces/Torneo";
import { ref, defineProps, defineEmits, watch, onMounted, computed } from "vue";

const props = defineProps<{
  isVisible: boolean;
  torneo: TorneoGestionInfoDTO | null;
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
const luzVsOscCheck = ref<boolean>(false);
const retosCheck = ref<boolean>(false);
const esEloCheck = ref<boolean>(false);

const jugadoresObj = ref<InscripcionTorneoCreadoDTO[] | undefined>(
  props.torneo?.inscripciones
);
const jugadoresNick = ref<JugadorParaEmparejamiento[]>([]);
const jugador1 = ref<JugadorParaEmparejamiento>();
const jugador2 = ref<JugadorParaEmparejamiento>();

const tiposSiNo = ref<string[]>(["NO", "SI"]);

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

onMounted(() => {
  if (props.torneo?.inscripciones) {
    jugadoresObj.value = props.torneo.inscripciones;

    jugadoresObj.value.forEach(async (element) => {
      const jugadorObj: JugadorParaEmparejamiento = {
        idUsuario: element.idUsuario!,
        nick: element.nick!,
      };
      return await jugadoresNick.value.push(jugadorObj);
    });
  }
  console.log(jugadoresNick);
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

const confirmarConfiguracion = () => {
  const configuracion: GenerarRonda = {
    mismaComunidadCheck: mismaComunidadCheck.value,
    luzVsOscCheck: luzVsOscCheck.value,
    retosCheck: retosCheck.value,
    emparejamientos: emparejamientos.value,
    esEloCheck: esEloCheck.value,
  };

  console.log("Configuración final:", configuracion);

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
</style>
