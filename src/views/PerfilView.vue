<template>
    <v-container class="profile-container">
      <v-row>
        <!-- Columna Izquierda (Perfil) -->
        <v-col cols="12" md="4">
          <v-card class="profile-section">
            <v-avatar size="120" class="avatar">
              <v-img :src="player.avatar" alt="Avatar"></v-img>
            </v-avatar>
            <h2 class="player-name">{{ player.name }}</h2>
            <p class="profile-info"><strong>Clan:</strong> {{ player.clan }}</p>
            <p class="profile-info"><strong>Población:</strong> {{ player.location }}</p>
          </v-card>
        </v-col>
        
        <!-- Columna Derecha (Estadísticas, Rango/Nivel, Logros) -->
        <v-col cols="12" md="8">
          <!-- Sección de Estadísticas -->
          <v-card class="section-card stats-section">
            <h3>Estadísticas</h3>
            <v-progress-linear :model-value="100" color="grey darken-3" height="15" class="stat-bar">
              <p>Partidas Jugadas: {{ player.gamesPlayed }}</p>
            </v-progress-linear>
            <v-progress-linear :model-value="winRate" color="green accent-4" height="15" class="stat-bar">
              <p>Victorias: {{ player.wins }}</p>
            </v-progress-linear>
            <v-progress-linear :model-value="lossRate" color="red accent-3" height="15" class="stat-bar">
              <p>Derrotas: {{ player.losses }}</p>
            </v-progress-linear>
            <v-progress-linear :model-value="drawRate" color="blue accent-2" height="15" class="stat-bar">
              <p>Empates: {{ player.draws }}</p>
            </v-progress-linear>
          </v-card>
          
          <!-- Sección de Rango/Nivel -->
          <v-card class="section-card rank-section">
            <h3>Rango / Nivel</h3>
            <p><strong>Rango:</strong> {{ player.rank }}</p>
            <v-progress-linear :model-value="expProgress" color="amber darken-2" height="15">
              <p>Nivel: {{ player.level }}</p>
            </v-progress-linear>
          </v-card>
          
          <!-- Sección de Logros -->
          <v-card class="section-card achievements-section">
            <h3>Logros</h3>
            <ul class="achievement-list">
              <li v-for="achievement in player.achievements" :key="achievement">{{ achievement }}</li>
            </ul>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { computed, ref } from "vue";
  
  const player = ref({
    name: "Aragorn, Rey de Gondor",
    avatar: "https://via.placeholder.com/120",
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
    achievements: ["Campeón de la Última Alianza", "Defensor de Gondor", "Maestro en Estrategia"]
  });
  
  const winRate = computed(() => (player.value.wins / player.value.gamesPlayed) * 100);
  const lossRate = computed(() => (player.value.losses / player.value.gamesPlayed) * 100);
  const drawRate = computed(() => (player.value.draws / player.value.gamesPlayed) * 100);
  const expProgress = computed(() => (player.value.experience / player.value.experienceToNextLevel) * 100);
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 1000px;
    margin: auto;
    background: #1e1e2f;
    padding: 20px;
    border-radius: 12px;
  }
  
  .profile-section {
    padding: 20px;
    text-align: center;
    background: linear-gradient(135deg, #2c3e50, #4ca1af);
    color: white;
    border-radius: 12px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  }
  
  .avatar {
    margin-bottom: 10px;
    border: 3px solid #f5e1a4;
  }
  
  .player-name {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #f5e1a4;
  }
  
  .profile-info {
    font-size: 16px;
    color: #e0e0e0;
  }
  
  .section-card {
    margin-bottom: 20px;
    padding: 20px;
    background: #2a2a40;
    color: white;
    border-radius: 12px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  }
  
  .stat-bar {
    margin-top: 10px;
    font-size: 14px;
  }
  
  .achievement-list li {
    list-style-type: none;
    background: #4ca1af;
    padding: 8px;
    margin: 5px 0;
    border-radius: 8px;
    color: #fff;
    text-align: center;
  }
  </style>
  