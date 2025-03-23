<template>
  <v-app>
    <v-navigation-drawer v-if="isAuthenticated" v-model="drawer" app>
      <v-btn icon @click.stop="drawer = false" class="close-drawer-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-list-item>
        <img :src=LogoAmonSulPNG alt="Icono personalizado" width="50%" height="50%">
      </v-list-item>
      <v-divider></v-divider>
      <v-list class="ringbearer">
        <v-list-item link to="/mis-partidas" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/misPartidas.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Mis partidas</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/mis-torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/misTorneos.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Mis torneos</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/calendario.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Calendario</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/jugadores" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/usuarios.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Usuarios</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/elo" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/clasificacion.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Clasificaciones</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/gestion-torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/gestionTorneos.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Gestión Torneos</v-list-item-title>
          </v-list-item-content>
        </v-list-item>        
        <v-list-item link to="/ligas" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/ligas.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Ligas</v-list-item-title>
          </v-list-item-content>
        </v-list-item>        
        <v-list-item link to="/perfil-usuario" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/perfil.png" alt="Icono personalizado" width="30" height="30">
            </v-list-item-icon>
            <v-list-item-title class="mt-1">Perfil</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/about-us" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-list-item-icon>
              <img src="@/assets/icons/sobreNosotros.png" alt="Icono personalizado" width="30" height="30">
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
      <v-app-bar-title><v-img :src=LogoAmonSulSVG alt="Icono personalizado"  height="30"/></v-app-bar-title>
      <v-btn icon to="contacto">
        <v-icon>mdi-email</v-icon>
      </v-btn>
      <v-btn icon="mdi-account-circle" @click="() => router.push({ name: 'perfil-usuario' })"></v-btn>
      <v-btn
        icon
        @click="mostrarDialogoLogout = true"
        :disabled="!isAuthenticated"
      >
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

    <v-bottom-navigation
      v-if="$vuetify.display.smAndDown"
      app
      fixed
      height="64"
      color="primary"
      grow
      class="bottom-nav mb-2 mt-2"
    >
      <!-- Botón 1: Modal registrar partida -->
      <v-btn icon @click="openRegistroPartida" class="animated-btn">
        <img src="@/assets/icons/nuevaPartida.png" alt="Icono personalizado" width="50" height="50">
        Nueva Partida
      </v-btn>

      <!-- Botón 2: Ruta (cuando definas) -->
      <v-btn
        icon
        :to="{ path: '/mis-partidas' }"
        :class="{ 'active-btn': $route.path === '/mis-partidas' }"
        class="animated-btn"
      >
        <img src="@/assets/icons/misPartidas.png" alt="Icono personalizado" width="50" height="50">
        Mis Partidas
      </v-btn>
      
      <!-- Botón 3: Ruta (cuando definas) -->
      <v-btn
        icon
        :to="{ path: '/mis-torneos' }"
        :class="{ 'active-btn': $route.path === '/mis-torneos' }"
        class="animated-btn"
      >
        <img src="@/assets/icons/misTorneos.png" alt="Icono personalizado" width="50" height="50">
        Mis Torneos
      </v-btn>
    </v-bottom-navigation>

    <!-- Modal de registrar partida -->
    <v-dialog v-model="dialog" >
      <FormCrearPartida @close="dialog = false" @registroExitoso="refrescarPartidas" :isVisible="dialog"/>
    </v-dialog>

    <FooterComponent absolute="true"/>

  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import LogoutDialog from "@/components/Commons/LogoutDialog.vue";
import LogoAmonSulPNG from "@/assets/icons/Logo2.png";
import LogoAmonSulSVG from "@/assets/icons/logo_horizontal3.png";
import FooterComponent from '@/components/Commons/FooterComponent.vue';
import FormCrearPartida from '@/components/PartidaAmistosa/FormCrearPartida.vue';

const { logout } = useAuth();
const router = useRouter();
const drawer = ref(false);
const mostrarDialogoLogout = ref(false);
const { isAuthenticated } = useAuth();

const dialog = ref(false)
const openRegistroPartida = () => {
  dialog.value = true
}

const handleLogout = async () => {
  await logout();
  router.push({ name: "inicio-sesion" });
};
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
