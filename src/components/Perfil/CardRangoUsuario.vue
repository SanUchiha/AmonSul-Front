<template>
    <v-card class="section-card rank-section">
        <h3>Rango / Nivel</h3>
        <v-divider class="mb-3"></v-divider>
        <p class="mb-3"><strong>Rango:</strong> {{ player.rank }}</p>
        <v-progress-linear :model-value="expProgress" color="amber darken-2" height="25">
        <p>Nivel: {{ player.level }}</p>
        </v-progress-linear>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const expProgress = computed(() => (player.value.experience / player.value.experienceToNextLevel) * 100);

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
  });
</script>