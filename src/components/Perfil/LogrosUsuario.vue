<template>
    <v-card class="section-card achievements-section">
        <h3>Logros</h3>
        <v-divider class="mb-3"></v-divider>
        <v-row>
        <v-col v-for="achievement in player.achievements" :key="achievement" cols="12" md="4">
            <v-card class="text-center pa-4" elevation="3">
            <h3 >{{ achievement.title }}</h3>
            <img :src="achievement.icon" alt="Icono personalizado" width="100" height="100">
            <p v-html="achievement.description" class="text-body-2"></p>
            <p>{{ achievement.exp }}px</p>
            </v-card>
        </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import { ref } from "vue";
import ELO from '@/assets/icons/ELO.png';
import clasificacion from "@/assets/icons/clasificacion.png";
import gestionTorneos from "@/assets/icons/gestionTorneos.png";

const player = ref({
    name: "Aragorn, Rey de Gondor",
    clan: "Hijos de Númenor",
    location: "Minas Tirith",
    gamesPlayed: 150,
    wins: 90,
    losses: 40,
    draws: 20,
    rank: "Capitán",
    level: 12,
    experience: 750,
    experienceToNextLevel: 1000,
    achievements: [
          { icon: gestionTorneos, title: 'Campeón de la Última Alianza', description: "Gana un torneo con la lista <strong><u>The Last Alliance</u></strong>.", exp: 500 },
          { icon: ELO, title: 'Defensor de Gondor', description: "Encadena 5 victorias seguidas con <strong><u>Atop the Wall</u></strong>.", exp: 200 },
          { icon: clasificacion, title: 'Señor de la Guerra', description: 'Has jugado 50 torneos.', exp: 1000 },
        ],
  });
</script>