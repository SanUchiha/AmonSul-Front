import { defineStore } from "pinia";
import { getClasifiacionElo, getClasifiacionEloMensual } from "@/services/EloService";
import { UsuarioEloTablaClasificacion } from "@/interfaces/Elo";

interface EloState {
  clasificacionElo: UsuarioEloTablaClasificacion[];
  clasificacionEloMensual: UsuarioEloTablaClasificacion[];
  isClasificacionLoaded: boolean;
  isClasificacionMensualLoaded: boolean;
  lastClasificacionUpdate: number | null;
  lastClasificacionMensualUpdate: number | null;
}

export const useEloStore = defineStore("elo", {
  state: (): EloState => ({
    clasificacionElo: [],
    clasificacionEloMensual: [],
    isClasificacionLoaded: false,
    isClasificacionMensualLoaded: false,
    lastClasificacionUpdate: null,
    lastClasificacionMensualUpdate: null,
  }),

  getters: {
    // Getter para obtener la clasificación desde el caché
    getClasificacionElo: (state) => state.clasificacionElo,
    
    // Getter para obtener la clasificación mensual desde el caché
    getClasificacionEloMensual: (state) => state.clasificacionEloMensual,
    
    // Getter para verificar si los datos están frescos (menos de 60 minutos)
    isClasificacionDataFresh: (state) => {
      if (!state.lastClasificacionUpdate) return false;
      const sixtyMinutes = 60 * 60 * 1000; // 60 minutos en millisegundos
      return Date.now() - state.lastClasificacionUpdate < sixtyMinutes;
    },

    isClasificacionMensualDataFresh: (state) => {
      if (!state.lastClasificacionMensualUpdate) return false;
      const sixtyMinutes = 60 * 60 * 1000; // 60 minutos en millisegundos
      return Date.now() - state.lastClasificacionMensualUpdate < sixtyMinutes;
    },
  },

  actions: {
    // Acción para obtener clasificación con caché
    async fetchClasificacionElo(forceRefresh = false) {
      // Si ya tenemos datos frescos y no se fuerza el refresh, devolver del caché
      if (this.isClasificacionLoaded && this.isClasificacionDataFresh && !forceRefresh) {
        return this.clasificacionElo;
      }

      try {
        const response = await getClasifiacionElo();
        this.clasificacionElo = response.data;
        this.isClasificacionLoaded = true;
        this.lastClasificacionUpdate = Date.now();
        return this.clasificacionElo;
      } catch (error) {
        console.error("Error al obtener clasificación ELO:", error);
        throw error;
      }
    },

    // Acción para obtener clasificación mensual con caché
    async fetchClasificacionEloMensual(forceRefresh = false) {
      // Si ya tenemos datos frescos y no se fuerza el refresh, devolver del caché
      if (this.isClasificacionMensualLoaded && this.isClasificacionMensualDataFresh && !forceRefresh) {
        return this.clasificacionEloMensual;
      }

      try {
        const response = await getClasifiacionEloMensual();
        this.clasificacionEloMensual = response.data;
        this.isClasificacionMensualLoaded = true;
        this.lastClasificacionMensualUpdate = Date.now();
        return this.clasificacionEloMensual;
      } catch (error) {
        console.error("Error al obtener clasificación ELO mensual:", error);
        throw error;
      }
    },

    // Acción para limpiar el caché manualmente
    clearCache() {
      this.clasificacionElo = [];
      this.clasificacionEloMensual = [];
      this.isClasificacionLoaded = false;
      this.isClasificacionMensualLoaded = false;
      this.lastClasificacionUpdate = null;
      this.lastClasificacionMensualUpdate = null;
    },

    // Acción para invalidar solo la clasificación general
    invalidateClasificacion() {
      this.clasificacionElo = [];
      this.isClasificacionLoaded = false;
      this.lastClasificacionUpdate = null;
    },

    // Acción para invalidar solo la clasificación mensual
    invalidateClasificacionMensual() {
      this.clasificacionEloMensual = [];
      this.isClasificacionMensualLoaded = false;
      this.lastClasificacionMensualUpdate = null;
    },
  },
});