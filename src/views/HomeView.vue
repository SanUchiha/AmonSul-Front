<template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <HelloBanner :user-name="userName" />
        </v-col>
  
        <v-col cols="12">
          <NewsSection :news="latestNews" />
        </v-col>
  
        <v-col sm="4" cols="12" v-if="nextTournament">
          <NextTournamentCard :tournament="nextTournament" />
        </v-col>
  
        <v-col sm="4" cols="12" v-if="rankingPosition">
          <RankingPreview :ranking="rankingPosition" />
        </v-col>

        <v-col sm="4" cols="12" v-if="quickTip">
          <QuickTips :tip="quickTip" />
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  // Importar componentes hijos
  import HelloBanner from '@/components/Home/HelloBanner.vue'
  import NewsSection from '@/components/Home/NewsSection.vue'
  import NextTournamentCard from '@/components/Home/NextTournamentCard.vue'
  import RankingPreview from '@/components/Home/RankingPreview.vue'
  import { getSuggestedTip } from '@/utils/getSuggestedTip'
  import QuickTips from '@/components/Home/QuickTips.vue'

  // Datos de ejemplo (luego los sustituimos por peticiones reales)
  const userName = 'Jose'
  const latestNews = ref([])
  const nextTournament = ref(null)
  const rankingPosition = ref(null)
  const quickTip = ref(null)
  
  onMounted(async () => {
    // Aquí puedes hacer tus peticiones a la API
    const userStats = await fetchUserStats()
    quickTip.value = getSuggestedTip(userStats)

    latestNews.value = await fetchLatestNews()
    nextTournament.value = await fetchNextTournament()
    rankingPosition.value = await fetchUserRanking()
  })
  
  // Simulamos estadísticas del usuario (sustituir por tus datos reales)
  function fetchUserStats() {
    return Promise.resolve({
      hasRegisteredMatch: false,
      hasJoinedTournament: true,
      hasVisitedRanking: false,
      hasActivatedNotifications: false
    })
  }
  // Simulación de APIs (luego las cambiamos por reales)
  function fetchLatestNews() {
    return Promise.resolve([
      { title: 'Ya puedes retar jugadores', date: '2025-03-25' },
      { title: 'Ranking actualizado', date: '2025-03-24' }
    ])
  }
  function fetchNextTournament() {
    return Promise.resolve({
      name: 'Torneo de Lothlórien',
      date: '2025-03-30',
      location: 'Madrid'
    })
  }
  function fetchUpcomingTournaments() {
    return Promise.resolve([
      { name: 'Torneo Rohan', date: '2025-04-10' },
      { name: 'Minas Tirith Team Battle', date: '2025-04-20' }
    ])
  }
  function fetchUserRanking() {
    return Promise.resolve({ position: 21, points: 1280 })
  }
  function fetchRecentActivity() {
    return Promise.resolve([
      'Ana ha registrado una partida contra Carlos',
      '12 jugadores nuevos en el Torneo del Anillo'
    ])
  }
  </script>