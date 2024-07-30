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
              :disabled="isLoading"
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const modalCreacionTorneos = ref<boolean>(false);

const isLoading = ref(false);

const handlerCrearTorneo = () => {
  modalCreacionTorneos.value = true;
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
