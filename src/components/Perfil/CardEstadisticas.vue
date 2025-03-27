<template>
  <v-container class="text-center pa-0 mb-0">
    <v-row>
      <v-col cols="12">
        <!--Leyenda victorias empates derrotas-->
        <v-row>
          <v-col cols="4">
            <span class="font-weight-bold">Victorias: {{ usuario.partidasGanadas }}</span>
          </v-col>
          <v-col cols="4">
            <span class="font-weight-bold">Empates: {{ usuario.partidasEmpatadas }}</span>
          </v-col>
          <v-col cols="4" v-if="usuario.partidasPerdidas > 0">
            <span class="font-weight-bold">Derrotas: {{ usuario.partidasPerdidas }}</span>
          </v-col>
        </v-row>

        <!--Barra de victorias empates derrotas con interactividad-->
        <v-row>
          <v-col cols="12">
            <div class="resultado-barra">
              <div
                class="victorias"
                :class="{ active: filtroActivo === 'win' }"
                v-if="winRate > 0"
                :style="{ flex: winRate.toFixed(2) }"
                @click="toggleFiltro('win')"
              >
                {{ winRate.toFixed(2) }}
              </div>
              <div
                class="empates"
                :class="{ active: filtroActivo === 'draw' }"
                v-if="drawRate > 0"
                :style="{ flex: drawRate.toFixed(2) }"
                @click="toggleFiltro('draw')"
              >
                {{ drawRate.toFixed(2) }}
              </div>
              <div
                class="derrotas"
                :class="{ active: filtroActivo === 'loss' }"
                v-if="lossRate > 0"
                :style="{ flex: lossRate.toFixed(2) }"
                @click="toggleFiltro('loss')"
              >
                {{ lossRate.toFixed(2) }}
              </div>
            </div>
          </v-col>
        </v-row>

        <v-spacer></v-spacer>

        <!-- TODO: Iconos y estadísticas por ejército -->
        <v-row>
          <v-col>
            <img
              src="@/assets/icons/ejercitoMasUsado.png"
              alt="Icono personalizado"
              width="60"
              height="60"
            />
            <p>Ejército más usado: próximamente</p>
          </v-col>

          <v-col>
            <img
              src="@/assets/icons/ejercitoMejorResultado.png"
              alt="Icono personalizado"
              width="60"
              height="60"
            />
            <p>Ejército con mejor resultado: próximamente</p>
          </v-col>

          <v-col>
            <img
              src="@/assets/icons/ejercitoPeorResultado.png"
              alt="Icono personalizado"
              width="60"
              height="60"
            />
            <p>Ejército con peor resultado: próximamente</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, defineEmits } from "vue";
import { UsuarioDataDTO } from "@/interfaces/Usuario";

const props = defineProps<{ usuario: UsuarioDataDTO }>();

const defaultUsuario = {
  partidasGanadas: 0,
  partidasPerdidas: 0,
  partidasEmpatadas: 0,
  numeroPartidasJugadas: 0
};

const usuarioData = computed(() => props.usuario ?? defaultUsuario);

const winRate = computed(() =>
  (usuarioData.value.partidasGanadas / usuarioData.value.numeroPartidasJugadas) * 100
);
const lossRate = computed(() =>
  (usuarioData.value.partidasPerdidas / usuarioData.value.numeroPartidasJugadas) * 100
);
const drawRate = computed(() =>
  (usuarioData.value.partidasEmpatadas / usuarioData.value.numeroPartidasJugadas) * 100
);

// Estado del filtro activo (win, loss, draw o null)
const filtroActivo = ref<'win' | 'loss' | 'draw' | null>(null);

// Emitir evento al padre cuando se cambia el filtro
const emit = defineEmits<{
  (e: 'filtroCambiar', tipo: 'win' | 'loss' | 'draw' | null): void;
}>();

function toggleFiltro(tipo: 'win' | 'loss' | 'draw') {
  filtroActivo.value = filtroActivo.value === tipo ? null : tipo;
  emit('filtroCambiar', filtroActivo.value);
}
</script>

<style scoped>
.resultado-barra > div {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, outline 0.2s ease, outline-offset 0.2s ease;
  outline: none;
  outline-offset: 0;
}

.resultado-barra {
  display: flex;
  height: 30px;
  border-radius: 6px;
  box-shadow: 0 0 2px #ccc;
  width: 100%;
}
.resultado-barra > div.active {
  transform: scaleY(1.2);
  box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.4);
  outline: 2px solid #ffd700; /* borde amarillo */
  outline-offset: -2px;
  z-index: 1;
}

.resultado-barra > div {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, outline 0.2s ease, outline-offset 0.2s ease;
  outline: none;
  outline-offset: 0;
}

.victorias {
  border-radius: 6px;
  background-color: #145c17;
}

.empates {
  border-radius: 6px;
  background-color: #dbba00;
}

.derrotas {
  border-radius: 6px;
  background-color: #751710;
}

.active {
  transform: scaleY(1.2);
  box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.4);
  z-index: 1;
}
</style>
