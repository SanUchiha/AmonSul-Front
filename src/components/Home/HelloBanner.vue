<template>
    <v-card
      class="mb-6 pa-4"
      rounded="xl"
      color="deep-purple-accent-1"
      elevation="2"
    >
      <v-row align="center">
        <v-col cols="9">
          <div class="text-h5 font-weight-bold mb-1">
            ¡Hola, {{ userName }}!
          </div>
          <div class="text-subtitle-2">
            ¿Listo para tu próxima batalla?
          </div>
        </v-col>
  
        <v-col cols="3" class="text-end">
          <v-avatar size="48" color="indigo">
            <v-icon size="32">mdi-sword-cross</v-icon>
          </v-avatar>
        </v-col>
      </v-row>
    </v-card>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    userName: {
      type: String,
      required: true
    }
  })
  </script>
  