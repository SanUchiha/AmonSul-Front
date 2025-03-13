<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px;">
      <LoadingGandalf />
  </div>
  <div v-else>
    <v-container class="profile-container">
      <v-row>
        <!-- Columna Izquierda (Perfil) -->
        <v-col cols="12" md="4">
          <CardPerfilUsuario :user=user! :selectedFaccionName=selectedFaccionName></CardPerfilUsuario>
        </v-col>
        
        <!-- Columna Derecha (Estadísticas, Rango/Nivel, Logros) -->
        <v-col cols="12" md="8">
          <!-- Sección de Estadísticas
          <CardEstadisticas></CardEstadisticas> -->

          <!-- Sección de Rango/Nivel -->
          <CardRangoUsuario></CardRangoUsuario>
          
          <!-- Sección de Logros -->
          <LogrosUsuario></LogrosUsuario>
        </v-col>
      </v-row>
    </v-container>
  </div>



  <!--<v-container class="pa-4">
  <v-row justify="center">
    <v-col cols="12" md="8" lg="6">
      <v-card elevation="6" class="rounded-lg pa-6">
        <v-card-title class="text-h5 font-weight-bold text-center">Perfil de Usuario</v-card-title>
        <v-divider class="mb-4"></v-divider>
        <v-card-text>
          <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px;">
            <LoadingGandalf />
          </div>
          <div v-else-if="user">
            <v-row dense>
              <v-col cols="12">
                <v-text-field label="Nombre" v-model="user!.nombreUsuario"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Primer Apellido" v-model="user!.primerApellido"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Segundo Apellido" v-model="user!.segundoApellido"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Email" v-model="user!.email" type="email"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Nick" v-model="user!.nick"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Ciudad" v-model="user!.ciudad"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Fecha de nacimiento" v-model="user!.fechaNacimiento"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  ref="nombreFaccionField"
                  label="Comunidad de juego"
                  v-model="selectedFaccionName"                  
                  dense
                  variant="solo"
                  class="rounded"
                  append-inner-icon="mdi-pencil"
                  @click:append-inner="openEditFaccionDialog"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Teléfono" v-model="user!.telefono"  dense variant="solo" class="rounded"></v-text-field>
              </v-col>
              <v-col cols="12" class="text-center mt-4">
                <v-btn color="primary" block rounded="lg" @click="handleCambiarPassword">Cambiar la contraseña</v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
-->

  <!-- Modal para modificar la contraseña -->
  <!--<ModalCambiarPass v-if="showModalCambiarPass" @close="closeModal" />-->

  <!-- Modal de feedback -->
  <!--<v-dialog v-model="feedbackDialog" max-width="500px">
    <v-card class="rounded-lg">
      <v-card-title class="text-h6 font-weight-bold">{{ feedbackTitle }}</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p>{{ feedbackMessage }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="closeFeedbackDialog">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</v-container>
-->
</template>

<script setup lang="ts">
import { onMounted, ref, computed, ComputedRef } from "vue";
import { useAuth } from "@/composables/useAuth";
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from "@/store/usuarios";
import ModalCambiarPass from "@/components/Perfil/ModalCambiarPass.vue";
import CardPerfilUsuario from "@/components/Perfil/CardPerfilUsuario.vue";
import CardEstadisticas from "@/components/Perfil/CardEstadisticas.vue";
import CardRangoUsuario from "@/components/Perfil/CardRangoUsuario.vue";
import LogrosUsuario from "@/components/Perfil/LogrosUsuario.vue";

const usuariosStore = useUsuariosStore();

const isLoading = ref(true);
const { getUser } = useAuth();
const email = ref<string>(await getUser.value!);
const selectedFaccionName = ref<number>(0);

const feedbackDialog = ref(false);

const showModalCambiarPass = ref(false);

const user = ref<UsuarioViewDTO>();



onMounted(async () => {
try {
  isLoading.value = true;
  if (!usuariosStore.usuario.idUsuario) {
    await usuariosStore.requestUsuario(email.value);
  }
  user.value = usuariosStore.usuario; // ✅ Asegura que `user` tiene datos antes de renderizar
  selectedFaccionName.value = user.value.idFaccion || 0;
} catch (error) {
  console.error("Error al obtener el usuario:", error);
} finally {
  isLoading.value = false;
}
});


const closeFeedbackDialog = () => {
  feedbackDialog.value = false;
};

const handleCambiarPassword = () => {
  showModalCambiarPass.value = true;
};

const closeModal = () => {
  showModalCambiarPass.value = false;
};
</script>

<style scoped>
  .section-card {
    margin-bottom: 20px;
    padding: 20px;
    background: #212121;
    color: white;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  }
  
  .stat-bar {
    margin-top: 10px;
    font-size: 14px;
  }
  </style>
  
