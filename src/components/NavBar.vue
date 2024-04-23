<template>
     <nav>
    <router-link :to="{ name: 'inicio' }">Inicio</router-link> |
    <router-link :to="{ name: 'inicio-sesion' }">Inicio sesión</router-link> |
    <router-link :to="{ name: 'contacto' }">Contacto</router-link> |
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
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>