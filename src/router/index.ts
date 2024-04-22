import ContactoView from "@/views/ContactoView.vue";
import DetalleJugadorView from "@/views/DetalleJugadorView.vue";
import DetallePartidasView from "@/views/DetallePartidasView.vue";
import DetalleToneoLiveView from "@/views/DetalleToneoLiveView.vue";
import DetalleTorneoView from "@/views/DetalleTorneoView.vue";
import InicioSesionView from "@/views/InicioSesionView.vue";
import InicioView from "@/views/InicioView.vue";
import JugadoresView from "@/views/JugadoresView.vue";
import PartidasAmistoasView from "@/views/PartidasAmistoasView.vue";
import PerfilUsuarioView from "@/views/PerfilUsuarioView.vue";
import RegistroUsuarioView from "@/views/RegistroUsuarioView.vue";
import TorneosView from "@/views/TorneosView.vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  { path: "/contacto", name: "contacto", component: ContactoView },
  {
    path: "/detalle-jugador/:id",
    name: "detalle-jugador",
    component: DetalleJugadorView,
    props: true,
  },
  {
    path: "/detalle-partida/:idPartida",
    name: "detalle-partida",
    component: DetallePartidasView,
  },
  {
    path: "/detalle-torneo/:idTorneo",
    name: "detalle-torneo",
    component: DetalleTorneoView,
  },
  {
    path: "/detalle-torneo-live/:idTorneo",
    name: "detalle-torneo-live",
    component: DetalleToneoLiveView,
  },
  {
    path: "/inicio-sesion",
    name: "inicio-sesion",
    component: InicioSesionView,
  },
  {
    path: "/registro-usuario",
    name: "registro-usuario",
    component: RegistroUsuarioView,
  },
  { path: "/inicio", name: "inicio", component: InicioView },
  { path: "/jugadores", name: "jugadores", component: JugadoresView },
  {
    path: "/partidas-amistosas",
    name: "partidas-amistosas",
    component: PartidasAmistoasView,
  },
  {
    path: "/perfil-usuario/:idUsuario",
    name: "perfil-usuario",
    component: PerfilUsuarioView,
  },

  { path: "/torneos", name: "torneos", component: TorneosView },
  { path: "/", redirect: "/inicio" },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
