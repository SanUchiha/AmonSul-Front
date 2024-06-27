<template>
  <v-container>
    <v-app-bar scroll-behavior="collapse elevate" scroll-threshold="278">
      <v-btn @click="goToInicio"> Home </v-btn>
      <v-btn @click="goToTorneos"> Torneos </v-btn>
      <v-btn @click="goToJugadores"> Jugadores </v-btn>
      <v-btn @click="goToPartidas"> Partidas </v-btn>
      <v-btn @click="goToConfig"> Configuración </v-btn>
      <v-btn @click="goToContact"> Contacto </v-btn>
    </v-app-bar>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const goToInicio = () => router.push("inicio");
const goToTorneos = () => router.push("torneos");
const goToJugadores = () => router.push("jugadores");
const goToPartidas = () => router.push("partidas-amistosas");
const goToConfig = () => router.push("configuracion");
const goToContact = () => router.push("contactoHome");
</script>

<style scoped></style>
