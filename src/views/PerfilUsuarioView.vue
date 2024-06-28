<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h2>Configuración</h2>
          </v-card-title>
          <v-card-text>
            <div v-if="loading">
              <v-row justify="center" align="center" style="height: 100px">
                <v-col cols="12" class="text-center">
                  <ProgressCircular />
                </v-col>
              </v-row>
            </div>
            <div v-else>
              <v-row>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Nombre"
                    v-model="user!.nombreUsuario"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion(
                        'nombreUsuario',
                        'nombre',
                        user!.nombreUsuario
                      )
                    "
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Primer Apellido"
                    v-model="user!.primerApellido"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion(
                        'primerApellido',
                        'primer apellido',
                        user!.primerApellido
                      )
                    "
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Segundo Apellido"
                    v-model="user!.segundoApellido"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion(
                        'segundoApellido',
                        'segundo Apellido',
                        user!.segundoApellido!
                      )
                    "
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Email"
                    v-model="user!.email"
                    type="email"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion('email', 'email', user!.email)
                    "
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Contraseña"
                    v-model="newPass"
                    type="password"
                    append-icon="mdi-pencil"
                    @click:append="cambiarPass(newPass, 'contraseña')"
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Nick"
                    v-model="user!.nick"
                    append-icon="mdi-pencil"
                    @click:append="iniciarEdicion('nick', 'nick', user!.nick)"
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="ciudad"
                    v-model="user!.ciudad"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion('ciudad', 'Ciudad', user!.ciudad!)
                    "
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Fecha de Registro"
                    v-model="user!.fechaRegistro"
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Fecha de nacimiento"
                    v-model="user!.fechaNacimiento"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion(
                        'fechaNacimiento',
                        'fecha de nacimiento',
                        user!.fechaNacimiento
                      )
                    "
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Facción"
                    v-model="user!.idFaccion"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion(
                        'idFaccion',
                        'facción',
                        user!.idFaccion?.toString()!
                      )
                    "
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Teléfono"
                    v-model="user!.telefono"
                    append-icon="mdi-pencil"
                    @click:append="
                      iniciarEdicion('telefono', 'teléfono', user!.telefono!)
                    "
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <DialogConfirmarEdicion
      v-model:dialogoEdicion="dialogoEdicion"
      :campoEdicion="campoEdicion"
      :valorEdicion="valorEdicion"
      :label="label"
      @guardar="guardarCambios"
    />
  </v-container>
</template>

<script setup lang="ts">
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import { getUsuario, editarUsuario } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import DialogConfirmarEdicion from "@/components/PerfilUsuario/DialogConfirmarEditar.vue";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";

const user = ref<UsuarioViewDTO>();
const loading = ref(true);
const { getUser } = useAuth();

const dialogoEdicion = ref(false);
const campoEdicion = ref<keyof UsuarioViewDTO | null>(null);
const valorEdicion = ref<string | null>(null);
const newPass = ref<string>("");
const label = ref<string>(``);
const error = ref<string | null>(null); // Estado de error

onMounted(async () => {
  const email: any = await getUser.value;
  console.log(email);
  if (!email) {
    error.value = "No se pudo obtener el usuario. Por favor, inicie sesión.";
    console.log(error.value);
    loading.value = false;
    return;
  }
  try {
    const response = await getUsuario(email);
    user.value = response;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    loading.value = false;
  }
});

const iniciarEdicion = (
  campo: keyof UsuarioViewDTO,
  labelForm: string,
  valorActual: string
) => {
  campoEdicion.value = campo;
  valorEdicion.value = valorActual;
  dialogoEdicion.value = true;
  label.value = labelForm;
};

const cambiarPass = (newPass: string, labelForm: string) => {
  campoEdicion.value = "contraseña";
  valorEdicion.value = newPass;
  label.value = labelForm;
  dialogoEdicion.value = true;
};

const guardarCambios = async (nuevoValor: string) => {
  if (campoEdicion.value && user.value) {
    user.value[campoEdicion.value] = nuevoValor;

    try {
      const json = {
        email: getUser.value,
        [campoEdicion.value]: nuevoValor,
      };
      const response = await editarUsuario(json);
      console.log("response:", response);
    } catch (error) {
      console.error("Error al editar el usuario:", error);
    }
  }
};
</script>

<style scoped>
.d-flex {
  display: flex;
}

.justify-space-between {
  justify-content: space-between;
}

.text-center {
  text-align: center;
}
</style>
