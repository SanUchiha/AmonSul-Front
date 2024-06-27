<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h2>Perfil de Usuario</h2>
          </v-card-title>
          <v-card-text>
            <div v-if="user">
              <v-row>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span><strong>Nombre:</strong> {{ user.nombreUsuario }}</span>
                  <v-btn icon @click="editarCampo('nombreUsuario')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span
                    ><strong>Primer Apellido:</strong>
                    {{ user.primerApellido }}</span
                  >
                  <v-btn icon @click="editarCampo('primerApellido')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col
                  cols="12"
                  class="d-flex justify-space-between"
                  v-if="user.segundoApellido"
                >
                  <span
                    ><strong>Segundo Apellido:</strong>
                    {{ user.segundoApellido }}</span
                  >
                  <v-btn icon @click="editarCampo('segundoApellido')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span><strong>Email:</strong> {{ user.email }}</span>
                  <v-btn icon @click="editarCampo('email')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span><strong>Nick:</strong> {{ user.nick }}</span>
                  <v-btn icon @click="editarCampo('nick')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col
                  cols="12"
                  class="d-flex justify-space-between"
                  v-if="user.ciudad"
                >
                  <span><strong>Ciudad:</strong> {{ user.ciudad }}</span>
                  <v-btn icon @click="editarCampo('ciudad')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span
                    ><strong>Fecha de Registro:</strong>
                    {{ user.fechaRegistro }}</span
                  >
                  <!-- No es necesario el botón de edición aquí -->
                </v-col>
                <v-col cols="12" class="d-flex justify-space-between">
                  <span
                    ><strong>Fecha de Nacimiento:</strong>
                    {{ user.fechaNacimiento }}</span
                  >
                  <v-btn icon @click="editarCampo('fechaNacimiento')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col
                  cols="12"
                  class="d-flex justify-space-between"
                  v-if="user.idFaccion"
                >
                  <span><strong>Facción:</strong> {{ user.idFaccion }}</span>
                  <v-btn icon @click="editarCampo('idFaccion')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
                <v-col
                  cols="12"
                  class="d-flex justify-space-between"
                  v-if="user.telefono"
                >
                  <span><strong>Teléfono:</strong> {{ user.telefono }}</span>
                  <v-btn icon @click="editarCampo('telefono')">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
            <div v-else>
              <p>Cargando...</p>
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

const user = ref<UsuarioViewDTO>();
const { getUser } = useAuth();

onMounted(async () => {
  const email: any = getUser.value;
  try {
    const response = await getUsuario(email);
    console.log("res", response);
    user.value = response?.data;
    console.log("usuario", user.value);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  }
});

const editarCampo = (campo: keyof UsuarioViewDTO) => {
  console.log(`Editar campo: ${campo}`);
  // Aquí puedes manejar la lógica de edición, como mostrar un diálogo modal con un formulario
};
</script>

<style scoped>
.d-flex {
  display: flex;
}

.justify-space-between {
  justify-content: space-between;
}
</style>
