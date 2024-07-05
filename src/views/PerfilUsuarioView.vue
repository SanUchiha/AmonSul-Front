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
                    readonly
                  >
                  </v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Primer Apellido"
                    v-model="user!.primerApellido"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Segundo Apellido"
                    v-model="user!.segundoApellido"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Email"
                    v-model="user!.email"
                    type="email"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>

                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Nick"
                    v-model="user!.nick"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="ciudad"
                    v-model="user!.ciudad"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Fecha de Registro"
                    v-model="user!.fechaRegistro"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Fecha de nacimiento"
                    v-model="user!.fechaNacimiento"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Facción"
                    v-model="user!.idFaccion"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-divider></v-divider>
                <v-col cols="12" class="d-flex justify-space-between">
                  <v-text-field
                    label="Teléfono"
                    v-model="user!.telefono"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import { getUsuario } from "@/services/UsuariosService";
import { onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import ProgressCircular from "@/components/Commons/ProgressCircular.vue";

const user = ref<UsuarioViewDTO>();
const loading = ref(true);
const { getUser } = useAuth();
const error = ref<string | null>(null); // Estado de error

onMounted(async () => {
  const email: any = await getUser.value;
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
