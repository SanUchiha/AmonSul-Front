import ContactoView from '@/views/ContactoView.vue'
import DetalleJugadorView from '@/views/DetalleJugadorView.vue'
import DetallePartidasView from '@/views/DetallePartidasView.vue'
import DetalleToneoLiveView from '@/views/DetalleToneoLiveView.vue'
import DetalleTorneoView from '@/views/DetalleTorneoView.vue'
import InicioSesionView from '@/views/InicioSesionView.vue'
import InicioView from '@/views/InicioView.vue'
import JugadoresView from '@/views/JugadoresView.vue'
import PartidasAmistoasView from '@/views/PartidasAmistoasView.vue'
import PerfilUsuarioView from '@/views/PerfilUsuarioView.vue'
import RegistroUsuarioView from '@/views/RegistroUsuarioView.vue'
import TorneosView from '@/views/TorneosView.vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [

  { path: '/contacto', component: ContactoView },
  { path: '/detalle-jugador/:idJugador', component: DetalleJugadorView },
  { path: '/detalle-partida/:idPartida', component: DetallePartidasView },
  { path: '/detalle-torneo/:idTorneo', component: DetalleTorneoView },
  { path: '/detalle-torneo-live/:idTorneo', component: DetalleToneoLiveView },
  { path: '/inicio-sesion', component: InicioSesionView },
  { path: '/registro-usuario', component: RegistroUsuarioView },
  { path: '/inicio', component: InicioView },
  { path: '/jugadores', component: JugadoresView },
  { path: '/partidas-amistosas', component: PartidasAmistoasView },
  { path: '/perfil-usuario/:IdUsuario', component: PerfilUsuarioView },
  { path: '/torneos', component: TorneosView },
  { path: '/', redirect: '/inicio' },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
