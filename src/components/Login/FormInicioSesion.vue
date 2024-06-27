<template>
  <v-container class="login-form">
    <!-- Capa de fondo semi-transparente para bloquear la pantalla -->
    <div class="overlay" v-if="loading"></div>

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
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                required
              ></v-text-field>
              <v-row justify="center">
                <v-btn color="primary" :disabled="loading" @click="handleLogin">
                  Iniciar sesión
                </v-btn>
                <v-btn text @click="goToRegistration" :disabled="loading">
                  Nuevo usuario
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

    <ErrorLogin :isVisible="dialog" @update:isVisible="dialog = $event" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { RequestLoginDTO } from "@/interfaces/Login";
import { useAuth } from "@/composables/useAuth";
import ErrorLogin from "./ErrorLogin.vue";

const email = ref("");
const password = ref("");
const { login } = useAuth();
const router = useRouter();
const dialog = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  dialog.value = false;
  loading.value = true;

  var credentials: RequestLoginDTO = {
    email: email.value,
    password: password.value,
  };

  try {
    const response = await login(credentials);
    if (response === "Network Error") {
      router.push("error");
    } else {
      if (!response.data.isAccess) {
        dialog.value = true;
      } else {
        router.push("inicio");
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const goToRegistration = () => router.push("registro-usuario");
</script>

<style scoped>
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
}

.progress-linear-margin {
  margin-top: 20px;
}
</style>
