<template>
  <v-container class="login-form">
    <div class="overlay" v-if="isLoading"></div>

    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card
          class="pa-4 rounded-lg elevation-3 dark-form-card scrollable-modal"
        >
          <v-card-title class="text-h6 font-weight-bold text-center text-white">
            <v-icon class="me-2" color="deep-orange">mdi-sword-cross</v-icon>
            Registrar partida
          </v-card-title>

          <v-divider class="mt-3"></v-divider>

          <v-card-text>
            <v-form @submit.prevent="validateForm" ref="form">
              <!-- CONTRINCANTE -->
              <v-combobox
                v-model="nickDosSelected"
                :items="listadoNicks"
                label="¿Contra quién has jugado?"
                @click="loadNicks"
                :rules="[rules.required]"
                required
                variant="tonal"
                color="primary"
                hide-details="auto"
              />
              <v-progress-linear
                v-if="isLoadingNicks"
                indeterminate
                color="primary"
                class="progress-linear-margin"
              />
              <v-divider class="my-4" />

              <!-- EJÉRCITOS -->
              <v-combobox
                v-model="ejercitoRival"
                :items="listadoEjercitos"
                label="¿Qué llevaba tu rival?"
                item-title="name"
                @click="loadEjercitos"
                :rules="[rules.required]"
                required
                variant="tonal"
                color="primary"
                hide-details="auto"
              />
              <v-combobox
                v-model="ejercitoPropio"
                :items="listadoEjercitos"
                item-title="name"
                label="¿Qué llevabas tú?"
                @click="loadEjercitos"
                :rules="[rules.required]"
                required
                variant="tonal"
                color="primary"
                hide-details="auto"
              />
              <v-progress-linear
                v-if="loadingEjercitos"
                indeterminate
                color="primary"
                class="progress-linear-margin"
              />
              <v-divider class="my-4" />

              <!-- PUNTOS -->
              <v-text-field
                v-model="puntosJugadorUno"
                label="Tus puntos"
                type="number"
                :rules="[rules.required]"
                required
                variant="tonal"
                color="primary"
                hide-details="auto"
              />
              <v-text-field
                v-model="puntosJugadorDos"
                label="Puntos del rival"
                type="number"
                :rules="[rules.required]"
                required
                variant="tonal"
                color="primary"
                hide-details="auto"
              />
              <v-divider class="my-4" />

              <!-- ESCENARIO -->
              <v-switch
                v-model="checkEsMatchedPlay"
                color="primary"
                inset
                label="¿Escenario del Matched Play?"
              />
              <v-combobox
                v-if="checkEsMatchedPlay"
                v-model="escenarioSelected"
                :items="listaEscenarios"
                @click="loadEscenarios"
                label="Escenario"
                variant="tonal"
                color="primary"
                hide-details="auto"
              />
              <v-progress-linear
                v-if="loadingEscenarios"
                indeterminate
                color="primary"
                class="progress-linear-margin"
              />
              <v-divider class="my-4" />

              <!-- PUNTOS PARTIDA -->
              <v-text-field
                v-model="puntosPartida"
                label="¿A cuántos puntos has jugado?"
                type="number"
                :rules="[rules.required]"
                required
                variant="tonal"
                color="primary"
                hide-details="auto"
              />

              <v-row justify="center" v-if="isLoading" class="mt-3">
                <v-progress-linear
                  :size="24"
                  :width="2"
                  indeterminate
                  color="primary"
                  class="progress-linear-margin"
                />
              </v-row>

              <!-- BOTONES -->
              <v-row justify="center" class="mt-6">
                <v-col cols="12" sm="6">
                  <v-btn
                    class="mx-2"
                    color="deep-orange"
                    variant="flat"
                    @click="validateForm"
                    block
                  >
                    <v-icon start>mdi-check</v-icon>
                    Registrar
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    class="mx-2"
                    color="grey darken-1"
                    variant="tonal"
                    :disabled="isLoading"
                    @click="$emit('close')"
                    block
                  >
                    <v-icon start>mdi-close</v-icon>
                    Cancelar
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- MODALES DE RESULTADO -->
    <ModalSuccess
      :isVisible="showSuccessModal"
      message="Partida creada con éxito."
      @update:isVisible="showSuccessModal = $event"
    />
    <ModalError
      :isVisible="showErrorModal"
      message="No se ha podido crear la partida."
      @update:isVisible="showErrorModal = $event"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, ComputedRef, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { registrarPartida } from "@/services/PartidasAmistosasService";
import { UsuarioNickDTO, ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { CreatePartidaAmistosaDTO } from "@/interfaces/Partidas";
import { useAuth } from "@/composables/useAuth";
import { appsettings } from "@/settings/appsettings";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { useUsuariosStore } from "@/store/usuarios";
import { ArmyDTO } from "@/interfaces/Army";

const usuariosStore = useUsuariosStore();

const router = useRouter();
const { getUser, getidUsuario } = useAuth();
const isLoading = ref(false);
const isLoadingNicks = ref(false);
const loadingEjercitos = ref(false);
const loadingEscenarios = ref(false);
const listaUsuarios = ref<UsuarioNickDTO[]>([]);
const listadoNicks = ref<string[]>([]);
const listadoEjercitos = ref<ArmyDTO[]>([]);
const listaEscenarios = ref<string[]>([]);
const nickDosSelected = ref<string>("");
const escenarioSelected = ref<string>("");
const ejercitoPropio = ref<ArmyDTO>();
const ejercitoRival = ref<ArmyDTO>();
const puntosJugadorUno = ref<number | null>(null);
const puntosJugadorDos = ref<number | null>(null);
const checkEsMatchedPlay = ref<boolean>(false);
const esTorneo = ref<boolean>(false);
const puntosPartida = ref<number | null>(null);
const emailOwner = ref<string>(getUser.value!);
const idUsuario = ref<string>(getidUsuario.value!);

const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const rawListaUsuarios: ComputedRef<ViewUsuarioPartidaDTO[]> = computed(
  () => usuariosStore.usuarios
);

const emit = defineEmits(["close", "registroExitoso"]); // Se emiten eventos

const rules = {
  required: (value: string | null) => !!value || "Este campo es obligatorio.",
};

const loadNicks = async () => {
  //isLoadingNick.value = true;
  isLoadingNicks.value = true;

  try {
    if (!rawListaUsuarios.value.length) {
      await usuariosStore.requestUsuarios();
    }
    listaUsuarios.value = [...rawListaUsuarios.value];
    listaUsuarios.value = listaUsuarios.value.filter(
      (u) => u.email != emailOwner.value
    );
    listadoNicks.value = listaUsuarios.value.map((f) => f.nick).sort();
  } catch (error) {
    console.error("Error al obtener los nicks:", error);
  } finally {
    isLoading.value = false;
    isLoadingNicks.value = false;
  }
};

const loadEjercitos = async () => {
  isLoading.value = true;
  loadingEjercitos.value = true;

  listadoEjercitos.value = appsettings.armies;

  isLoading.value = false;
  loadingEjercitos.value = false;
};

const loadEscenarios = async () => {
  isLoading.value = true;
  loadingEscenarios.value = true;

  listaEscenarios.value = appsettings.escenarios;

  isLoading.value = false;
  loadingEscenarios.value = false;
};

const errors = reactive({
  nickDosSelected: false,
  puntosJugadorUno: false,
  puntosJugadorDos: false,
  puntosPartida: false,
});

const validateForm = () => {
  errors.nickDosSelected =
    !nickDosSelected.value ||
    !listadoNicks.value.includes(nickDosSelected.value);
  errors.puntosJugadorUno = puntosJugadorUno.value === null;
  errors.puntosJugadorDos = puntosJugadorDos.value === null;
  errors.puntosPartida = puntosPartida.value === null;

  const formIsValid = Object.values(errors).every((error) => !error);

  if (formIsValid) {
    handlerNuevaPartida();
  } else {
    alert("Por favor, completa todos los campos requeridos correctamente.");
  }
};

const handlerNuevaPartida = async () => {
  isLoading.value = true;

  if (listaUsuarios.value != null) {
    const rival: UsuarioNickDTO | undefined = listaUsuarios.value.find(
      (u) => u.nick == nickDosSelected.value
    );

    if (!rival)
      throw new Error(`Rival with nick ${nickDosSelected.value} not found`);
    if (!parseInt(idUsuario.value)) throw new Error(`Usuario not found`);

    const nuevaPartida: CreatePartidaAmistosaDTO = {
      IdUsuario1: parseInt(idUsuario.value),
      IdUsuario2: rival.idUsuario,
      resultadoUsuario1: puntosJugadorUno.value ?? 0,
      resultadoUsuario2: puntosJugadorDos.value ?? 0,
      puntosPartida: puntosPartida.value ?? 0,
      esMatchedPlayPartida: checkEsMatchedPlay.value ?? false,
      escenarioPartida: escenarioSelected.value,
      esTorneo: esTorneo.value ?? false,
      ejercitoUsuario1: ejercitoPropio.value!,
      ejercitoUsuario2: ejercitoRival.value!,
      esElo: false,
      partidaValidadaUsuario1: true,
    };

    try {
      await registrarPartida(nuevaPartida);
      showSuccessModal.value = true;
    } catch (error: unknown) {
      showErrorModal.value = true;
    } finally {
      isLoading.value = false;
    }
  }
};

watch(
  [showSuccessModal, showErrorModal],
  ([newShowSuccessModal, newShowErrorModal]) => {
    if (!newShowSuccessModal && !newShowErrorModal) {
      emit("registroExitoso"); // Emitimos evento para refrescar datos en MisPartidas
      emit("close"); // Cerramos el modal
    }
  }
);
</script>

<style scoped>
.scrollable-modal {
  max-height: 90vh;
  overflow-y: auto;
  padding-bottom: 24px;
}

.dark-form-card {
  background-color: #1e1e1e;
  color: white;
  border: 1px solid #2c2c2c;
}

.v-label,
.v-input__control {
  color: white !important;
}

.v-icon {
  vertical-align: middle;
}

.v-divider {
  opacity: 0.1;
}
</style>
