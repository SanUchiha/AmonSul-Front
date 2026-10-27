<template>
  <CardPartidaLectura
    :contexto="match.esElo ? 'ELO' : ''"
    :fecha="formatFechaSpaWhitoutAsync(match.fechaPartida)"
    :jugador1="{
      idUsuario: match.idUsuario1,
      nick: match.nickUsuario1,
      ejercito: match.ejercitoUsuario1,
      puntos: match.resultadoUsuario1,
    }"
    :jugador2="{
      idUsuario: match.idUsuario2,
      nick: match.nickUsuario2,
      ejercito: match.ejercitoUsuario2,
      puntos: match.resultadoUsuario2,
    }"
    :escenario="match.escenarioPartida"
    :puntosPartida="match.puntosPartida"
    :idGanador="match.ganadorPartida"
    :idUsuarioDestacado="idUsuario"
  />
</template>

<script setup lang="ts">
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { formatFechaSpaWhitoutAsync } from "@/utils/Fecha";
import CardPartidaLectura from "@/components/Commons/CardPartidaLectura.vue";

//eslint-disable-next-line no-undef
defineProps<{
  match: ViewPartidaAmistosaDTO;
  idUsuario: number;
}>();
</script>
