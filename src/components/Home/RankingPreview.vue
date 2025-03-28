<template>
    <v-card class="mb-6" rounded="lg" color="green-lighten-5">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Tu posición en el ranking</span>
        <v-btn icon="mdi-arrow-right" variant="text" @click="goToRanking" />
      </v-card-title>
  
      <v-card-text>
        <div class="text-subtitle-1 mb-2">
          Estás en el puesto <strong>#{{ ranking.position }}</strong>
        </div>
        <div class="text-body-2">
          <v-icon start icon="mdi-trophy" class="me-1" />
          {{ ranking.points }} puntos acumulados
        </div>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
    ranking: {
      type: Object,
      required: true
    }
  })
  
  const router = useRouter()
  
  function goToRanking() {
    router.push({ name: 'elo' })
  }
  </script>
  