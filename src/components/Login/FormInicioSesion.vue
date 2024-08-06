<template>
  <v-container class="login-form">
    <div class="overlay" v-if="loading"></div>
    <!-- <v-row justify="center">
      <v-col cols="12" md="4">
        <LogoNameAmonSulSVG />
      </v-col>
    </v-row> -->
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h2>Iniciar sesión</h2>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                required
                class="my-4"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                required
                class="my-4"
              ></v-text-field>
              <v-row justify="center" class="my-4 ga-5">
                <v-btn
                  color="blue darken-1"
                  variant="outlined"
                  :disabled="loading"
                  size="large"
                  class="login-form__button"
                  @click="handleLogin"
                >
                  Iniciar sesión
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  variant="text"
                  size="large"
                  to="registro-usuario"
                  :disabled="loading"
                  class="login-form__button"
                >
                  Nuevo usuario
                </v-btn>
              </v-row>
              <v-row justify="center" v-if="loading" class="mt-3">
                <v-progress-linear
                  :size="24"
                  :width="2"
                  indeterminate
                  color="blue darken-1"
                  class="progress-linear-margin"
                ></v-progress-linear>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ErrorLogin
      v-if="dialog"
      :isVisible="dialog"
      @update:isVisible="dialog = $event"
    />
    <ResponseLogin
      v-if="dialogOk"
      :isVisible="dialogOk"
      @update:isVisible="handleOkClick = $event"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { RequestLoginDTO } from "@/interfaces/Login";
import { useAuth } from "@/composables/useAuth";
import ErrorLogin from "./ErrorLogin.vue";
import { AxiosResponse } from "axios";
import ResponseLogin from "./ResponseLogin.vue";
// import LogoNameAmonSulSVG from '@/assets/icons/logo_name.svg';

const email = ref("");
const password = ref("");
const { login } = useAuth();
const router = useRouter();
const dialog = ref(false);
const dialogOk = ref(false);

const loading = ref(false);

const handleLogin = async () => {
  dialog.value = false;
  dialogOk.value = false;
  loading.value = true;

  var credentials: RequestLoginDTO = {
    email: email.value,
    password: password.value,
  };

  try {
    const response: string | AxiosResponse = await login(credentials);
    if (typeof response === "string") {
      router.push({ name: "error" });
    } else {
      if (!response.data.isAccess) {
        dialog.value = true;
      } else {
        dialogOk.value = true;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
const handleOkClick = () => {
  dialogOk.value = false;
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
