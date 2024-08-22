<template>
  <div class="center">
    <v-dialog v-model="show" max-width="800px">
      <v-card>
        <v-card-title class="modal-title">
          <h3>Recuperar contraseña</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="close" class="close-button">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-list dense>
            <!-- Label con el email -->
            <v-list-item>
              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                required
                class="my-4"
                :rules="[emailRule]"
              ></v-text-field>
            </v-list-item>

            <!-- Botón para enviar el correo -->
            <v-list-item>
              <v-list-item-content>
                <v-btn
                  :loading="isLoading"
                  color="primary"
                  @click="recordar"
                  :disabled="isLoading"
                >
                  Enviar
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal de éxito -->
    <ModalSuccess
      :isVisible="showSuccessModal"
      message="Se te ha enviado un correo con una contraseña temporal."
      @update:isVisible="handleModalClose"
    />

    <!-- Modal de error -->
    <ModalError
      :isVisible="showErrorModal"
      message="No se ha podido enviar el correo. Contacta con el administrador."
      @update:isVisible="handleModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { recordarPass } from "@/services/UsuariosService";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const show = ref<boolean>(true);
const email = ref<string>("");

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const close = () => {
  show.value = false;
  emit("close");
};

const handleModalClose = (value: boolean) => {
  if (!value) {
    close();
  }
};

const emailRule = (value: string) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) || "Correo electrónico no es válido";
};

const recordar = async () => {
  if (emailRule(email.value) === true) {
    try {
      isLoading.value = true;
      await recordarPass(email.value);
      showSuccessModal.value = true;
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
    } finally {
      isLoading.value = false;
      //close(); // Cierra el modal principal después de intentar la operación
    }
  }
};
</script>

<style scoped>
.modal-title {
  display: flex;
  align-items: center;
  font-size: 20px;
}

.close-button {
  margin-left: auto;
}

.v-list-item {
  margin-bottom: 16px;
}
</style>
