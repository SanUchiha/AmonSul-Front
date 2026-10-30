<template>
  <!-- Amistosa pendiente: la misma tarjeta que las jugadas, con validar o cancelar debajo -->
  <CardPartidaLectura
    :contexto="['Pendiente', match.esElo ? 'ELO' : ''].filter(Boolean).join(' · ')"
    :fecha="formatFechaSpaWhitoutAsync(match.fechaPartida)"
    :jugador1="{
      idUsuario: match.idUsuario1,
      nick: match.nickUsuario1,
      ejercito: match.ejercitoUsuario1,
      puntos: match.resultadoUsuario1,
    }"
    :jugador2="{
      idUsuario: match.idUsuario2,
      nick: match.nickUsuario2,
      ejercito: match.ejercitoUsuario2,
      puntos: match.resultadoUsuario2,
    }"
    :escenario="match.escenarioPartida"
    :puntosPartida="match.puntosPartida"
    :idGanador="match.ganadorPartida"
    :idUsuarioDestacado="idUsuario"
  >
    <div class="d-flex flex-wrap align-center ga-2">
      <v-btn
        v-if="!validadaPorMi"
        color="success"
        variant="flat"
        size="small"
        prepend-icon="mdi-check"
        :loading="validando"
        :disabled="cancelando"
        @click="validar"
      >
        Validar
      </v-btn>
      <span v-else class="text-caption text-medium-emphasis">
        Esperando a que {{ nickRival }} la valide
      </span>
      <v-btn
        variant="text"
        color="error"
        size="small"
        class="ml-auto"
        :loading="cancelando"
        :disabled="validando"
        @click="confirmarCancelar = true"
      >
        Cancelar
      </v-btn>
    </div>
  </CardPartidaLectura>

  <!-- Cancelar la borra: mejor preguntarlo antes -->
  <v-dialog v-model="confirmarCancelar" max-width="400">
    <v-card>
      <v-card-title class="text-wrap">¿Cancelar la partida?</v-card-title>
      <v-card-text>
        La partida contra {{ nickRival }} se borrará y no contará para nada.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirmarCancelar = false">Volver</v-btn>
        <v-btn color="error" variant="flat" @click="cancelar">Cancelar partida</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import { cancelarPartida, ValidarPartida } from "@/services/PartidasAmistosasService";
import { formatFechaSpaWhitoutAsync } from "@/utils/Fecha";
import CardPartidaLectura from "@/components/Commons/CardPartidaLectura.vue";

const props = defineProps<{
  match: ViewPartidaAmistosaDTO;
}>();
// registroExitoso: la partida ha cambiado y hay que volver a cargar la lista
const emit = defineEmits(["registroExitoso"]);

const { getUser, getidUsuario } = useAuth();
const { triggerToast } = useToast();
const idUsuario = computed(() => Number(getidUsuario.value));

const soyJugador1 = computed(() => props.match.idUsuario1 === idUsuario.value);
const validadaPorMi = computed(() =>
  soyJugador1.value ? props.match.partidaValidadaUsuario1 : props.match.partidaValidadaUsuario2
);
const nickRival = computed(() =>
  soyJugador1.value ? props.match.nickUsuario2 : props.match.nickUsuario1
);

const validando = ref(false);
const cancelando = ref(false);
const confirmarCancelar = ref(false);

const validar = async () => {
  validando.value = true;
  try {
    await ValidarPartida({
      emailJugador: getUser.value ?? "",
      idPartida: props.match.idPartidaAmistosa,
    });
    triggerToast("success", "Partida validada");
    emit("registroExitoso");
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se ha podido validar la partida");
  } finally {
    validando.value = false;
  }
};

const cancelar = async () => {
  confirmarCancelar.value = false;
  cancelando.value = true;
  try {
    await cancelarPartida(props.match.idPartidaAmistosa);
    triggerToast("success", "Partida cancelada");
    emit("registroExitoso");
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se ha podido cancelar la partida");
  } finally {
    cancelando.value = false;
  }
};
</script>
