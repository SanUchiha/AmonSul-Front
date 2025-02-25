<template>
    <v-card class="section-card stats-section">
        <h3>Estadísticas</h3>
        <v-divider></v-divider>
        <v-row class="mt-2 mb-2 text-left">
        <v-col cols="4">
            <span class="font-weight-bold">{{ player.gamesPlayed }} partidas jugadas</span>
        </v-col>
        </v-row>

        <v-progress-linear height="30">
        <v-progress-linear
            :model-value="winRate"
            color="green"
            height="30"
            class="position-absolute"
        ></v-progress-linear>
        <v-progress-linear
            :model-value="drawRate"
            color="yellow"
            height="30"
            class="position-absolute"
            :style="{ left: `${winRate}%` }"
        ></v-progress-linear>
        <v-progress-linear
            :model-value="lossRate"
            color="red"
            height="30"
            class="position-absolute"
            :style="{ left: `${winRate + drawRate}%` }"
        ></v-progress-linear>
        </v-progress-linear>

        <v-row class="mt-2 text-center">
        <v-col cols="4">
            <span class="text-green font-weight-bold">{{ player.wins }} Ganadas</span>
        </v-col>
        <v-col cols="4">
            <span class="text-blue font-weight-bold">{{ player.draws }} Empatadas</span>
        </v-col>
        <v-col cols="4">
            <span class="text-red font-weight-bold">{{ player.losses }} Perdidas</span>
        </v-col>
        </v-row>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
    
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

const winRate = computed(() => (player.value.wins / player.value.gamesPlayed) * 100);
const lossRate = computed(() => (player.value.losses / player.value.gamesPlayed) * 100);
const drawRate = computed(() => (player.value.draws / player.value.gamesPlayed) * 100);

</script>