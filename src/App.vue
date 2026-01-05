<template>
  <v-app>
    <v-navigation-drawer v-if="isAuthenticated" v-model="drawer" app>
      <v-btn icon @click.stop="drawer = false" class="close-drawer-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-list-item>
        <img
          :src="LogoAmonSulPNG"
          alt="Icono personalizado"
          width="50%"
          height="50%"
        />
      </v-list-item>
      <v-divider></v-divider>
      <v-list class="ringbearer">
        <v-list-item link to="/mis-partidas" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/misPartidas.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Mis partidas</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/mis-torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/misTorneos.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Mis torneos</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/calendario.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Calendario</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/jugadores" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/usuarios.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Usuarios</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/elo" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/clasificacion.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Clasificaciones</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/gestion-torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/gestionTorneos.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Gestión Torneos</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/ligas" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/ligas.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Ligas</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/perfil-usuario" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/perfil.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Perfil</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/about-us" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img
                src="@/assets/icons/sobreNosotros.png"
                alt="Icono personalizado"
                width="30"
                height="30"
              />
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Sobre nosotros</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon
        v-if="isAuthenticated"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-app-bar-title
        ><v-img :src="LogoAmonSulSVG" alt="Icono personalizado" height="30"
      /></v-app-bar-title>
      <v-btn icon to="contacto">
        <v-icon>mdi-email</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="() => router.push({ name: 'perfil-usuario' })"
        v-if="isAuthenticated"
      >
        <v-avatar size="30" class="avatar">
          <v-img :src="user.imagen || defaultAvatar" alt="Avatar"></v-img>
        </v-avatar>
      </v-btn>
      <v-btn v-if="isAuthenticated" icon @click="mostrarDialogoLogout = true">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <LogoutDialog
      :isVisible="mostrarDialogoLogout"
      titulo="Cerrar sesión"
      mensaje="¿Estás seguro de que deseas cerrar sesión?"
      textoConfirmar="Sí"
      textoCancelar="No"
      @update:isVisible="mostrarDialogoLogout = $event"
      @confirmar="handleLogout"
      @cancelar="mostrarDialogoLogout = false"
    />

    <FooterComponent absolute="true" />

    <!-- Modal de partidas activas modular -->
    <ModalPartidasActivas
      v-model="mostrarModalPartidas"
      :estaJugando="estaJugando"
      :idUsuario="Number(getidUsuario)"
    />
  </v-app>

  <v-snackbar v-model="showToast" :color="toastColor" timeout="3000" top right>
    {{ toastMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import ModalPartidasActivas from "@/components/Commons/ModalPartidasActivas.vue";
import { getPartidasTorneoPorFechaAsync } from "@/services/PartidaTorneoService";
// Estado para el modal y las partidas activas
const mostrarModalPartidas = ref<boolean>(false);

import { ref, computed, onMounted, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import LogoutDialog from "@/components/Commons/LogoutDialog.vue";
import LogoAmonSulPNG from "@/assets/icons/Logo2.png";
import LogoAmonSulSVG from "@/assets/icons/logo_horizontal3.png";
import FooterComponent from "@/components/Commons/FooterComponent.vue";
import { useUsuariosStore } from "@/store/usuarios";
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import defaultAvatar from "@/assets/icons/perfil.png";
import { useToast } from "@/composables/useToast";
import { EstaJugandoDTO } from "./interfaces/Partidas";

const usuariosStore = useUsuariosStore();
const user = ref<UsuarioViewDTO>({} as UsuarioViewDTO);
const { showToast, toastMessage, toastColor } = useToast();

const { logout, getUser, getidUsuario } = useAuth();
const router = useRouter();
const drawer = ref(false);
const mostrarDialogoLogout = ref(false);
const { isAuthenticated } = useAuth();
const estaJugando = ref<EstaJugandoDTO>();

const isLoggedIn = computed(() => !!getUser.value);

const handleLogout = async () => {
  usuariosStore.usuario = {} as UsuarioViewDTO; // Limpia los datos del usuario anterior
  logout();
  router.push({ name: "inicio-sesion" });
};

// Función para cargar los datos del usuario
const cargarUsuario = async () => {
  try {
    await usuariosStore.requestUsuario(getUser.value);
    user.value = usuariosStore.usuario;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  }
};

watch(
  () => getUser.value,
  nuevoUsuario => {
    if (nuevoUsuario) {
      cargarUsuario();
    } else {
      user.value = {} as UsuarioViewDTO;
    }
  },
  { immediate: true }
);

// Llamada real al backend para comprobar partidas activas
const comprobarPartidasActivas = async (idUsuario: string) => {
  try {
    const response = await getPartidasTorneoPorFechaAsync(Number(idUsuario));

    if (response.status === 200) {
      estaJugando.value = response.data;
      if (estaJugando.value?.tienePartidas) {
        mostrarModalPartidas.value = true;
      }
    }
  } catch (error) {
    console.error("Error al comprobar partidas activas:", error);
  }
};

onMounted(() => {
  if (isLoggedIn.value) {
    cargarUsuario();
  }
  comprobarPartidasActivas(getidUsuario.value);
});
</script>

<style scoped>
.close-drawer-btn {
  margin: 10px;
}

.icon {
  width: 36px;
}

.name {
  width: 140px;
}

/*Estilo para el menu inferior*/
.bottom-nav {
  z-index: 100; /* asegura que esté por encima del contenido */
}

/* Color para el botón activo */
.active-btn .v-icon {
  color: #ffeb3b !important; /* amarillo claro o el color que prefieras */
}

/* Animación sutil al pulsar */
.animated-btn {
  transition: transform 0.15s ease-in-out;
}

.animated-btn:active {
  transform: scale(0.9);
}
</style>
