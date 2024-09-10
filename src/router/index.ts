import ContactoView from "@/views/ContactoView.vue";
import DetalleJugadorView from "@/views/DetalleJugadorView.vue";
import TorneoLiveView from "@/views/TorneoLiveView.vue";
import DetalleTorneoView from "@/views/DetalleTorneoView.vue";
import InicioSesionView from "@/views/InicioSesionView.vue";
import DashboardView from "@/views/DashboardView.vue";
import JugadoresView from "@/views/JugadoresView.vue";
import PerfilUsuarioView from "@/views/PerfilUsuarioView.vue";
import RegistroUsuarioView from "@/views/RegistroUsuarioView.vue";
import TorneosView from "@/views/TorneosView.vue";
import ErrorView from "@/views/ErrorView.vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import FormCrearPartida from "@/components/PartidaAmistosa/FormCrearPartida.vue";
import EloView from "@/views/EloView.vue";
import DetalleInscripcionView from "@/views/DetalleInscripcionView.vue";
import GestionTorneosView from "@/views/GestionTorneosView.vue";
import DetalleTorneoGestionView from "@/views/DetalleTorneoGestionView.vue";
import DetalleTorneoLiveView from "@/views/DetalleTorneoLiveView.vue";

const routes: Array<RouteRecordRaw> = [
  { path: "/contacto", name: "contacto", component: ContactoView },
  {
    path: "/detalle-jugador/:idUsuario",
    name: "detalle-jugador",
    component: DetalleJugadorView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-torneo-gestion/:idTorneo",
    name: "detalle-torneo-gestion",
    component: DetalleTorneoGestionView,
    meta: { requiresAuth: true },
  },
  {
    path: "/gestion-torneos",
    name: "gestion-torneos",
    component: GestionTorneosView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-inscripcion/:idTorneo",
    name: "detalle-inscripcion",
    component: DetalleInscripcionView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-torneo-live/:idTorneo",
    name: "detalle-torneo-live",
    component: DetalleTorneoLiveView,
    meta: { requiresAuth: true },
  },
  {
    path: "/registrar-partida",
    name: "registrar-partida",
    component: FormCrearPartida,
    meta: { requiresAuth: true },
  },
  {
    path: "/elo",
    name: "elo",
    component: EloView,
    meta: { requiresAuth: true },
  },
  {
    path: "/resultados-torneos",
    name: "resultados-torneos",
    component: TorneoLiveView,
    meta: { requiresAuth: true },
  },

  {
    path: "/detalle-torneo/:idTorneo",
    name: "detalle-torneo",
    component: DetalleTorneoView,
    meta: { requiresAuth: true },
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
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/jugadores",
    name: "jugadores",
    component: JugadoresView,
    meta: { requiresAuth: true },
  },
  {
    path: "/perfil-usuario",
    name: "perfil-usuario",
    component: PerfilUsuarioView,
    meta: { requiresAuth: true },
  },
  {
    path: "/torneos",
    name: "torneos",
    component: TorneosView,
    meta: { requiresAuth: true },
  },
  {
    path: "/error",
    name: "error",
    component: ErrorView,
  },

  {
    path: "/",
    redirect: { name: "inicio-sesion" },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem("token");
  if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
    next({ name: "inicio-sesion" });
  } else {
    next();
  }
});

export default router;
