<template>
  <v-app>
    <v-navigation-drawer v-if="isAuthenticated" v-model="drawer" app>
      <v-btn icon @click.stop="drawer = false" class="close-drawer-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-list>
        <v-list-item link to="/dashboard" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-icon>mdi-view-dashboard</v-icon>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-icon>mdi-calendar-text</v-icon>
            <v-list-item-title>Calendario</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/jugadores" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-icon>mdi-account-group</v-icon>
            <v-list-item-title>Usuarios</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/elo" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-icon>mdi-medal-outline</v-icon>
            <v-list-item-title>Clasificaciones</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/gestion-torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-icon>mdi-tune-vertical-variant</v-icon>
            <v-list-item-title>Gestión Torneos</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/resultados-torneos" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-icon>mdi-chart-bar</v-icon>
            <v-list-item-title>Resultados</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/perfil-usuario" v-if="isAuthenticated">
          <v-list-item-content class="d-flex ga-2">
            <v-icon>mdi-cog</v-icon>
            <v-list-item-title>Perfil</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon
        v-if="isAuthenticated"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title
        ><LogoAmonSulSVG class="icon" /><NameAmonSulSVG class="name"
      /></v-toolbar-title>
      <v-btn icon to="contacto">
        <v-icon>mdi-email</v-icon>
      </v-btn>
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
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";
import LogoutDialog from "@/components/Commons/LogoutDialog.vue";
import LogoAmonSulSVG from "@/assets/icons/logo_amonsul.svg";
import NameAmonSulSVG from "@/assets/icons/name_amonsul.svg";

const { logout } = useAuth();
const router = useRouter();
const drawer = ref(false);
const mostrarDialogoLogout = ref(false);
const { isAuthenticated } = useAuth();

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
</style>
