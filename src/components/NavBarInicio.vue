<template>
  <nav>
    <router-link :to="{ name: 'inicio-sesion' }">Inicio sesión</router-link> |

    <router-link :to="{ name: 'registro-usuario' }"
      >Registro de usuario</router-link
    >
    |
    <router-link :to="{ name: 'contacto' }">Contacto</router-link>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped></style>
