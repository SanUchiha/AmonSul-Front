<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-row>
        <v-col cols="4">
          <span class="font-weight-bold ">Victorias: {{ usuario.partidasGanadas }}</span>
        </v-col>
        <v-col cols="4">
          <span class="font-weight-bold">Empates: {{ usuario.partidasEmpatadas }}</span>
        </v-col>
        <v-col cols="4" v-if="usuario.partidasPerdidas > 0">
          <span class="font-weight-bold">Derrotas: {{ usuario.partidasPerdidas }}</span>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <div class="resultado-barra">
            <div class="victorias" v-if="winRate > 0" :style="{ flex: winRate.toFixed(2) }">{{ winRate.toFixed(2) }}</div>
            <div class="empates" v-if="drawRate > 0" :style="{ flex: drawRate.toFixed(2) }">{{ drawRate.toFixed(2) }}</div>
            <div class="derrotas" v-if="lossRate > 0" :style="{ flex: lossRate.toFixed(2) }">{{ lossRate.toFixed(2) }}</div>
          </div>
        </v-col>
      </v-row>
      
      <v-divider></v-divider>

      <v-row>
        <v-col class="stat-item">
          <img
            src="@/assets/icons/clasificacionTorneo.png"
            alt="Icono personalizado"
            width="60"
            height="60"
          />
          <p>Victorias: {{ winRate.toFixed(2) }}%</p>
        </v-col>
      </v-row>
      <v-col v-if="usuario.rankingElo" class="stat-item">
        <img
          src="@/assets/icons/ELO.png"
          alt="Icono personalizado"
          width="60"
          height="60"
        />
        <p>Ranking Elo: {{ usuario.rankingElo.toFixed(2) }}</p>
      </v-col>
    </v-col>
    <v-col cols="12" sm="6">
      <v-col class="stat-item">
        <img
          src="@/assets/icons/ejercitoMasUsado.png"
          alt="Icono personalizado"
          width="60"
          height="60"
        />
        <p>Ejército más usado: próximamente</p>
      </v-col>

      <v-col class="stat-item">
        <img
          src="@/assets/icons/ejercitoMejorResultado.png"
          alt="Icono personalizado"
          width="60"
          height="60"
        />
        <p>Ejército con mejor resultado: próximamente</p>
      </v-col>

      <v-col class="stat-item">
        <img
          src="@/assets/icons/ejercitoPeorResultado.png"
          alt="Icono personalizado"
          width="60"
          height="60"
        />
        <p>Ejército con peor resultado: próximamente</p>
      </v-col>
    </v-col>
  </v-row>

</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";
import { UsuarioDataDTO } from "@/interfaces/Usuario";

const props = defineProps<{ usuario: UsuarioDataDTO }>();

const defaultUsuario = {
  partidasGanadas: 0,
  partidasPerdidas: 0,
  partidasEmpatadas: 0
};
const usuarioData = computed(() => props.usuario ?? defaultUsuario);
console.log("usuario estadisticas", props.usuario);

const winRate = computed(() => ((usuarioData.value.partidasGanadas) / usuarioData.value.numeroPartidasJugadas) * 100);
const lossRate = computed(() => ((usuarioData.value.partidasPerdidas) / usuarioData.value.numeroPartidasJugadas) * 100);
const drawRate = computed(() => ((usuarioData.value.partidasEmpatadas) / usuarioData.value.numeroPartidasJugadas) * 100);

</script>
<style scoped>
.resultado-barra {
  display: flex;
  height: 30px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 2px #ccc;
  width: 100%;
}

.resultado-barra > div {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.victorias {
  background-color: #145c1750; /* azul claro */
}

.empates {
  background-color: #e6c40050; /* naranja claro */
  color: #000;
}

.derrotas {
  background-color: #75171050; /* verde claro */
}
</style>
