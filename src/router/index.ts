import ContactoView from "@/views/ContactoView.vue";
import DetalleJugadorView from "@/views/DetalleJugadorView.vue";
import DetalleTorneoView from "@/views/DetalleTorneoView.vue";
import InicioSesionView from "@/views/InicioSesionView.vue";
import JugadoresView from "@/views/JugadoresView.vue";
import PerfilUsuarioView from "@/views/PerfilUsuarioView.vue";
import RegistroUsuarioView from "@/views/RegistroUsuarioView.vue";
import TorneosView from "@/views/TorneosView.vue";
import ErrorView from "@/views/ErrorView.vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import EloView from "@/views/EloView.vue";
import DetalleInscripcionView from "@/views/DetalleInscripcionView.vue";
import GestionTorneosView from "@/views/GestionTorneosView.vue";
import DetalleTorneoGestionView from "@/views/DetalleTorneoGestionView.vue";
import DetalleTorneoGestionEquiposView from "@/views/DetalleTorneoGestionEquiposView.vue";
import DetalleTorneoLiveView from "@/views/DetalleTorneoLiveView.vue";
import DetalleTorneoLiveEquiposView from "@/views/DetalleTorneoLiveEquiposView.vue";
import DetalleTorneoLiveMasView from "@/views/DetalleTorneoLiveMasView.vue";
import ResultadosTorneosView from "@/views/ResultadosTorneosView.vue";
import MisPartidasView from "@/views/MisPartidasView.vue";
import MisTorneosView from "@/views/MisTorneosView.vue";
import LigasView from "@/views/LigasView.vue";
import AboutUsView from "@/views/AboutUsView.vue";
import DetalleTorneoGestionIndividualMasView from "@/views/DetalleTorneoGestionIndividualMasView.vue";

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
    path: "/detalle-torneo-gestion-equipos/:idTorneo",
    name: "detalle-torneo-gestion-equipos",
    component: DetalleTorneoGestionEquiposView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-torneo-gestion-individual-mas/:idTorneo",
    name: "detalle-torneo-gestion-individual-mas",
    component: DetalleTorneoGestionIndividualMasView,
    meta: { requiresAuth: true },
  },
  {
    path: "/gestion-torneos",
    name: "gestion-torneos",
    component: GestionTorneosView,
    meta: { requiresAuth: true },
  },
  {
    path: "/about-us",
    name: "about-us",
    component: AboutUsView,
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
    path: "/detalle-torneo-live-equipos/:idTorneo",
    name: "detalle-torneo-live-equipos",
    component: DetalleTorneoLiveEquiposView,
    meta: { requiresAuth: true },
  },
  {
    path: "/detalle-torneo-live-mas/:idTorneo",
    name: "detalle-torneo-live-mas",
    component: DetalleTorneoLiveMasView,
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
    component: ResultadosTorneosView,
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
    path: "/mis-partidas",
    name: "mis-partidas",
    component: MisPartidasView,
    meta: { requiresAuth: true },
  },
  {
    path: "/mis-torneos",
    name: "mis-torneos",
    component: MisTorneosView,
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
    path: "/ligas",
    name: "ligas",
    component: LigasView,
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
