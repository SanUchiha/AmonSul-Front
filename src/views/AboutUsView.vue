<template>
    <v-container>
      <!-- Encabezado -->
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h1 class="text-h4 font-weight-bold">Sobre nosotros</h1>
          <p class="text-subtitle-1">Descubre las características de nuestra app y lo que viene en un futuro no muy lejano...</p>
        </v-col>
      </v-row>
  
      <!-- Sección Features -->
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mb-4">Características</h2>
        </v-col>
        <v-col v-for="feature in features" :key="feature.title" cols="12" md="4">
          <v-card class="text-center pa-4" elevation="3">
            <img :src="feature.icon" alt="Icono personalizado" width="100" height="100">
            <h3 class="text-h6 mt-3">{{ feature.title }}</h3>
            <p class="text-body-2">{{ feature.description }}</p>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Sección Roadmap -->
      <v-row>
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mt-8 mb-4">Nuestra hoja de ruta</h2>
        </v-col>
        <v-col cols="12">
          <v-timeline align="start" dense>
            <v-timeline-item v-for="item in roadmap" :key="item.title" :icon-color="item.color" small>
              <template v-slot:opposite>
                <span class="text-caption font-weight-bold">{{ item.date }}</span>
              </template>
              <v-card class="pa-3" elevation="2">
                <h3 class="text-h6">{{ item.title }}</h3>
                <p class="text-body-2">{{ item.description }}</p>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import ELO from '@/assets/icons/ELO.png';
  import clasificacion from '@/assets/icons/clasificacion.png';
  import gestionTorneos from '@/assets/icons/gestionTorneos.png';

  export default {
    data() {
      return {
        features: [
          { icon: gestionTorneos, title: 'Torneos organizados', description: 'Crea y gestiona torneos fácilmente.' },
          { icon: ELO, title: 'Sistema de ELO', description: 'Ranking competitivo actualizado en tiempo real.' },
          { icon: clasificacion, title: 'Clasificación', description: 'Clasificación de jugadores individual y por equipos.' },
        ],
        roadmap: [
          { date: 'Q2 2025', title: 'Torneos por equipos', description: 'Creación y gestión de torneos a parejas y por equipos.', color: 'primary' },
          { date: 'Q3 2025', title: 'Pagos de inscripción', description: 'Gestión del pago de la inscripción a un torneo a través de la app.', color: 'primary' },
          //{ date: 'Q3 2025', title: 'Sistema de Clanes', description: 'Permite la creación y gestión de clanes.', color: 'primary' },
          { date: 'Q4 2025', title: 'Integración con Discord', description: 'Notificaciones y chat en tiempo real.', color: 'red' },
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .v-card {
    border-radius: 12px;
  }
  </style>