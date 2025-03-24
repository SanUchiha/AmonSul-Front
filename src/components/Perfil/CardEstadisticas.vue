<template>
  <v-container class="text-center pa-0 mb-0">
    <v-row>
      <v-col cols="12">
        <!--Leyenda victorias empates derrotas-->
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
        <!--Barra de victorias empates derrotas-->
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
  
        <!--Icono Victorias-->
        <!--TODO ver el rankingElo porque no viaja
        <v-row> 
          <v-col>
            <img
              src="@/assets/icons/clasificacionTorneo.png"
              alt="Icono personalizado"
              width="60"
              height="60"
            />
            <p>Victorias: {{ winRate.toFixed(2) }}%</p>
          </v-col>
          <v-col v-if="usuario.rankingElo" class="">
            <img
              src="@/assets/icons/ELO.png"
              alt="Icono personalizado"
              width="60"
              height="60"
            />
            <p>Ranking Elo: {{ usuario.rankingElo.toFixed(2) }}</p>
          </v-col>
        </v-row>-->
      </v-col>
  
      <v-col cols="12">
        <v-row>
          <v-col class="">
            <img
              src="@/assets/icons/ejercitoMasUsado.png"
              alt="Icono personalizado"
              width="60"
              height="60"
            />
            <p>Ejército más usado: próximamente</p>
          </v-col>
    
          <v-col class="">
            <img
              src="@/assets/icons/ejercitoMejorResultado.png"
              alt="Icono personalizado"
              width="60"
              height="60"
            />
            <p>Ejército con mejor resultado: próximamente</p>
          </v-col>
    
          <v-col class="">
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
  background-color: #145c17; /* azul claro */
}

.empates {
  background-color: #dbba00; /* naranja claro */
}

.derrotas {
  background-color: #751710; /* verde claro */
}
</style>
