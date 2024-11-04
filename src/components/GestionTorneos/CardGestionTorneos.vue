<template>
  <div class="overlay" v-if="isLoading"></div>
  <v-row justify="center">
    <v-col cols="12" md="6">
      <v-card>
        <v-card-text>
          <v-row justify="center" class="my-4 ga-5">
            <v-btn
              color="blue darken-1"
              variant="outlined"
              size="large"
              class="login-form__button"
              @click="handlerCrearTorneo"
            >
              Crear torneo
            </v-btn>
          </v-row>
          <v-row justify="center" v-if="isLoading" class="mt-3">
            <v-progress-linear
              :size="24"
              :width="2"
              indeterminate
              color="blue darken-1"
              class="progress-linear-margin"
            ></v-progress-linear>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Modal generar siguiente ronda -->
  <ModalCrearTorneo
    :isVisible="showModalCreateTournament"
    :idUsuario="parseInt(idUsuarioLogger!)"
    @close="closeConfigModal"
    @confirm="handleConfigConfirm"
  />

  <!-- Modal success guardar resultados -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Torneo creado correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal error guardar resultados -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se crear el torneo. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import ModalCrearTorneo from "./ModalCrearTorneo.vue";
import { useAuth } from "@/composables/useAuth";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";

const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const showModalCreateTournament = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const isLoading = ref(false);

const handlerCrearTorneo = () => {
  showModalCreateTournament.value = true;
};
const closeConfigModal = () => {
  showModalCreateTournament.value = false;
};

const handleConfigConfirm = () => {
  closeConfigModal();
};

// Watch para detectar cuando se cierra el modal de éxito
watch(
  () => showSuccessModal.value,
  (newValue, oldValue) => {
    if (oldValue && !newValue) {
      recargarPagina();
    }
  }
);

const recargarPagina = () => {
  window.location.reload();
};
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semi-transparente */
  z-index: 9999; /* Z-index alto para estar por encima de todo */
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto; /* Habilita los eventos en la capa */
  visibility: visible; /* Asegura que la capa sea visible */
}

.overlay.hidden {
  display: none; /* Oculta la capa cuando no está activa */
}

.login-form {
  position: relative; /* Asegura que el formulario esté por encima de la capa de fondo */

  @media screen and (max-width: 720px) {
    height: 100%;
  }

  &__button {
    @media screen and (max-width: 720px) {
      width: calc(100% - 24px);
    }
  }
}

.progress-linear-margin {
  margin-top: 20px;
}
</style>
