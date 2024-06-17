<template>
  <nav>
    <router-link :to="{ name: 'inicio' }">Inicio</router-link> |
    <router-link :to="{ name: 'torneos' }">Torneos</router-link> |
    <router-link :to="{ name: 'jugadores' }">Jugadores</router-link> |
    <router-link :to="{ name: 'partidas-amistosas' }"
      >Partidas amistosas</router-link
    >
    |
    <router-link :to="{ name: 'perfil-usuario', params: { idUsuario: 1 } }"
      >Perfil usuario</router-link
    >
    | <router-link :to="{ name: 'contactoHome' }">Contacto</router-link>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped></style>
