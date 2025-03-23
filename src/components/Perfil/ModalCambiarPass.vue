<template>
  <div class="center">
    <v-dialog v-model="show" max-width="800px">
      <v-card>
        <v-card-title class="modal-title">
          <h3>Modificar contraseña</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="close" class="close-button">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-text-field
                v-model="oldPass"
                label="Antigua contraseña"
                type="password"
                required
                :rules="[requiredRule]"
              ></v-text-field>
            </v-list-item>

            <v-list-item>
              <v-text-field
                v-model="newPass1"
                label="Nueva contraseña"
                type="password"
                required
                :rules="[requiredRule, passwordRule]"
              ></v-text-field>
            </v-list-item>

            <v-list-item>
              <v-text-field
                v-model="newPass2"
                label="Repite la nueva contraseña"
                type="password"
                required
                :rules="[requiredRule, passwordMatchRule]"
              ></v-text-field>
            </v-list-item>

            <!-- Botón para cambiar la contraseña -->
            <v-list-item>
              <v-list-item-content>
                <v-btn
                  :loading="isLoading"
                  color="primary"
                  variant="tonal"
                  @click="cambiar"
                  :disabled="isLoading || !isFormValid"
                >
                  Cambiar contraseña
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
      message="Se ha modificado la contraseña correctamente."
      @update:isVisible="handleModalClose"
    />

    <!-- Modal de error -->
    <ModalError
      :isVisible="showErrorModal"
      message="No se ha podido modificar la contraseña. Contacta con el administrador."
      @update:isVisible="handleModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { cambiarPass } from "@/services/UsuariosService";
import { UsuarioCambioPassDTO } from "@/interfaces/Usuario";
import { useAuth } from "@/composables/useAuth";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const show = ref<boolean>(true);
const oldPass = ref<string>("");
const newPass1 = ref<string>("");
const newPass2 = ref<string>("");

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const { getidUsuario } = useAuth();
const idUsuario = ref<string | null>(getidUsuario.value);

const close = () => {
  show.value = false;
  emit("close");
};

// Función para manejar el cierre de los modales de éxito y error
const handleModalClose = (value: boolean) => {
  if (!value) {
    close();
  }
};

// Validaciones
const requiredRule = (value: string) => !!value || "Este campo es obligatorio";
const passwordRule = (value: string) =>
  value.length >= 6 || "La contraseña debe tener al menos 6 caracteres";
const passwordMatchRule = (value: string) =>
  value === newPass1.value || "Las contraseñas no coinciden";

const isFormValid = computed(() => {
  return (
    oldPass.value &&
    newPass1.value &&
    newPass2.value &&
    newPass1.value === newPass2.value
  );
});

// Función para cambiar la contraseña
const cambiar = async () => {
  if (isFormValid.value) {
    try {
      const body: UsuarioCambioPassDTO = {
        idUsuario: parseInt(idUsuario.value!),
        oldPass: oldPass.value,
        newPass: newPass1.value,
      };

      isLoading.value = true;
      await cambiarPass(body);
      showSuccessModal.value = true;
    } catch (error) {
      console.error(error);
      showErrorModal.value = true;
    } finally {
      isLoading.value = false;
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
