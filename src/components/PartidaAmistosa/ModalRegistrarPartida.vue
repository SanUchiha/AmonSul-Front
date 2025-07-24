<template>
  <v-dialog v-model="show" max-width="600">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Registrar Partida</span>
        <v-btn icon="mdi-close" variant="text" @click="close"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row dense>
            <!-- Rival -->
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="formData.rival"
                :items="listadoNicks"
                label="Rival"
                :rules="[rules.required]"
                :loading="loadingNicks"
                @click="loadNicks"
                clearable
              ></v-autocomplete>
              <v-progress-linear
                v-if="loadingNicks"
                indeterminate
                color="primary"
                height="2"
                class="mt-1"
              />
            </v-col>

            <!-- Mi ejército -->
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="formData.miEjercito"
                :items="listadoEjercitos"
                item-title="name"
                label="Mi ejercito"
                :rules="[rules.required]"
                :loading="loadingEjercitos"
                @click="loadEjercitos"
                clearable
              ></v-autocomplete>
              <v-progress-linear
                v-if="loadingEjercitos"
                indeterminate
                color="primary"
                height="2"
                class="mt-1"
              />
            </v-col>

            <!-- Ejército rival -->
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="formData.ejercitoRival"
                :items="listadoEjercitos"
                item-title="name"
                label="Ejército rival"
                :rules="[rules.required]"
                :loading="loadingEjercitos"
                @click="loadEjercitos"
                clearable
              ></v-autocomplete>
              <v-progress-linear
                v-if="loadingEjercitos"
                indeterminate
                color="primary"
                height="2"
                class="mt-1"
              />
            </v-col>

            <!-- Mi resultado -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.miResultado"
                label="Mi resultado"
                type="number"
                :rules="[rules.number]"
              ></v-text-field>
            </v-col>

            <!-- Resultado rival -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.resultadoRival"
                label="Resultado rival"
                type="number"
                :rules="[rules.number]"
              ></v-text-field>
            </v-col>

            <!-- Puntos de los ejércitos -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.puntosEjercito"
                label="Puntos de los ejércitos"
                type="number"
                :rules="[rules.number]"
              ></v-text-field>
            </v-col>

            <!-- Escenario -->
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="formData.escenario"
                :items="listaEscenarios"
                label="Escenario"
                :loading="loadingEscenarios"
                @click="loadEscenarios"
                clearable
              ></v-autocomplete>
              <v-progress-linear
                v-if="loadingEscenarios"
                indeterminate
                color="primary"
                height="2"
                class="mt-1"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Botones -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="secondary" @click="close">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          @click="registrar"
          :loading="loading"
          :disabled="loading"
        >
          Registrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
</template>

<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";
import { ArmyDTO } from "@/interfaces/Army";
import { CreatePartidaAmistosaDTO } from "@/interfaces/Partidas";
import { UsuarioNickDTO, ViewUsuarioPartidaDTO } from "@/interfaces/Usuario";
import { registrarPartida } from "@/services/PartidasAmistosasService";
import { appsettings } from "@/settings/appsettings";
import { useUsuariosStore } from "@/store/usuarios";
import { ref, defineEmits, computed, ComputedRef, watch } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";

const show = ref<boolean>(true);
const valid = ref<boolean>(false);
const form = ref();

const usuariosStore = useUsuariosStore();
const { getUser, getidUsuario } = useAuth();
const loading = ref(false);
const loadingNicks = ref(false);
const loadingEjercitos = ref(false);
const loadingEscenarios = ref(false);
const listaUsuarios = ref<UsuarioNickDTO[]>([]);
const listadoNicks = ref<string[]>([]);
const listadoEjercitos = ref<ArmyDTO[]>([]);
const listaEscenarios = ref<string[]>([]);
const ejercitoPropio = ref<ArmyDTO>();
const ejercitoRival = ref<ArmyDTO>();
const emailOwner = ref<string>(getUser.value!);
const idUsuario = ref<string>(getidUsuario.value!);

const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const rawListaUsuarios: ComputedRef<ViewUsuarioPartidaDTO[]> = computed(
  () => usuariosStore.usuarios
);

const emit = defineEmits(["close", "registroExitoso"]);

const formData = ref({
  rival: "",
  miEjercito: ejercitoPropio.value,
  ejercitoRival: ejercitoRival.value,
  miResultado: null as number | null,
  resultadoRival: null as number | null,
  puntosEjercito: null as number | null,
  escenario: "",
});

const rules = {
  required: (value: any) => !!value || "Campo obligatorio",
  number: (v: any) =>
    (v !== null && v !== "" && !isNaN(v)) || "Debe ser un número válido.",
};

const close = () => {
  show.value = false;
  emit("close");
};

const registrar = async () => {
  if (form.value?.validate()) {
    loading.value = true;

    const rival = listaUsuarios.value.find(
      (u) => u.nick == formData.value.rival
    );
    if (!rival)
      throw new Error(`Rival con nick ${formData.value.rival} no encontrado`);
    if (!parseInt(idUsuario.value)) throw new Error(`Usuario no encontrado`);
    console.log("Datos registrados:", formData.value);

    const request: CreatePartidaAmistosaDTO = {
      IdUsuario1: parseInt(idUsuario.value),
      IdUsuario2: rival.idUsuario,
      resultadoUsuario1: formData.value.miResultado!,
      resultadoUsuario2: formData.value.resultadoRival!,
      puntosPartida: formData.value.puntosEjercito!,
      esMatchedPlayPartida: false,
      escenarioPartida: formData.value.escenario,
      esTorneo: false,
      ejercitoUsuario1: formData.value.miEjercito!,
      ejercitoUsuario2: formData.value.ejercitoRival!,
      esElo: false,
      partidaValidadaUsuario1: true,
    };

    try {
      await registrarPartida(request);
      showSuccessModal.value = true;
      emit("registroExitoso");
    } catch {
      showErrorModal.value = true;
    } finally {
      loading.value = false;
    }
  }
};

watch(showSuccessModal, (newVal) => {
  if (!newVal) {
    close();
  }
});

const loadNicks = async () => {
  loadingNicks.value = true;
  try {
    if (!rawListaUsuarios.value.length) await usuariosStore.requestUsuarios();
    listaUsuarios.value = [...rawListaUsuarios.value].filter(
      (u) => u.email != emailOwner.value
    );
    listadoNicks.value = listaUsuarios.value.map((f) => f.nick).sort();
  } catch (error) {
    console.error("Error al obtener los nicks:", error);
  } finally {
    loadingNicks.value = false;
  }
};

const loadEjercitos = async () => {
  loadingEjercitos.value = true;
  listadoEjercitos.value = appsettings.armies;
  loadingEjercitos.value = false;
};

const loadEscenarios = async () => {
  loadingEscenarios.value = true;
  listaEscenarios.value = appsettings.escenarios;
  loadingEscenarios.value = false;
};
</script>
