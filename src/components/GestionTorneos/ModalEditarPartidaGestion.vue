<template>
  <v-dialog v-model="isModalEditarPartidaVisible" max-width="400">
    <v-card>
      <v-card-title> Editar partida </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <!-- Puntos del jugador 1 -->
          <v-text-field
            :label="`Puntos de ${props.partida.nick1}`"
            v-model="partidaEditada.resultadoUsuario1"
            type="number"
            :rules="[rules.required, rules.isNumber]"
          ></v-text-field>

          <!-- Puntos del jugador 2 -->
          <v-text-field
            :label="`Puntos de ${props.partida.nick2}`"
            v-model="partidaEditada.resultadoUsuario2"
            type="number"
            :rules="[rules.required, rules.isNumber]"
          ></v-text-field>

          <!-- Selección de escenario -->
          <v-combobox
            v-model="partidaEditada.escenarioPartida"
            :items="listaEscenarios"
            @click="loadEscenarios"
            label="Escenario"
          ></v-combobox>

          <!-- Líder del jugador 1 -->
          <v-radio-group
            v-model="partidaEditada.liderMuertoUsuario1"
            :label="`¿${props.partida.nick1} ha matado al líder?`"
            :rules="[rules.isBool]"
          >
            <v-radio label="Sí" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>

          <!-- Líder del jugador 2 -->
          <v-radio-group
            v-model="partidaEditada.liderMuertoUsuario2"
            :label="`¿${props.partida.nick2} ha matado al líder?`"
            :rules="[rules.isBool]"
          >
            <v-radio label="Sí" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>

          <!-- Validar 1 -->
          <v-radio-group
            v-model="partidaEditada.partidaValidadaUsuario1"
            :label="`¿Validar la partida de ${props.partida.nick1}?`"
            :rules="[rules.isBool]"
          >
            <v-radio label="Sí" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>

          <!-- Validar 2 -->
          <v-radio-group
            v-model="partidaEditada.partidaValidadaUsuario2"
            :label="`¿Validar la partida de ${props.partida.nick2}?`"
            :rules="[rules.isBool]"
          >
            <v-radio label="Sí" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          small
          variant="tonal"
          color="primary"
          @click="confirmarEditarPartida"
          :disabled="!isFormValid"
        >
          Confirmar
        </v-btn>
        <v-btn small variant="tonal" color="secondary" @click="cerrarModal">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, watch, defineProps } from "vue";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { appsettings } from "@/settings/appsettings";
import { UpdatePartidaTorneoDTO } from "@/interfaces/Live";

// Definir las props
const props = defineProps<{
  isVisible: boolean;
  partida: PartidaTorneoDTO;
}>();

// Emitir eventos
const emit = defineEmits(["confirm", "cerrar"]);

// Variables reactivas
const isModalEditarPartidaVisible = ref<boolean>(props.isVisible);
const partidaEditada = ref<UpdatePartidaTorneoDTO>({
  idPartidaTorneo: props.partida.idPartidaTorneo,
  resultadoUsuario1: props.partida.resultadoUsuario1,
  resultadoUsuario2: props.partida.resultadoUsuario2,
  escenarioPartida: props.partida.escenarioPartida,
  ganadorPartidaTorneo: props.partida.ganadorPartidaTorneo,
  partidaValidadaUsuario1: props.partida.partidaValidadaUsuario1,
  partidaValidadaUsuario2: props.partida.partidaValidadaUsuario2,
  liderMuertoUsuario1: props.partida.liderMuertoUsuario1,
  liderMuertoUsuario2: props.partida.liderMuertoUsuario2,
});
const isFormValid = ref<boolean>(false);

const listaEscenarios = ref<string[]>([]);
const isLoading = ref<boolean>(false);

// Función para cerrar el modal
const cerrarModal = () => {
  emit("cerrar");
};

// Función para confirmar la edición
const confirmarEditarPartida = () => {
  emit("confirm", partidaEditada.value);
};

// Monitorea cambios en la visibilidad del modal
watch(
  () => props.isVisible,
  (newVal) => {
    isModalEditarPartidaVisible.value = newVal;
  }
);

// Monitorea cambios en los datos de la partida
watch(
  () => props.partida,
  (newPartida) => {
    partidaEditada.value = { ...newPartida };
  },
  { immediate: true }
);

// Cargar escenarios
const loadEscenarios = async () => {
  isLoading.value = true;

  listaEscenarios.value = await appsettings.escenarios;

  isLoading.value = false;
};

// Reglas de validación
const rules = {
  required: (value: any) =>
    (value !== null && value !== undefined && value !== "") ||
    "Este campo es obligatorio",
  isNumber: (value: number) => !isNaN(value) || "Debe ser un número",
  isBool: (value: boolean) =>
    value == true || value == false || "Este campo es obligatorio",
};
</script>
