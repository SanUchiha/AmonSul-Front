<template>
    <v-card flat class="mb-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Novedades</span>
        <v-btn variant="text" @click="emitShowMore">Ver todas</v-btn>
      </v-card-title>
  
      <v-divider />
  
      <v-list lines="three">
        <v-list-item
          v-for="(item, index) in news.slice(0, 3)"
          :key="index"
        >
          <template #prepend>
            <v-icon class="me-3" color="primary">mdi-star-circle</v-icon>
          </template>
  
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ formatDate(item.date) }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    news: {
      type: Array,
      required: true
    }
  })
  
  const emit = defineEmits(['show-more'])
  
  function emitShowMore() {
    emit('show-more')
  }
  
  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
  </script>
  