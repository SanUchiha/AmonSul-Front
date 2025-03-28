<template>
    <v-card color="indigo-lighten-5" class="mb-6" rounded="lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h6 font-weight-bold">Tu próximo torneo</div>
        <v-btn icon="mdi-arrow-right" variant="text" @click="goToTournament" />
      </v-card-title>
  
      <v-card-text>
        <div class="text-subtitle-1 font-weight-medium mb-2">{{ tournament.name }}</div>
        <div class="text-body-2">
          <v-icon start icon="mdi-calendar" class="me-1" />
          {{ formatDate(tournament.date) }}
        </div>
        <div class="text-body-2">
          <v-icon start icon="mdi-map-marker" class="me-1" />
          {{ tournament.location }}
        </div>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const props = defineProps({
    tournament: {
      type: Object,
      required: true
    }
  })
  
  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'short'
    })
  }
  
  function goToTournament() {
    //router.push({ name: 'TournamentDetail', params: { id: tournament.id } })
  }
  </script>
  