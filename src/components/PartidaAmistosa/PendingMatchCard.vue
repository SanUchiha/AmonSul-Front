<template>
  <div class="center">
    <v-card class="center-card pa-4">
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
                variant="outlined"
                color="green darken-1"
                @click="validarPartida"
                class="mx-auto"
              >
                <v-icon left>mdi-check</v-icon>

                Validar
              </v-btn>

              <v-btn
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

    <ModalSuccess
      :isVisible="showSuccessModal"
      message="Partida validada con exito."
      @update:isVisible="showSuccessModal = $event"
    />

    <ModalError
      :isVisible="showErrorModal"
      message="No se ha podido validar la partida. Contacta con el administrador."
      @update:isVisible="showErrorModal = $event"
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
import { useRouter } from "vue-router";
import {
  cancelarPartida,
  ValidarPartida,
} from "@/services/PartidasAmistosasService";
import { formatFechaSpa } from "@/utils/Fecha";
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { useUsuariosStore } from "@/store/usuarios";

const usuariosStore = useUsuariosStore();
const isLoading = ref(true);
const { getUser } = useAuth();
const error = ref<string | null>(null);
const nickJugadorUno = ref<string | unknown>("");
const nickJugadorDos = ref<string | unknown>("");
const validarPartidaDTO = ref<ValidarPartidaDTO>();
const router = useRouter();
const fechaFormateada = ref<string>("");
const IsValidadaRival = ref<boolean>(false);
const IsValidadaOwner = ref<boolean>(false);
const emailUsuario = ref<string>(getUser.value ?? "null");
const usuario: ComputedRef<UsuarioViewDTO> = computed(
  () => usuariosStore.usuario
);

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);

const props = defineProps<{
  match: ViewPartidaAmistosaDTO;
}>();

const emit = defineEmits(["partidaValidada"]);

onMounted(async () => {
  try {
    isLoading.value = true;
    if (!usuario.value.idUsuario) {
      await usuariosStore.requestUsuario(emailUsuario.value);
    }
    nickJugadorUno.value = await usuariosStore.requestNickById(
      props.match.idUsuario1
    );
    nickJugadorDos.value = await usuariosStore.requestNickById(
      props.match.idUsuario2
    );
    fechaFormateada.value = await formatFechaSpa(props.match.fechaPartida);
    await controlValidacionesPartidas();
  } catch (err) {
    router.push({ name: "error" });
    error.value = "Error al cargar los datos";
  } finally {
    isLoading.value = false;
  }
});

const validarPartida = async () => {
  validarPartidaDTO.value = {
    emailJugador: emailUsuario.value,
    idPartida: props.match.idPartidaAmistosa,
  };
  await ValidarPartida(validarPartidaDTO.value);
  showSuccessModal.value = true;
};

const goToDetallePartida = () => {
  router.push({
    name: "detalle-partida",
    params: { idPartida: props.match.idPartidaAmistosa },
  });
};

const cancelPartida = async () => {
  try {
    await cancelarPartida(props.match.idPartidaAmistosa);
    showSuccessModal.value = true;
    emit("partidaValidada");
  } catch (err) {
    showErrorModal.value = true;
    router.push({ name: "error" });
    error.value = "Error al cancelar la partida";
  } finally {
    isLoading.value = false;
  }
};

watch(showSuccessModal, (newValue) => {
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
