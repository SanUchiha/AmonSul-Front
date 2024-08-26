<template>
  <div class="center">
    <v-card class="center-card pa-4" v-if="!isLoading">
      <v-card-title class="d-flex align-center justify-center">
        {{ nickJugadorUno }} vs {{ nickJugadorDos }}
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="my-4">
        <v-row>
          <v-col class="text-center">
            <div>
              <p>
                <v-icon class="mr-2">mdi-trophy</v-icon>
                Resultado: {{ match.resultadoUsuario1 }} -
                {{ match.resultadoUsuario2 }}
              </p>
              <p>
                <v-icon class="mr-2">mdi-calendar</v-icon>
                Fecha: {{ fechaFormateada }}
              </p>
            </div>

            <v-divider vertical class="mx-2"></v-divider>

            <div>
              <v-btn
                variant="outlined"
                color="blue darken-1"
                @click="goToDetallePartida"
                class="mx-auto"
              >
                <v-icon left>mdi-magnify</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="d-flex align-center justify-center mt-4">
        <v-row>
          <v-col class="text-center">
            <div v-if="!IsValidadaOwner">
              <v-btn
                :disabled="isLoading"
                variant="outlined"
                color="green darken-1"
                @click="validarPartida"
                class="mx-auto"
              >
                <v-icon left>mdi-check</v-icon>
                Validar
              </v-btn>

              <v-btn
                :disabled="isLoading"
                variant="outlined"
                color="red darken-1"
                @click="cancelPartida"
                class="mx-auto mt-2"
              >
                <v-icon left>mdi-close</v-icon>
                Cancelar
              </v-btn>
            </div>
            <div v-else class="validada">Validada</div>
          </v-col>
          <v-col class="text-center">
            <div v-if="!IsValidadaRival">
              <span class="no-validada">NO validada por el rival</span>
            </div>
            <div v-else class="validada">Validada por el rival</div>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <v-progress-circular
      v-else
      indeterminate
      color="blue darken-1"
    ></v-progress-circular>

    <ModalSuccess
      :isVisible="showSuccessValidarModal"
      message="Partida validada con exito."
      @update:isVisible="showSuccessValidarModal = $event"
    />

    <ModalError
      :isVisible="showErrorValidarModal"
      message="No se ha podido validar la partida. Contacta con el administrador."
      @update:isVisible="showErrorValidarModal = $event"
    />

    <ModalSuccess
      :isVisible="showSuccessCancelarModal"
      message="Partida cancelada con exito."
      @update:isVisible="showSuccessCancelarModal = $event"
    />

    <ModalError
      :isVisible="showErrorCancelarModal"
      message="No se ha podido cancelar la partida. Contacta con el administrador."
      @update:isVisible="showErrorCancelarModal = $event"
    />

    <ModalDetallePartida
      v-if="showModalDetallePartida"
      :partida="match"
      @close="closeModalDetallePartida"
    />
  </div>
</template>

<script setup lang="ts">
import {
  defineProps,
  ref,
  onMounted,
  defineEmits,
  watch,
  computed,
  ComputedRef,
} from "vue";
import {
  ValidarPartidaDTO,
  ViewPartidaAmistosaDTO,
} from "@/interfaces/Partidas";
import { useAuth } from "@/composables/useAuth";
import {
  cancelarPartida,
  ValidarPartida,
} from "@/services/PartidasAmistosasService";
import { formatFechaSpa } from "@/utils/Fecha";
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { useUsuariosStore } from "@/store/usuarios";
import ModalDetallePartida from "./ModalDetallePartida.vue";

const usuariosStore = useUsuariosStore();
const isLoading = ref(true);
const { getUser } = useAuth();
const nickJugadorUno = ref<string | unknown>("");
const nickJugadorDos = ref<string | unknown>("");
const validarPartidaDTO = ref<ValidarPartidaDTO>();
const fechaFormateada = ref<string>("");
const IsValidadaRival = ref<boolean>(false);
const IsValidadaOwner = ref<boolean>(false);
const emailUsuario = ref<string>(getUser.value ?? "null");
const usuario: ComputedRef<UsuarioViewDTO> = computed(
  () => usuariosStore.usuario
);

const showSuccessValidarModal = ref<boolean>(false);
const showErrorValidarModal = ref<boolean>(false);

const showSuccessCancelarModal = ref<boolean>(false);
const showErrorCancelarModal = ref<boolean>(false);

const showModalDetallePartida = ref<boolean>(false);

const props = defineProps<{
  match: ViewPartidaAmistosaDTO;
}>();
const emit = defineEmits(["partidaValidada"]);

onMounted(async () => {
  isLoading.value = true;

  try {
    if (!usuario.value.idUsuario) {
      await usuariosStore.requestUsuario(emailUsuario.value);
    }
    const [nick1, nick2, fecha] = await Promise.all([
      usuariosStore.requestNickById(props.match.idUsuario1),
      usuariosStore.requestNickById(props.match.idUsuario2),
      formatFechaSpa(props.match.fechaPartida),
    ]);

    nickJugadorUno.value = nick1;
    nickJugadorDos.value = nick2;
    fechaFormateada.value = fecha;

    controlValidacionesPartidas();
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

const validarPartida = async () => {
  isLoading.value = true;
  validarPartidaDTO.value = {
    emailJugador: emailUsuario.value,
    idPartida: props.match.idPartidaAmistosa,
  };
  try {
    await ValidarPartida(validarPartidaDTO.value);
    showSuccessValidarModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorValidarModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const goToDetallePartida = () => {
  showModalDetallePartida.value = true;
};

const closeModalDetallePartida = () => {
  showModalDetallePartida.value = false;
};

const cancelPartida = async () => {
  try {
    isLoading.value = true;
    await cancelarPartida(props.match.idPartidaAmistosa);
    showSuccessCancelarModal.value = true;
    emit("partidaValidada");
  } catch (err) {
    showErrorCancelarModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

watch(showSuccessValidarModal, (newValue) => {
  if (!newValue) {
    emit("partidaValidada");
  }
});

const controlValidacionesPartidas = () => {
  if (
    usuario.value?.idUsuario == props.match.idUsuario1 &&
    props.match.partidaValidadaUsuario1
  ) {
    IsValidadaOwner.value = true;
  }

  if (
    usuario.value?.idUsuario == props.match.idUsuario2 &&
    props.match.partidaValidadaUsuario2
  ) {
    IsValidadaOwner.value = true;
  }

  if (
    usuario.value?.idUsuario != props.match.idUsuario1 &&
    props.match.partidaValidadaUsuario1
  ) {
    IsValidadaRival.value = true;
  }

  if (
    usuario.value?.idUsuario != props.match.idUsuario2 &&
    props.match.partidaValidadaUsuario2
  ) {
    IsValidadaRival.value = true;
  }
};
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-card {
  width: 100%;
  max-width: 600px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.no-validada {
  color: rgb(233, 69, 69);
}
.validada {
  color: rgb(25, 145, 61);
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.pa-4 {
  padding: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.v-icon {
  vertical-align: middle;
}
</style>
async
