<template>
  <v-container class="login-form">
    <div class="overlay" v-if="loading"></div>

    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h3>Registrar partida</h3>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="validateForm" ref="form">
              <v-combobox
                v-model="nickDosSelected"
                :items="listadoNicks"
                label="¿Contra quien has jugado?"
                @click="loadNicks"
                :rules="[rules.required]"
                required
              ></v-combobox>
              <v-progress-linear
                v-if="loadingNicks"
                indeterminate
                color="primary"
                class="progress-linear-margin"
              ></v-progress-linear>

              <v-combobox
                v-model="ejercitoRival"
                :items="listadoEjercitos"
                label="¿Que llevaba tu rival?"
                @click="loadEjercitos"
                :rules="[rules.required]"
                required
              ></v-combobox>
              <v-progress-linear
                v-if="loadingEjercitos"
                indeterminate
                color="primary"
                class="progress-linear-margin"
              ></v-progress-linear>

              <v-combobox
                v-model="ejercitoPropio"
                :items="listadoEjercitos"
                label="¿Que llevaba tú?"
                @click="loadEjercitos"
                :rules="[rules.required]"
                required
              ></v-combobox>
              <v-progress-linear
                v-if="loadingEjercitos"
                indeterminate
                color="primary"
                class="progress-linear-margin"
              ></v-progress-linear>
              <v-text-field
                v-model="puntosJugadorUno"
                label="¿Cuantos puntos has conseguido?"
                type="number"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-text-field
                v-model="puntosJugadorDos"
                label="¿Cuantos puntos ha conseguido el rival?"
                type="number"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-switch
                v-model="checkEsMatchedPlay"
                color="primary"
                label="¿El escenario es del Matched play??"
              ></v-switch>

              <v-combobox
                v-if="checkEsMatchedPlay"
                v-model="escenarioSelected"
                :items="listaEscenarios"
                @click="loadEscenarios"
                label="Escenario"
              ></v-combobox>
              <v-progress-linear
                v-if="loadingEscenarios"
                indeterminate
                color="primary"
                class="progress-linear-margin"
              ></v-progress-linear>
              <v-switch
                v-model="esElo"
                color="primary"
                label="¿Quieres que cuente para el ELO?"
              ></v-switch>
              <v-text-field
                v-model="puntosPartida"
                label="¿Ha cuantos puntos has jugado?"
                type="number"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-row justify="center" class="my-4">
                <v-btn
                  variant="outlined"
                  color="blue darken-1"
                  @click="validateForm"
                  class="mr-4"
                >
                  Registrar
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="blue darken-1"
                  to="dashboard"
                  :disabled="loading"
                  class="mr-4"
                >
                  Volver
                </v-btn>
              </v-row>
              <v-row justify="center" v-if="loading" class="mt-3">
                <v-progress-linear
                  :size="24"
                  :width="2"
                  indeterminate
                  color="primary"
                  class="progress-linear-margin"
                ></v-progress-linear>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ResponseNuevaPartida
      :isVisible="dialogOk"
      @update:isVisible="handleOkClick = $event"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { getUsuarios } from "@/services/UsuariosService";
import { registrarPartida } from "@/services/PartidasAmistosasService";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { CreatePartidaAmistosaDTO } from "@/interfaces/Partidas";
import { useAuth } from "@/composables/useAuth";
import { appsettings } from "@/settings/appsettings";
import ResponseNuevaPartida from "./ResponseNuevaPartida.vue";

const router = useRouter();
const { getUser } = useAuth();
const dialogOk = ref(false);
const loading = ref(false);
const loadingNicks = ref(false);
const loadingEjercitos = ref(false);
const loadingEscenarios = ref(false);
const listaUsuarios = ref<ViewUsuarioPartidaDTO[]>([]);
const listadoNicks = ref<string[]>([]);
const listadoEjercitos = ref<string[]>([]);
const listaEscenarios = ref<string[]>([]);
const nickDosSelected = ref<string>("");
const escenarioSelected = ref<string>("");
const ejercitoPropio = ref<string>("");
const ejercitoRival = ref<string>("");
const puntosJugadorUno = ref<number | null>(null);
const puntosJugadorDos = ref<number | null>(null);
const checkEsMatchedPlay = ref<boolean>(false);
const esTorneo = ref<boolean>(false);
const esElo = ref<boolean>(false);
const puntosPartida = ref<number | null>(null);
const emailOwner = ref<string>(await getUser.value!);
const rawListaUsuarios = ref<ViewUsuarioPartidaDTO[]>([]);

const rules = {
  required: (value: string | null) => !!value || "Este campo es obligatorio.",
};

const loadNicks = async () => {
  loading.value = true;
  loadingNicks.value = true;

  try {
    rawListaUsuarios.value = await getUsuarios();
    listaUsuarios.value = rawListaUsuarios.value;
    listaUsuarios.value = listaUsuarios.value.filter(
      (u) => u.email != emailOwner.value
    );
    listadoNicks.value = listaUsuarios.value.map((f) => f.nick).sort();
  } catch (error) {
    console.log("Error al obtener los nicks:", error);
  } finally {
    loading.value = false;
    loadingNicks.value = false;
  }
};

const loadEjercitos = async () => {
  loading.value = true;
  loadingEjercitos.value = true;

  listadoEjercitos.value = await appsettings.ejercitos;

  loading.value = false;
  loadingEjercitos.value = false;
};

const loadEscenarios = async () => {
  loading.value = true;
  loadingEscenarios.value = true;

  listaEscenarios.value = await appsettings.escenarios;

  loading.value = false;
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
  dialogOk.value = false;
  loading.value = true;

  const usuarioCreador: ViewUsuarioPartidaDTO | undefined =
    await rawListaUsuarios.value.find((u) => u.email == emailOwner.value);

  const rival: ViewUsuarioPartidaDTO | undefined =
    await listaUsuarios.value.find((u) => u.nick == nickDosSelected.value);

  const nuevaPartida: CreatePartidaAmistosaDTO = {
    IdUsuario1: usuarioCreador!.idUsuario,
    IdUsuario2: rival!.idUsuario,
    resultadoUsuario1: puntosJugadorUno.value ?? 0,
    resultadoUsuario2: puntosJugadorDos.value ?? 0,
    puntosPartida: puntosPartida.value ?? 0,
    esMatchedPlayPartida: checkEsMatchedPlay.value ?? false,
    escenarioPartida: escenarioSelected.value,
    esTorneo: esTorneo.value ?? false,
    ejercitoUsuario1: ejercitoPropio.value,
    ejercitoUsuario2: ejercitoRival.value,
    esElo: esElo.value ?? false,
  };

  try {
    await registrarPartida(nuevaPartida);
    dialogOk.value = true;
  } catch (error: any) {
    router.push("error");
  } finally {
    loading.value = false;
  }
};

const handleOkClick = () => {
  dialogOk.value = false;
  router.push("dashboard");
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  visibility: visible;
}

.overlay.hidden {
  display: none;
}

.login-form {
  position: relative;
}

.progress-linear-margin {
  margin-top: 20px;
}
</style>
