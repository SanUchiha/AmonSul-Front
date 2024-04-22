<template>
  <nav>
    <router-link :to="{ name: 'inicio' }">Inicio</router-link> |
    <router-link :to="{ name: 'inicio-sesion' }">Inicio sesión</router-link> |
    <router-link :to="{ name: 'contacto' }">Contacto</router-link> |
    <router-link :to="{ name: 'detalle-jugador', params: { idJugador: 5 } }"
      >Detalle jugador</router-link
    >

    |
    <router-link :to="{ name: 'detalle-partida', params: { idPartida: 1 } }"
      >Detalle partida</router-link
    >
    |
    <router-link :to="{ name: 'detalle-torneo', params: { idTorneo: 1 } }"
      >Detalle torneo</router-link
    >
    |
    <router-link
      :to="{ name: 'detalle-torneo-live', params: { idTorneoLive: 1 } }"
      >Detalle torneo live</router-link
    >
    |
    <router-link :to="{ name: 'registro-usuario' }"
      >Registro de usuario</router-link
    >
    | <router-link :to="{ name: 'jugadores' }">Jugadores</router-link> |
    <router-link :to="{ name: 'partidas-amistosas' }"
      >Partidas amistosas</router-link
    >
    |
    <router-link :to="{ name: 'perfil-usuario', params: { idUsuario: 1 } }"
      >Perfil usuario</router-link
    >
    |
    <router-link :to="{ name: 'torneos' }">Torneos</router-link>
  </nav>
  <router-view />
</template>

<script setup lang="ts"></script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: violet;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: blueviolet;
}

nav a.router-link-exact-active {
  color: goldenrod;
}
</style>
