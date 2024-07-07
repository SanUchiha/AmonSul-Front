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
                v-model="listadoNicks"
                :items="nickUno"
                label="Jugador 1"
                @click="loadNicks"
                :rules="[rules.required]"
                required
              ></v-combobox>
              <v-combobox
                v-model="listadoNicks"
                :items="nickDos"
                label="Jugador 2"
                @click="loadNicks"
                :rules="[rules.required]"
                required
              ></v-combobox>
              <v-text-field
                v-model="puntosJugadorUno"
                label="Puntos jugador 1"
                type="number"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-text-field
                v-model="puntosJugadordos"
                label="Puntos jugador 2"
                type="number"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-card-text>
                <div class="d-flex pa-4">
                  <v-checkbox-btn
                    v-model="checkEsMatchedPlay"
                    class="pe-2"
                  ></v-checkbox-btn>
                  <v-text-field
                    :disabled="!checkEsMatchedPlay"
                    label="Escenarios"
                    @click="loadEscenarios"
                    hide-details
                  ></v-text-field>
                </div>
              </v-card-text>
              <v-text-field
                v-model="puntosPartida"
                label="Puntos partida"
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
import { AxiosError } from "axios";
import { ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { CreatePartidaAmistosaDTO } from "@/interfaces/Partidas";

const router = useRouter();
const dialogOk = ref(false);
const loading = ref(false);
const listaUsuarios = ref<ViewUsuarioPartidaDTO[]>([]);
const listadoNicks = ref<string[]>([]);
const idJugadorUnoSelected = ref<number>();
const idJugadorDosSelected = ref<number>();

const jugadorUno = ref<string>("");
const jugadorDos = ref<string>("");
const puntosJugadorUno = ref<number | null>(null);
const puntosJugadorDos = ref<number | null>(null);
const checkEsMatchedPlay = ref<boolean>(false);
const escenario = ref<string>("");
const puntosPartida = ref<number | null>(null);

const rules = {
  required: (value: string | null) => !!value || "Este campo es obligatorio.",
};

const loadNicks = async () => {
  loading.value = true;
  try {
    var rawListaUsuarios: ViewUsuarioPartidaDTO[] = getUsuarios();
    listaUsuarios.value = rawListaUsuarios;
    listadoNicks.value = listaUsuarios.value.map((f) => f.nick).sort();
  } catch (error) {
    console.log("Error al obtener los nicks:", error);
  } finally {
    loading.value = false;
  }
};

const errors = reactive({
  jugadorUno: false,
  jugadorDos: false,
  puntosJugadorUno: false,
  puntosJugadorDos: false,
  puntosPartida: false,
});

const validateForm = () => {
  errors.jugadorUno = !jugadorUno.value;
  errors.jugadorDos = !jugadorDos.value;
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

  //Seleccionamos los id de los nicks
  //Jugador 1
  idJugadorUnoSelected.value = listaUsuarios.value;
  // Jugador 2

  //   if (faccionSelected.value.length > 1) {
  //     for (let index = 0; index < listaFacciones.value.length; index++) {
  //       const element = listaFacciones.value[index];
  //       if (faccionSelected.value === element.nombreFaccion) {
  //         idFaccionSelected.value = element.idFaccion;
  //       }
  //     }
  //   }

  const nuevaPartida: CreatePartidaAmistosaDTO = {};
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
