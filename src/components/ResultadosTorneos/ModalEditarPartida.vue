<template>
  <v-dialog v-model="isModalEditarPartidaVisible" max-width="400">
    <v-card>
      <v-card-title> Editar partida </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="isFormValid">
          <v-text-field
            :label="`Puntos de ${props.partida.nick1}`"
            v-model="partidaEditada.resultadoUsuario1"
            type="number"
            :rules="[rules.required, rules.isNumber]"
          ></v-text-field>

          <v-text-field
            :label="`Puntos de ${props.partida.nick2}`"
            v-model="partidaEditada.resultadoUsuario2"
            type="number"
            :rules="[rules.required, rules.isNumber]"
          ></v-text-field>

          <v-combobox
            v-model="escenario"
            :items="listaEscenarios"
            @click="loadEscenarios"
            label="Escenario"
          ></v-combobox>

          <v-radio-group
            v-model="partidaEditada.liderMuertoUsuario1"
            :label="`¿${props.partida.nick1} ha matado al general?`"
            :rules="[rules.isBool]"
          >
            <v-radio label="Sí" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>

          <!-- Radio group para el líder de usuario 2 -->
          <v-radio-group
            v-model="partidaEditada.liderMuertoUsuario2"
            :label="`¿${props.partida.nick2} ha matado al general?`"
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
import { UpdatePartidaTorneoDTO } from "@/interfaces/Live";
import { ref, defineEmits, watch, defineProps } from "vue";
import { PartidaTorneoDTO, PartidaTorneoMasDTO } from "@/interfaces/Partidas";
import { appsettings } from "@/settings/appsettings";

// Tipamos las props correctamente
const props = defineProps<{
  isVisible: boolean;
  partida: PartidaTorneoDTO | PartidaTorneoMasDTO;
  idUsuario: number;
}>();

// Emite evento para cerrar el modal y enviar los puntos
const emit = defineEmits(["confirmar", "cerrar"]);

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

const escenario = ref<string>();
const listaEscenarios = ref<string[]>([]);
const isLoading = ref<boolean>(false);
const isLoadingEscenarios = ref<boolean>(false);

// Cerrar el modal
const cerrarModal = () => {
  emit("cerrar");
};

// Confirmar los puntos y cerrar el modal
const confirmarEditarPartida = () => {
  if (props.idUsuario == 1) {
    partidaEditada.value.partidaValidadaUsuario1 = true;
  } else {
    partidaEditada.value.partidaValidadaUsuario2 = true;
  }

  emit("confirmar", partidaEditada.value);
  cerrarModal();
};

// Monitorea cambios en la visibilidad del modal y en la prop 'partida'
watch(
  () => props.isVisible,
  (newVal) => {
    isModalEditarPartidaVisible.value = newVal;
  }
);

watch(
  () => props.partida,
  (newPartida) => {
    partidaEditada.value = { ...newPartida };
  },
  { immediate: true }
);

const loadEscenarios = async () => {
  isLoading.value = true;
  isLoadingEscenarios.value = true;

  listaEscenarios.value = await appsettings.escenarios;

  isLoading.value = false;
  isLoadingEscenarios.value = false;
};

// Reglas de validación
const rules = {
  required: (value: unknown) => !!value || "Este campo es obligatorio",
  isNumber: (value: number) => !isNaN(value) || "Debe ser un número",
  isBool: (value: boolean) =>
    value == true || value == false || "Este campo es obligatorio",
};
</script>
