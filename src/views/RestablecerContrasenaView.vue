<template>
  <v-container class="restablecer">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h2>Nueva contraseña</h2>
          </v-card-title>

          <v-card-text v-if="cambiada">
            <p class="mb-4">Ya tienes tu contraseña nueva. Entra con ella.</p>
            <v-btn
              color="blue darken-1"
              variant="tonal"
              size="large"
              block
              :to="{ name: 'inicio-sesion' }"
            >
              Iniciar sesión
            </v-btn>
          </v-card-text>

          <v-card-text v-else-if="!token">
            <p class="mb-4">
              Este enlace no vale. Pide otro desde «¿Desea recordar la
              contraseña?» en la pantalla de inicio de sesión.
            </p>
            <v-btn
              color="blue darken-1"
              variant="tonal"
              size="large"
              block
              :to="{ name: 'inicio-sesion' }"
            >
              Ir a iniciar sesión
            </v-btn>
          </v-card-text>

          <v-card-text v-else>
            <v-form @submit.prevent="guardar">
              <v-text-field
                v-model="nueva"
                label="Nueva contraseña"
                type="password"
                autocomplete="new-password"
                :rules="[reglaObligatoria, reglaLongitud]"
                class="my-2"
              ></v-text-field>
              <v-text-field
                v-model="repetida"
                label="Repite la nueva contraseña"
                type="password"
                autocomplete="new-password"
                :rules="[reglaObligatoria, reglaIguales]"
                class="my-2"
              ></v-text-field>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="blue darken-1"
                variant="tonal"
                size="large"
                block
                :loading="guardando"
                :disabled="guardando || !esValido"
              >
                Guardar contraseña
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { restablecerContrasena } from "@/services/UsuariosService";

const route = useRoute();
const router = useRouter();

const enLaUrl = route.query.token;
const token = ref(typeof enLaUrl === "string" ? enLaUrl : "");
const nueva = ref("");
const repetida = ref("");
const guardando = ref(false);
const cambiada = ref(false);
const error = ref("");

const reglaObligatoria = (valor: string) =>
  !!valor || "Este campo es obligatorio";
const reglaLongitud = (valor: string) =>
  (valor.length >= 6 && valor.length <= 100) ||
  "La contraseña debe tener entre 6 y 100 caracteres";
const reglaIguales = (valor: string) =>
  valor === nueva.value || "Las contraseñas no coinciden";

const esValido = computed(
  () => reglaLongitud(nueva.value) === true && nueva.value === repetida.value
);

onMounted(() => {
  // Fuera de la barra de direcciones y del historial: el enlace es como una contraseña de un solo uso
  if (enLaUrl) router.replace({ query: {} });
});

const guardar = async () => {
  if (!esValido.value) return;
  error.value = "";
  guardando.value = true;
  try {
    await restablecerContrasena({ token: token.value, nuevaPass: nueva.value });
    cambiada.value = true;
  } catch (e) {
    error.value =
      (axios.isAxiosError(e) && e.response?.data?.message) ||
      "No se ha podido cambiar la contraseña. Prueba otra vez en un rato.";
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped lang="scss">
.restablecer {
  @media screen and (max-width: 720px) {
    height: 100%;
  }
}
</style>
