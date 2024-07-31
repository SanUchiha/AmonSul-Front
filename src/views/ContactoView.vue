<template>
  <v-container class="login-form">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h2>Contacta</h2>
          </v-card-title>
          <v-card-text>
            <v-form
              justify="center"
              class="my-4 ga-5"
              ref="contactForm"
              @submit.prevent="submitForm"
            >
              <v-row>
                <v-col cols="12" md="12">
                  <v-text-field
                    v-model="consulta.email"
                    label="Correo Electrónico"
                    required
                    :rules="[rules.required, rules.email]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="12">
                  <v-textarea
                    v-model="consulta.message"
                    label="Mensaje"
                    required
                    :rules="[rules.required]"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" class="text-center">
                  <v-btn
                    color="blue darken-1"
                    variant="outlined"
                    size="large"
                    class="login-form__button"
                    type="submit"
                  >
                    Enviar consulta
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ModalSuccess
      :isVisible="showSuccessModal"
      message="Consulta enviada con exito."
      @update:isVisible="showSuccessModal = $event"
    />

    <ModalError
      :isVisible="showErrorModal"
      message="No se ha podido enviar la consulta. Contacta con el administrador."
      @update:isVisible="showErrorModal = $event"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ContactForm } from "@/interfaces/Contacto";
import { sendEmailContacto } from "@/services/ContactoService";
import { useRouter } from "vue-router";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const consulta = ref<ContactForm>({
  email: "",
  message: "",
});

const router = useRouter();

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);

const rules = {
  required: (value: string) => !!value || "Requerido.",
  email: (value: string) => {
    const pattern = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/; // Ajuste en la expresión regular
    return pattern.test(value) || "Correo electrónico inválido.";
  },
};

const isFormValid = computed(() => {
  return (
    rules.email(consulta.value.email) === true &&
    rules.required(consulta.value.message) === true
  );
});

const submitForm = async () => {
  if (isFormValid.value) {
    try {
      await sendEmailContacto(consulta.value);
      showSuccessModal.value = true;
    } catch (error) {
      showErrorModal.value = true;
    }
  }
};

watch(showSuccessModal, (newValue) => {
  if (!newValue) {
    router.push("inicio-sesion");
  }
});
</script>

<style scoped lang="scss">
.contact-form {
  max-width: 600px;
  margin: 0 auto;
}

.contact-form {
  position: relative;

  @media screen and (max-width: 720px) {
    height: 100%;
  }

  &__button {
    @media screen and (max-width: 720px) {
      width: calc(100% - 24px);
    }
  }
}
</style>
