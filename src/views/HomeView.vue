<template>
  <v-container>
    <!-- Hero -->
    <v-row justify="center" class="mt-4 mb-6">
      <v-col cols="12" class="text-center">
        <img src="@/assets/icons/logo_horizontal2.webp" alt="Amon Sûl" height="80" class="mb-4" />
        <h1 class="text-h4 font-weight-bold">Bienvenido a Amon Sûl</h1>
        <p class="text-subtitle-1 mt-2">
          La plataforma de gestión de torneos del wargame Middle-earth Strategy Battle Game.
          Organiza torneos, consulta estadísticas de tus partidas, el ranking ELO y sigue la competición en tiempo real.
        </p>
      </v-col>
    </v-row>

    <!-- Novedades -->
    <v-row class="mt-8 mb-2">
      <v-col cols="12" class="text-center">
        <h2 class="text-h5 font-weight-bold mb-4">Últimas novedades</h2>
      </v-col>
      <v-col cols="12">
        <v-timeline align="start" side="end">
          <v-timeline-item
            v-for="novedad in novedades"
            :key="novedad.titulo"
            dot-color="primary"
            size="small"
          >
            <template v-slot:opposite>
              <span class="text-caption font-weight-bold">{{ novedad.fecha }}</span>
            </template>
            <v-card class="pa-3" elevation="2">
              <h3 class="text-h6">{{ novedad.titulo }}</h3>
              <p class="text-body-2">{{ novedad.descripcion }}</p>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-col>
    </v-row>

    <!-- Características -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="text-h5 font-weight-bold mb-4">¿Qué puedes hacer?</h2>
      </v-col>
      <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="4">
        <v-card class="text-center pa-4" elevation="3" height="100%">
          <img :src="feature.icon" :alt="feature.title" width="72" height="72" class="mb-3" />
          <h3 class="text-h6 mb-2">{{ feature.title }}</h3>
          <p class="text-body-2">{{ feature.description }}</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import gestionTorneos from "@/assets/icons/gestionTorneos.png";
import ELO from "@/assets/icons/ELO.png";
import clasificacion from "@/assets/icons/clasificacion.png";
import misPartidas from "@/assets/icons/misPartidas.png";
import usuarios from "@/assets/icons/usuarios.png";

export default {
  data() {
    return {
      novedades: [
        {
          fecha: "Agosto 2026",
          titulo: "Estadísticas de ejércitos",
          descripcion:
            "Nueva sección de estadísticas accesible desde el menú. Muestra el ranking de ejércitos por bando (Bien y Oscuridad) con los mejores y peores win rates, ocultando ejércitos con menos de 20 partidas. También permite consultar el rating detallado de cualquier ejército aplicando filtros por fechas, ejércitos o bando rival, y rango de puntos de partida.",
        },
        {
          fecha: "Agosto 2026",
          titulo: "Eliminar ronda",
          descripcion:
            "El administrador de un torneo puede eliminar la última ronda generada desde la pantalla de gestión. La operación borra todas las partidas de esa ronda y deja el torneo listo para volver a generar emparejamientos. Solo se puede eliminar la ronda más reciente.",
        },
        {
          fecha: "Agosto 2026",
          titulo: "Resumen de torneo",
          descripcion:
            "Nueva pestaña 'Resumen' en la vista de 'Resultados' en torneos. Muestra de un vistazo la fecha de inicio, el estado de cada ronda, si las listas y la clasificación son visibles, y el podio final. Carga de forma inmediata sin esperar al resto de datos. En torneos por equipos incluye podio individual y podio por equipos. Si las listas están disponibles, permite descargarlas en PDF directamente desde esta pantalla.",
        },
        {
          fecha: "Agosto 2026",
          titulo: "Contacto en torneos",
          descripcion:
            "Los organizadores ya pueden añadir un email o teléfono de contacto al crear un torneo. Si se rellena, será visible para los jugadores en el detalle del torneo.",
        },
        {
          fecha: "Agosto 2026",
          titulo: "Vista Home",
          descripcion:
            "Nueva pantalla de bienvenida con novedades y resumen de funcionalidades de la app.",
        },
      ],
      features: [
        {
          icon: gestionTorneos,
          title: "Gestión de torneos",
          description:
            "Crea y administra torneos individuales o por equipos con emparejamientos automáticos.",
        },
        {
          icon: ELO,
          title: "Sistema ELO",
          description:
            "Ranking competitivo actualizado tras cada torneo de mas de 16 jugadores para reflejar el nivel actual de cada jugador.",
        },
        {
          icon: clasificacion,
          title: "Clasificaciones",
          description:
            "Consulta la tabla de posiciones individual y por equipos de cada torneo.",
        },
        {
          icon: misPartidas,
          title: "Mis partidas",
          description:
            "Registra tus partidas amistosas y lleva un historial completo de tus resultados.",
        },

        {
          icon: usuarios,
          title: "Comunidad",
          description:
            "Consulta el perfil de otros jugadores, sus ejércitos favoritos y su historial.",
        }
      ],
    };
  },
};
</script>
