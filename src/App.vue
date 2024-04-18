<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/inicio">Inicio</router-link> |
    <router-link to="/inicio-sesion">Inicio sesion</router-link> |
    <router-link to="/contacto">Contacto</router-link> |
    <router-link to="/detalle-jugador/:idJugador">Detalle jugador</router-link>
    |
    <router-link to="/detalle-partida/:idPartida">Detalle partida</router-link>
    |
    <router-link to="/detalle-torneo/:idTorneo">Detalle torneo</router-link> |

    <router-link to="/detalle-torneo-live/:idTorneo"
      >Detalle torneo live</router-link
    >
    | <router-link to="/registro-usuario">Registro de usuario</router-link> |
    <router-link to="/jugadores">Jugadores</router-link> |
    <router-link to="/partidas-amistosas">Partidas amistosas</router-link> |
    <router-link to="/perfil-usuario/:IdUsuario">Perfil usuario</router-link> |
    <router-link to="/torneos">Torneos</router-link>
  </nav>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
