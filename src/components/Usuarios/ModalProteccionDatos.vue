<template>
  <v-dialog v-model="isVisibleModal" persistent max-width="600px">
    <v-card>
      <v-card-title class="text-h5">Protección de Datos</v-card-title>
      <v-card-text class="text-center">
        <p>
          De acuerdo con la Ley Orgánica 3/2018, de 5 de diciembre, de
          Protección de Datos Personales y garantía de los derechos digitales
          (LOPDGDD), te informamos que tus datos personales serán tratados de
          manera confidencial y con las medidas de seguridad apropiadas.
        </p>
        <p>
          Tienes derecho a acceder, rectificar y suprimir tus datos, así como
          otros derechos reconocidos en la normativa vigente. Al continuar
          utilizando esta aplicación, confirmas que has leído y aceptas nuestra
          política de protección de datos.
        </p>
        <p>Si no aceptas esta política, no podrás utilizar la aplicación.</p>
        <p>Solo tendrás que aceptarlas una vez.</p>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn variant="outlined" color="primary" @click="aceptarPolitica">
          Aceptar
        </v-btn>
        <v-btn variant="outlined" color="secondary" @click="cancelarPolitica">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Gracias por aceptar nuestra política de protección de datos."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido acptar la protección de datos. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineEmits, watch } from "vue";
import { aceptarProteccionDatos } from "@/services/UsuariosService";
import { AceptarProteccionDatos } from "@/interfaces/Usuario";
import { useAuth } from "@/composables/useAuth";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { useRouter } from "vue-router";

const { getidUsuario, logout } = useAuth();
const router = useRouter();

const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const isVisibleModal = ref<boolean>(true);

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);

const emit = defineEmits(["modalClosed"]);

const aceptarPolitica = async () => {
  const body: AceptarProteccionDatos = {
    idUsuario: parseInt(idUsuarioLogger.value!),
    proteccionDatos: true,
  };
  try {
    await aceptarProteccionDatos(body);
    isVisibleModal.value = false;
    showSuccessModal.value = true;
  } catch (error) {
    console.error(error);
    isVisibleModal.value = false;
    showSuccessModal.value = true;
  }
};

const cancelarPolitica = async () => {
  logout();
  router.push({ name: "inicio-sesion" });
};

// Método que maneja el cierre del modal de éxito
watch(showSuccessModal, (newValue) => {
  if (!newValue) {
    emit("modalClosed");
  }
});
</script>

<style scoped>
/* Añade cualquier estilo personalizado aquí */
</style>
