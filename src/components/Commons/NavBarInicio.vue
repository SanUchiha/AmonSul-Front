<template>
  <v-container>
    <v-app-bar scroll-behavior="elevate" scroll-threshold="278">
      <v-btn @click="goToLogin"> Login </v-btn>
      <v-btn @click="goToRegistration"> Registro </v-btn>
      <v-btn @click="goToContact"> Contacto </v-btn>
    </v-app-bar>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const goToLogin = () => router.push({ name: "inicio-sesion" });
const goToRegistration = () => router.push("registro-usuario");
const goToContact = () => router.push("contacto");
</script>

<style scoped></style>
