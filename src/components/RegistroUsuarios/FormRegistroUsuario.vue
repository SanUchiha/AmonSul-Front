<template>
  <v-container class="login-form">
    <div class="overlay" v-if="loading"></div>

    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h2>Nuevo usuario</h2>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="validateForm" ref="form">
              <v-text-field
                v-model="nombre"
                label="Nombre"
                type="text"
                required
                :rules="[rules.required]"
                :error="errors.nombre"
              ></v-text-field>
              <v-text-field
                v-model="primerApellido"
                label="Primer apellido"
                type="text"
                required
                :rules="[rules.required]"
                :error="errors.primerApellido"
              ></v-text-field>
              <v-text-field
                v-model="segundoApellido"
                label="Segundo apellido"
                type="text"
              ></v-text-field>
              <v-text-field
                v-model="email"
                label="Correo electrónico"
                type="email"
                :rules="[rules.required, rules.email]"
                required
                :error="errors.email"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                :rules="[rules.required]"
                required
                :error="errors.password"
              ></v-text-field>
              <v-text-field
                v-model="password2"
                label="Repite contraseña"
                type="password"
                :rules="[rules.required, rules.matchPassword]"
                required
                :error="errors.password2"
              ></v-text-field>
              <v-text-field
                v-model="nick"
                label="Nick"
                type="text"
                required
                :rules="[rules.required]"
                :error="errors.nick"
              ></v-text-field>
              <v-text-field
                v-model="ciudad"
                label="Ciudad"
                type="text"
                required
                :rules="[rules.required]"
                :error="errors.ciudad"
              ></v-text-field>
              <v-text-field
                v-model="telefono"
                label="Telefono"
                type="text"
                :rules="[rules.phone]"
                :error="errors.telefono"
              ></v-text-field>
              <v-combobox
                v-model="faccionSelected"
                :items="nombreFacciones"
                label="Comunidad de juego"
                @click="loadFacciones"
              >
                <template #append-item>
                  <v-btn
                    variant="outlined"
                    color="blue darken-1"
                    @click="openDialogNuevaFaccion"
                  >
                    Añadir nueva comunidad
                  </v-btn>
                </template>
              </v-combobox>
              <v-text-field
                v-model="fechaNacimiento"
                label="Fecha de Nacimiento"
                type="date"
                :rules="[rules.required, rules.validDate]"
                required
                :error="errors.fechaNacimiento"
              ></v-text-field>
              <v-row justify="center" class="my-4">
                <v-btn
                  variant="outlined"
                  color="blue darken-1"
                  @click="validateForm"
                  class="mr-4"
                >
                  Registrar
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="blue darken-1"
                  to="inicio-sesion"
                  :disabled="loading"
                  class="mr-4"
                >
                  Volver
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

    <ErrorNick
      :isVisible="dialogNick"
      @update:isVisible="dialogNick = $event"
    />
    <ErrorEmail
      :isVisible="dialogEmail"
      @update:isVisible="dialogEmail = $event"
    />
    <ResponseNuevoUsuario
      :isVisible="dialogOk"
      @update:isVisible="handleOkClick = $event"
    />

    <ModalMessageError
      :isVisible="dialogDuplicado"
      @update:isVisible="dialogDuplicado = $event"
    />

    <v-dialog v-model="dialogAddFaccion" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Añadir nueva comunidad de juego</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="addFaccionForm">
            <v-text-field
              v-model="nuevaFaccion"
              label="Nombre de la comunidad"
              required
              :rules="[rules.required]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            color="blue darken-1"
            @click="dialogAddFaccion = false"
          >
            Cancelar
          </v-btn>
          <v-btn variant="outlined" color="blue darken-1" @click="addFaccion">
            Añadir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { NewUserDTO } from "@/interfaces/Usuario";
import { AxiosError } from "axios";
import ErrorNick from "../RegistroUsuarios/ErrorNick.vue";
import ErrorEmail from "../RegistroUsuarios/ErrorEmail.vue";
import ResponseNuevoUsuario from "../RegistroUsuarios/ResponseNuevoUsuario.vue";
import { getFacciones, registrarFaccion } from "@/services/FaccionesService";
import { Faccion } from "@/interfaces/Faccion";
import ModalMessageError from "../Commons/ModalMessageError.vue";
import { useUsuariosStore } from '@/store/usuarios';

const usuariosStore = useUsuariosStore();

const nombre = ref("");
const primerApellido = ref("");
const segundoApellido = ref("");
const email = ref("");
const password = ref("");
const password2 = ref("");
const nick = ref("");
const ciudad = ref("");
const fechaNacimiento = ref("");
const router = useRouter();
const dialogNick = ref(false);
const dialogEmail = ref(false);
const dialogOk = ref(false);
const dialogDuplicado = ref(false);
const dialogAddFaccion = ref(false);
const loading = ref(false);
const telefono = ref("");
const listaFacciones = ref<Faccion[]>([]);
const nombreFacciones = ref<string[]>([]);
const faccionSelected = ref<string>("");
const nuevaFaccion = ref<string>("");
const idFaccionSelected = ref<number>();

const formatFecha = (fechaString: string) => {
  const fecha = new Date(fechaString);
  const year = fecha.getFullYear();
  const month = ("0" + (fecha.getMonth() + 1)).slice(-2);
  const day = ("0" + fecha.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const rules = {
  required: (value: string | null) => !!value || "Este campo es obligatorio.",
  email: (value: string | null) =>
    /.+@.+\..+/.test(value as string) || "Formato de correo inválido.",
  matchPassword: (value: string | null) =>
    value === password.value || "Las contraseñas no coinciden.",
  validDate: (value: string | null) => {
    const selectedDate = new Date(value as string);
    const currentDate = new Date();
    return (
      selectedDate < currentDate ||
      "La fecha debe ser menor que la fecha actual."
    );
  },
  phone: (value: string | null) =>
    /^\d{9}$/.test(value as string) ||
    "El número de teléfono debe tener 9 dígitos.",
};

const errors = reactive({
  nombre: false,
  primerApellido: false,
  email: false,
  password: false,
  password2: false,
  nick: false,
  ciudad: false,
  fechaNacimiento: false,
  telefono: false,
});

const loadFacciones = async () => {
  loading.value = true;
  try {
    const response = await getFacciones();
    listaFacciones.value = response.data;
    nombreFacciones.value = listaFacciones.value
      .map((f) => f.nombreFaccion)
      .sort();
  } catch (error) {
    console.log("Error al obtener las facciones:", error);
  } finally {
    loading.value = false;
  }
};

const openDialogNuevaFaccion = () => {
  dialogAddFaccion.value = true;
};

const addFaccion = async () => {
  loading.value = true;

  try {
    //Controlar que no duplique
    if (
      listaFacciones.value.find(
        (f) =>
          f.nombreFaccion.toUpperCase() === nuevaFaccion.value.toUpperCase()
      )
    )
      dialogDuplicado.value = true;
    else {
      const response = await registrarFaccion(nuevaFaccion.value);
      if (!response.data) alert("Error del servidor");
    }

    dialogAddFaccion.value = false;
    loadFacciones();
  } catch (error) {
    console.log("Error al registrar una nueva facción:", error);
  } finally {
    loading.value = false;
    dialogAddFaccion.value = false;
    dialogDuplicado.value = true;
  }
};

const validateForm = () => {
  errors.nombre = !nombre.value;
  errors.primerApellido = !primerApellido.value;
  errors.email = !email.value || !rules.email(email.value);
  errors.password = !password.value;
  errors.password2 = !password2.value || password.value !== password2.value;
  errors.nick = !nick.value;
  errors.ciudad = !ciudad.value;
  errors.fechaNacimiento =
    !fechaNacimiento.value || !rules.validDate(fechaNacimiento.value);
  errors.telefono = telefono.value && !rules.phone(telefono.value);

  const formIsValid = Object.values(errors).every((error) => !error);

  if (formIsValid) {
    handlerNewUser();
  } else {
    alert("Por favor, completa todos los campos requeridos correctamente.");
  }
};

const handlerNewUser = async () => {
  dialogNick.value = false;
  dialogEmail.value = false;
  dialogOk.value = false;
  loading.value = true;

  if (faccionSelected.value.length > 1) {
    for (let index = 0; index < listaFacciones.value.length; index++) {
      const element = listaFacciones.value[index];
      if (faccionSelected.value === element.nombreFaccion) {
        idFaccionSelected.value = element.idFaccion;
      }
    }
  }

  const newUserDTO: NewUserDTO = {
    NombreUsuario: nombre.value,
    PrimerApellido: primerApellido.value,
    SegundoApellido: segundoApellido.value,
    Email: email.value,
    Contraseña: password.value,
    Rol: "JUGADOR",
    Nick: nick.value,
    Ciudad: ciudad.value,
    idFaccion: idFaccionSelected.value,
    FechaNacimiento: formatFecha(fechaNacimiento.value),
    Telefono: telefono.value,
  };
  try {
    await usuariosStore.postUser(newUserDTO);
    dialogOk.value = true;
  } catch (error: any) {
    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const responseData: any = axiosError.response.data;
        if (responseData.detail === "El correo electrónico ya está en uso.")
          dialogEmail.value = true;
        else dialogNick.value = true;
      } else if (axiosError.request) {
        router.push({ name: "error" });
      } else {
        router.push({ name: "error" });
      }
    } else {
      router.push({ name: "error" });
    }
  } finally {
    loading.value = false;
  }
};

const handleOkClick = () => {
  dialogOk.value = false;
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  visibility: visible;
}

.overlay.hidden {
  display: none;
}

.login-form {
  position: relative;
}

.progress-linear-margin {
  margin-top: 20px;
}
</style>
