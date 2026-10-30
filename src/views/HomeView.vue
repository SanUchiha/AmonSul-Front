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
    <v-row class="mt-8 mb-2" justify="center">
      <v-col cols="12" class="text-center">
        <h2 class="text-h5 font-weight-bold mb-4">Últimas novedades</h2>
      </v-col>
      <v-col cols="12" md="10" lg="8">
        <!-- Compacta: la fecha va dentro de la tarjeta y el texto usa todo el ancho, también en móvil -->
        <v-timeline align="start" side="end" density="compact" truncate-line="start">
          <v-timeline-item
            v-for="novedad in novedades"
            :key="novedad.titulo"
            dot-color="primary"
            size="small"
          >
            <v-card class="pa-3" elevation="2">
              <span class="text-caption font-weight-bold text-primary">{{ novedad.fecha }}</span>
              <h3 class="text-h6 novedad-titulo">{{ novedad.titulo }}</h3>
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
          fecha: "Octubre 2026",
          titulo: "Llegan las Ligas",
          descripcion:
            "Nuevo formato de evento: todos contra todos por jornadas. Al crear un evento, elige Liga como tipo y decide si es solo ida o ida y vuelta y si cuenta para el ELO. Cada jugador elige su ejército al inscribirse y lo lleva toda la liga, pero puede cambiar de lista antes de cada partida: cada partida guarda la lista con la que se jugó. Las jornadas se generan todas a la vez y el calendario es abierto: quedáis con vuestro rival y metéis el resultado en Mis partidas, dentro de la liga. Si la liga cuenta para el ELO, cada partida suma en cuanto la validan los dos jugadores.",
        },
        {
          fecha: "Octubre 2026",
          titulo: "Las Ligas ahora se llaman Circuitos",
          descripcion:
            "Lo que hasta ahora llamábamos Ligas, como Amon Sûl 2026, pasa a llamarse Circuitos: agrupan varios torneos en una clasificación conjunta. Están en el menú, en Circuitos, con los mismos torneos y clasificaciones de siempre. Así dejamos el nombre de Liga para un nuevo formato de torneo que llegará pronto.",
        },
        {
          fecha: "Octubre 2026",
          titulo: "Torneos a Parejas",
          descripcion:
            "Nuevo tipo de torneo: dos contra dos en la misma mesa, con un único resultado por partida que mete el capitán. El organizador elige si cada pareja entrega una lista por jugador o una lista conjunta. Las partidas cuentan para el ELO con 16 jugadores o más: se usa la media de ELO de cada pareja y los dos jugadores ganan o pierden lo mismo. Los antiguos torneos de Parejas pasan a llamarse Equipos de 2, porque cada miembro juega su propia partida.",
        },
        {
          fecha: "Octubre 2026",
          titulo: "ELO ganado y perdido en torneos",
          descripcion:
            "Las partidas de torneo del perfil muestran cuánto ELO se ganó o se perdió en cada una, en verde o en rojo junto al resultado. Se ha recuperado también el ELO de la mayoría de torneos ya jugados. Los torneos que no cuentan para el ELO, con 7 partidas o menos en la primera ronda, no lo muestran.",
        },
        {
          fecha: "Octubre 2026",
          titulo: "Nuevas tarjetas de partida",
          descripcion:
            "Las partidas de torneo y amistosas del perfil tienen un diseño más limpio: el resultado se muestra desde el punto de vista del jugador que estás viendo. Pulsando en el nick del rival vas a su perfil y, en partidas de torneo, pulsando en el ejército se abre la lista de ese jugador si el organizador ha hecho visibles las listas.",
        },
        {
          fecha: "Octubre 2026",
          titulo: "Resultados de torneos en el perfil",
          descripcion:
            "Nueva pestaña 'Resultados' en el detalle de cada jugador con todos los torneos que ha jugado y su posición final. Al pulsar un torneo se despliega su actuación: victorias, empates y derrotas, puntos a favor y en contra y el ejército utilizado. Pulsando en el número de partidas se abre el detalle de cada partida jugada en ese torneo.",
        },
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
          title: "Gestión de eventos",
          description:
            "Crea y administra torneos individuales, por parejas o por equipos con emparejamientos automáticos, ligas de todos contra todos por jornadas y copas con fase de grupos y eliminatoria.",
        },
        {
          icon: ELO,
          title: "Sistema ELO",
          description:
            "Ranking competitivo que se actualiza tras cada torneo de 16 jugadores o más, y partida a partida en las ligas que cuentan para el ELO, para reflejar el nivel actual de cada jugador.",
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

<style scoped>
/* El mismo dorado que los títulos de las mesas en el directo */
.novedad-titulo {
  color: #ffcc00;
}
</style>
