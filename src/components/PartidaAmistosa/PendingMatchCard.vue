<template>
  <div class="center">
    <v-card v-if="!isLoading" :class="['match-card']">
      <v-divider></v-divider>

      <v-card-title class="text-center">
        <v-row align="center" justify="center" class="match-score" no-gutters>
          <v-col
            @click="verProfileUser(match.idUsuario1)"
            cols="5"
            class="player-name text-center"
          >
            <span class="player-nick">
              {{ match.nickUsuario1 }}
            </span>
            <v-card-subtitle class="text-wrap">{{
              match.ejercitoUsuario1
            }}</v-card-subtitle>
          </v-col>

          <v-col cols="2" class="score text-center marcador">
            <p>vs</p>
            <p>{{ match.resultadoUsuario1 }}-{{ match.resultadoUsuario2 }}</p>
          </v-col>

          <v-col
            @click="verProfileUser(match.idUsuario2)"
            cols="5"
            class="player-name text-right"
          >
            <span class="player-nick"> {{ match.nickUsuario2 }} </span><br />
            <v-card-subtitle class="text-wrap">{{
              match.ejercitoUsuario2
            }}</v-card-subtitle>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- Información de la partida -->
      <v-card-text>
        <v-row align="center">
          <v-col cols="6" class="text-center">
            {{ match.puntosPartida }} pts
          </v-col>

          <v-col cols="6" class="player-nick">
            {{ fechaPartidaFormateada }}
          </v-col>
        </v-row>

        <v-row class="mt-3 match-scenario">
          <v-col cols="12" class="text-center">
            <strong>{{
              match.escenarioPartida || "Escenario no disponible"
            }}</strong>
          </v-col>

          <!--TODO Implementar detalles, de momento no hay nada que mostrar
                  <v-col cols="6" class="text-center">
                    <v-btn small color="blue lighten-2" @click.stop="goToDetallePartida()">
                      Ver Detalles
                    </v-btn>
                  </v-col>-->
        </v-row>
      </v-card-text>

      <v-card-actions style="font-family: 'Roboto', sans-serif">
        <v-row>
          <v-col cols="12" sm="6" class="text-center">
            <div v-if="!IsValidadaOwner">
              <v-btn color="success" @click="validarPartida" variant="tonal">
                <v-icon left>mdi-check</v-icon>
                Validar Resultado
              </v-btn>
            </div>
            <div v-else>
              <span class="no-validada partida-en-juego"
                >Esperando la validación del rival</span
              >
            </div>
          </v-col>
          <v-col cols="12" sm="6" class="text-center">
            <v-btn
              :disabled="isLoading"
              variant="tonal"
              color="red darken-1"
              @click="cancelPartida"
              block
            >
              <v-icon left>mdi-close</v-icon>
              Cancelar
            </v-btn>
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
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, defineEmits, watch } from "vue";
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
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { useRouter } from "vue-router";

const isLoading = ref(false);
const { getUser, getidUsuario } = useAuth();
const validarPartidaDTO = ref<ValidarPartidaDTO>();
const IsValidadaRival = ref<boolean>(false);
const IsValidadaOwner = ref<boolean>(false);
const emailUsuario = ref<string>(getUser.value ?? "null");
const idUsuarioOwner = ref<string>(getidUsuario.value ?? "null");
const router = useRouter();

const showSuccessValidarModal = ref<boolean>(false);
const showErrorValidarModal = ref<boolean>(false);

const showSuccessCancelarModal = ref<boolean>(false);
const showErrorCancelarModal = ref<boolean>(false);

const fechaPartidaFormateada = ref<string>("");

const props = defineProps<{
  match: ViewPartidaAmistosaDTO;
}>();
const emit = defineEmits(["close", "registroExitoso"]);

onMounted(async () => {
  isLoading.value = true;

  try {
    fechaPartidaFormateada.value = await formatFechaSpa(
      props.match.fechaPartida
    );

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

const verProfileUser = (idUser: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUser } });
};

const cancelPartida = async () => {
  try {
    isLoading.value = true;
    await cancelarPartida(props.match.idPartidaAmistosa);
    showSuccessCancelarModal.value = true;
  } catch (err) {
    showErrorCancelarModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

watch([showSuccessValidarModal], ([newshowSuccessValidarModal]) => {
  if (!newshowSuccessValidarModal) {
    emit("registroExitoso");
  }
});
watch([showSuccessCancelarModal], ([newshowSuccessCancelarModal]) => {
  if (!newshowSuccessCancelarModal) {
    emit("registroExitoso");
  }
});

const controlValidacionesPartidas = () => {
  if (
    parseInt(idUsuarioOwner.value) == props.match.idUsuario1 &&
    props.match.partidaValidadaUsuario1
  ) {
    IsValidadaOwner.value = true;
  }

  if (
    parseInt(idUsuarioOwner.value) == props.match.idUsuario2 &&
    props.match.partidaValidadaUsuario2
  ) {
    IsValidadaOwner.value = true;
  }
  if (
    parseInt(idUsuarioOwner.value) != props.match.idUsuario1 &&
    props.match.partidaValidadaUsuario1
  ) {
    IsValidadaRival.value = true;
  }

  if (
    parseInt(idUsuarioOwner.value) != props.match.idUsuario2 &&
    props.match.partidaValidadaUsuario2
  ) {
    IsValidadaRival.value = true;
  }
};
</script>

<style scoped>
.no-validada {
  color: rgb(233, 69, 69);
}

.player-nick {
  white-space: nowrap;
  font-size: 1rem;
}

@media (max-width: 600px) {
  .player-nick {
    font-size: 0.85rem;
  }
}
</style>
