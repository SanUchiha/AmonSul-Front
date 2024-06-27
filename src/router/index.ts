import ContactoView from "@/views/ContactoView.vue";
import DetalleJugadorView from "@/views/DetalleJugadorView.vue";
import DetallePartidasView from "@/views/DetallePartidasView.vue";
import DetalleToneoLiveView from "@/views/DetalleToneoLiveView.vue";
import DetalleTorneoView from "@/views/DetalleTorneoView.vue";
import InicioSesionView from "@/views/InicioSesionView.vue";
import DashboardView from "@/views/DashboardView.vue";
import JugadoresView from "@/views/JugadoresView.vue";
import PartidasAmistoasView from "@/views/PartidasAmistoasView.vue";
import PerfilUsuarioView from "@/views/PerfilUsuarioView.vue";
import RegistroUsuarioView from "@/views/RegistroUsuarioView.vue";
import TorneosView from "@/views/TorneosView.vue";
import ErrorView from "@/views/ErrorView.vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  { path: "/contacto", name: "contacto", component: ContactoView },
  {
    path: "/detalle-jugador/:Nick",
    name: "detalle-jugador",
    component: DetalleJugadorView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-partida/:idPartida",
    name: "detalle-partida",
    component: DetallePartidasView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-torneo/:idTorneo",
    name: "detalle-torneo",
    component: DetalleTorneoView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-torneo-live/:idTorneoLive",
    name: "detalle-torneo-live",
    component: DetalleToneoLiveView,
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
    path: "/partidas-amistosas",
    name: "partidas-amistosas",
    component: PartidasAmistoasView,
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
