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
            <v-alert v-if="successMessage" type="success" dismissible>{{
              successMessage
            }}</v-alert>
            <v-alert v-if="errorMessage" type="error" dismissible>{{
              errorMessage
            }}</v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ContactForm } from "@/interfaces/Contacto";
import { sendEmailContacto } from "@/services/ContactoService";
import { useRouter } from "vue-router";

const consulta = ref<ContactForm>({
  email: "",
  message: "",
});

const router = useRouter();

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

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
      console.log(consulta.value);

      await sendEmailContacto(consulta.value);
      consulta.value;
      successMessage.value = "Tu mensaje ha sido enviado con éxito.";
      errorMessage.value = null;

      router.push("inicio-sesion");
    } catch (error) {
      errorMessage.value = "No se ha podido enviar la consulta.";
    }
  } else {
    errorMessage.value =
      "Por favor, completa todos los campos correctamente antes de enviar.";
  }
};
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
