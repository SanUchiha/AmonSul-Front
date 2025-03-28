<template>
    <v-card class="mb-6" rounded="lg" color="blue-lighten-5">
      <v-card-title class="text-h6 font-weight-bold">
        ¿Sabías que...?
      </v-card-title>
  
      <v-card-text class="text-body-2">
        {{ tip.message }}
      </v-card-text>
  
      <v-card-actions>
        <v-btn variant="text" @click="goToAction">
          {{ tip.actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
    tip: {
      type: Object,
      required: true
      // Ejemplo de objeto tip:
      // {
      //   message: 'Puedes registrar tus partidas aunque no seas el organizador.',
      //   actionLabel: 'Registrar una partida',
      //   route: { name: 'RegisterMatch' }
      // }
    }
  })
  
  const router = useRouter()
  
  function goToAction() {
    if (props.tip.route) router.push(props.tip.route)
  }
  </script>
  