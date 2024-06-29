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
            <v-form @submit.prevent="handlerNewUser" ref="form">
              <v-text-field
                v-model="nombre"
                label="Nombre"
                type="text"
                required
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-model="primerApellido"
                label="Primer apellido"
                type="text"
                required
                :rules="[rules.required]"
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
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-text-field
                v-model="password2"
                label="Repite contraseña"
                type="password"
                :rules="[rules.required, rules.matchPassword]"
                required
              ></v-text-field>
              <v-text-field
                v-model="nick"
                label="Nick"
                type="text"
                required
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-model="ciudad"
                label="Ciudad"
                type="text"
                required
                :rules="[rules.required]"
              ></v-text-field>
              <v-text-field
                v-model="telefono"
                label="Telefono"
                type="text"
                :rules="[rules.phone]"
              ></v-text-field>
              <v-combobox
                v-model="faccion"
                :items="nombreFacciones"
                label="Facción"
                @click="loadFacciones"
              >
                <template #append-item>
                  <v-btn
                    variant="outlined"
                    color="blue darken-1"
                    @click="openDialogNuevaFaccion"
                  >
                    Añadir nueva facción
                  </v-btn>
                </template>
              </v-combobox>
              <v-text-field
                v-model="fechaNacimiento"
                label="Fecha de Nacimiento"
                type="date"
                :rules="[rules.required, rules.validDate]"
                required
              ></v-text-field>
              <v-row justify="center" class="my-4">
                <v-btn
                  variant="outlined"
                  color="blue darken-1"
                  @click="handlerNewUser"
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

    <v-dialog v-model="dialogAddFaccion" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Añadir nueva facción</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="addFaccionForm">
            <v-text-field
              v-model="nuevaFaccion"
              label="Nombre de la facción"
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { NewUserDTO } from "@/interfaces/Usuario";
import { newUser } from "@/services/UsuariosService";
import { AxiosError } from "axios";
import ErrorNick from "../RegistroUsuarios/ErrorNick.vue";
import ErrorEmail from "../RegistroUsuarios/ErrorEmail.vue";
import ResponseNuevoUsuario from "../RegistroUsuarios/ResponseNuevoUsuario.vue";
import { getFacciones, registrarFaccion } from "@/services/FaccionesService";
import { Faccion, RegistrarFaccionDTO } from "@/interfaces/Faccion";

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
const dialogAddFaccion = ref(false);
const loading = ref(false);
const telefono = ref("");
const listaFacciones = ref<Faccion[]>([]);
const nombreFacciones = ref<string[]>([]);
const faccionSelected = ref<string>("");
const nuevaFaccion = ref<string>("");

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

const loadFacciones = async () => {
  loading.value = true;
  try {
    const response = await getFacciones();
    listaFacciones.value = response;
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
    const response = await registrarFaccion(nuevaFaccion.value);
    if (!response) alert("faccion no añadida");
    dialogAddFaccion.value = false;
    loadFacciones();
  } catch (error) {
    console.log("Error al registrar una nueva facción:", error);
  } finally {
    loading.value = false;
    dialogAddFaccion.value = false;
  }
};

const handlerNewUser = async () => {
  dialogNick.value = false;
  dialogEmail.value = false;
  dialogOk.value = false;
  loading.value = true;

  const newUserDTO: NewUserDTO = {
    NombreUsuario: nombre.value,
    PrimerApellido: primerApellido.value,
    SegundoApellido: segundoApellido.value,
    Email: email.value,
    Contraseña: password.value,
    Rol: "JUGADOR",
    Nick: nick.value,
    Ciudad: ciudad.value,
    idFaccion: faccionSelected.value,
    FechaNacimiento: formatFecha(fechaNacimiento.value),
    Telefono: telefono.value,
  };

  try {
    if (newUserDTO.idFaccion.length > 1) {
      for (let index = 0; index < listaFacciones.value.length; index++) {
        const element = listaFacciones.value[index];
        if (newUserDTO.idFaccion === element.nombreFaccion) {
          newUserDTO.idFaccion = element.idFaccion.toString();
        }
      }
    }
    await newUser(newUserDTO);
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
        router.push("error");
      } else {
        router.push("error");
      }
    } else {
      router.push("error");
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
