<template>
  <div v-if="loading" class="center">
    <ProgressCircular />
  </div>
  <div v-else class="center">
    <v-card class="center-card">
      <v-card-title>{{ nickJugadorUno }} vs {{ nickJugadorDos }}</v-card-title>
      <v-card-text>
        <p>
          Resultado: {{ match.resultadoUsuario1 }} -
          {{ match.resultadoUsuario2 }}
        </p>
        <p>Fecha: {{ match.fechaPartida }}</p>
      </v-card-text>
    </v-card>

    <ModalResponsePartidaValidada
      :visible="modalVisible"
      @update:visible="modalVisible = $event"
      @modalAccepted="handleModalAccepted"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, defineEmits } from "vue";
import {
  ValidarPartidaDTO,
  ViewPartidaAmistosaDTO,
} from "@/interfaces/Partidas";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "../Commons/ProgressCircular.vue";
import { getNickById } from "@/services/UsuariosService";
import { useRouter } from "vue-router";
import { ValidarPartida } from "@/services/PartidasAmistosasService";
import ModalResponsePartidaValidada from "./ModalResponsePartidaValidada.vue";

const loading = ref(true);
const { getUser } = useAuth();
const error = ref<string | null>(null);
const nickJugadorUno = ref<string>("");
const nickJugadorDos = ref<string>("");
const validarPartidaDTO = ref<ValidarPartidaDTO>();
const router = useRouter();
const modalVisible = ref(false);

const props = defineProps<{
  match: ViewPartidaAmistosaDTO;
}>();

const emit = defineEmits(["partidaValidada"]);

onMounted(async () => {
  try {
    nickJugadorUno.value = await getNickById(props.match.idUsuario1);
    nickJugadorDos.value = await getNickById(props.match.idUsuario2);
  } catch (err) {
    router.push("error");
    error.value = "Error al cargar los datos";
  } finally {
    loading.value = false;
  }
});

const validarPartida = async () => {
  const email: any = await getUser.value;
  if (!email) {
    error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
    router.push("error");
    console.log(error.value);
    loading.value = false;
    return;
  }
  validarPartidaDTO.value = {
    emailJugador: email,
    idPartida: props.match.idPartidaAmistosa,
  };
  // Lógica para validar la partida
  await ValidarPartida(validarPartidaDTO.value);
  modalVisible.value = true;
};

const handleModalAccepted = () => {
  modalVisible.value = false;
  emit("partidaValidada");
};
</script>

<style scoped></style>
