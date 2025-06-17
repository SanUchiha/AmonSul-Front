<template>
  <v-card class="pa-3">
    <v-card-title class="text-h6">
      <strong> {{ equipo.nombreEquipo || "Equipo sin nombre" }}</strong>
    </v-card-title>

    <v-card-text>
      <ul class="pl-4">
        <li
          v-for="integrante in equipo.inscripciones"
          :key="integrante.idUsuario"
        >
          {{ integrante.nick }}
        </li>
      </ul>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { EquipoDTO } from "@/interfaces/Inscripcion";
import { defineProps } from "vue";

const props = defineProps<{
  equipo: EquipoDTO;
}>();
</script>
