<template>
  <nav>
    <router-link :to="{ name: 'inicio' }">Inicio</router-link> |
<router-link :to="{ name: 'inicio-sesion' }">Inicio sesión</router-link> |
<router-link :to="{name: 'contacto'}">Contacto</router-link> |
<router-link :to="{ name: 'detalle-jugador/:id' }">Detalle jugador</router-link> |
<router-link :to="{ name: 'detalle-partida/:idPartida' }">Detalle partida</router-link> |
<router-link :to="{ name: 'detalle-torneo/:idTorneo' }">Detalle torneo</router-link> |
<router-link :to="{ name: 'detalle-torneo-live/:idTorneo' }">Detalle torneo live</router-link> |
<router-link :to="{name:'registro-usuario'}">Registro de usuario</router-link> |
<router-link :to="{name:'jugadores'}">Jugadores</router-link> |
<router-link :to="{name:'partidas-amistosas'}">Partidas amistosas</router-link> |
<router-link :to="{ name: 'perfil-usuario/:idUsuario' }">Perfil usuario</router-link> |
<router-link :to="{name:'torneos'}">Torneos</router-link>

  </nav>
  <router-view />
</template>

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
