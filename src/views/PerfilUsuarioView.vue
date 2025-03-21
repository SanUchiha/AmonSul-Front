<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px;">
      <LoadingGandalf />
  </div>
  <div v-else>
    <v-container class="profile-container">
      <v-row>
        <!-- Columna Izquierda (Perfil) -->
        <v-col cols="12" md="4" offset-md="4">
          <CardPerfilUsuario :user=user! :selectedFaccionName=selectedFaccionName :editable=editable></CardPerfilUsuario>
        </v-col>
        
        <!-- Columna Derecha (Estadísticas, Rango/Nivel, Logros) -->
        <v-col cols="12" md="8">
          <!-- Sección de Estadísticas
          <CardEstadisticas></CardEstadisticas> -->

          <!-- Sección de Rango/Nivel 
          <CardRangoUsuario></CardRangoUsuario>-->
          
          <!-- Sección de Logros 
          <LogrosUsuario></LogrosUsuario>-->
        </v-col>
      </v-row>
    </v-container>
  </div>




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
import { onMounted, ref, defineProps, withDefaults, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { useUsuariosStore } from "@/store/usuarios";
import ModalCambiarPass from "@/components/Perfil/ModalCambiarPass.vue";
import CardPerfilUsuario from "@/components/Perfil/CardPerfilUsuario.vue";
import CardRangoUsuario from "@/components/Perfil/CardRangoUsuario.vue";
import LogrosUsuario from "@/components/Perfil/LogrosUsuario.vue";

const usuariosStore = useUsuariosStore();

const isLoading = ref(true);
const { getUser } = useAuth();
const correo = ref<string>(await getUser.value!);
const selectedFaccionName = ref<number>(0);
const showModalCambiarPass = ref(false);
const user = ref<UsuarioViewDTO>();

// Definimos props opcionales con TypeScript
const props = withDefaults(defineProps<{
  editable?: boolean;
  email?: string; // Opcional
}>(),{
  editable: true,
  email: ""
});

// Función para cargar los datos del usuario
const cargarUsuario = async () => {
  try {
    isLoading.value = true;
    if (props.email==""){
      console.log("email.email:", correo.value);
      await usuariosStore.requestUsuario(correo.value);
    }
    else{
      console.log("props.email:", props.email);
      await usuariosStore.requestUsuario(props.email);
    }
    user.value = usuariosStore.usuario; // ✅ Asegura que user tiene datos antes de renderizar
    selectedFaccionName.value = user.value.idFaccion || 0;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    isLoading.value = false;
  }
};

// Ejecutar cuando el componente se monta
onMounted(() => {
  if (correo.value){
    console.log("onMounted ejecutado");
    cargarUsuario();
  }
});

// Observar cambios en la prop `email` y recargar datos
watch(() => props.email, async (newEmail, oldEmail) => {
  if (newEmail && newEmail !== oldEmail) {
    console.log("Email cambiado, recargando usuario:", newEmail);
    await cargarUsuario();
  }
});


const handleCambiarPassword = () => {
  showModalCambiarPass.value = true;
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
  
