// src/utils/getSuggestedTip.js

export function getSuggestedTip(userStats) {
    const tips = []
  
    if (!userStats.hasRegisteredMatch) {
      tips.push({
        message: 'Puedes registrar tus partidas aunque no seas el organizador.',
        actionLabel: 'Registrar una partida',
        route: { name: 'RegisterMatch' }
      })
    }
  
    if (!userStats.hasJoinedTournament) {
      tips.push({
        message: 'Inscribirte en torneos es fácil y rápido.',
        actionLabel: 'Ver torneos disponibles',
        route: { name: 'TournamentCalendar' }
      })
    }
  
    if (!userStats.hasVisitedRanking) {
      tips.push({
        message: 'Consulta tu posición y compite por subir en el ranking.',
        actionLabel: 'Ver ranking',
        route: { name: 'RankingView' }
      })
    }
  
    if (!userStats.hasActivatedNotifications) {
      tips.push({
        message: 'Activa las notificaciones para no perderte los torneos cercanos.',
        actionLabel: 'Activar notificaciones',
        route: { name: 'Settings' }
      })
    }
  
    // Si no hay tips específicos, puedes mostrar uno genérico
    if (tips.length === 0) {
      tips.push({
        message: 'Gracias por usar la app. ¡Sigue disfrutando del hobby!',
        actionLabel: 'Explorar la app',
        route: { name: 'Home' }
      })
    }
  
    // Elegimos uno aleatorio entre los disponibles
    return tips[Math.floor(Math.random() * tips.length)]
  }
  