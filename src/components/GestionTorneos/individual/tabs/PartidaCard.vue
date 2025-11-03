<template>
  <v-card class="ma-3 bordered-card" max-width="400">
    <v-card-title class="underlined-title"> Mesa {{ mesaIndex }} </v-card-title>
    <v-card-subtitle> </v-card-subtitle>
    <v-divider></v-divider>
    <v-card-text>
      <div class="player-container">
        <!-- jugador 1 -->
        <div class="player-details">
          <!-- Validar 1 -->
          <div class="player-info">
            <span>
              <v-icon v-if="partida.partidaValidadaUsuario1" color="green"
                >mdi-check</v-icon
              >
              <v-icon v-else color="red">mdi-close</v-icon>
              <v-btn
                class="mt-2"
                variant="tonal"
                color="primary"
                size="small"
                @click="
                  $emit('abrir-modal-validar', partida.idPartidaTorneo, 1)
                "
              >
                Validar
              </v-btn>
            </span>
          </div>
          <!-- nick 1 -->
          <div class="player-info">
            <span :class="{ highlight: partida.idUsuario1 === idUsuario }">
              {{ partida.nick1 }}
            </span>
          </div>
          <!-- resultado 1 -->
          <div class="player-info">
            <span v-if="partida.resultadoUsuario1 != null">{{
              partida.resultadoUsuario1
            }}</span>
            <span v-else>
              <v-icon color="red">mdi-close</v-icon>
            </span>
          </div>
          <!-- lider 1 -->
          <div class="player-info">
            <span v-if="partida.liderMuertoUsuario1 != null">
              ¿General?
              {{
                partida.liderMuertoUsuario1 === true
                  ? "Sí"
                  : partida.liderMuertoUsuario1 === false
                    ? "No"
                    : "N/A"
              }}
            </span>
            <span v-else>
              ¿General?
              <v-icon color="red">mdi-close</v-icon>
            </span>
          </div>
          <!-- ejercito 1 -->
          <div class="player-info">
            <v-icon>mdi-shield-outline</v-icon>
            <span>{{ partida.ejercitoUsuario1 ?? "N/A" }}</span>
          </div>
          <!-- lista 1 -->
          <div class="player-info">
            <v-btn
              class="mt-2"
              variant="tonal"
              color="primary"
              size="small"
              @click="
                $emit(
                  'ver-lista',
                  partida.idUsuario1,
                  partida.idTorneo,
                  partida.nick1
                )
              "
            >
              Lista
            </v-btn>
          </div>
        </div>

        <v-divider vertical class="divider"></v-divider>

        <!-- jugador 2 -->
        <div class="player-details">
          <!-- validar 2 -->
          <div class="player-info">
            <span>
              <v-icon v-if="partida.partidaValidadaUsuario2" color="green"
                >mdi-check</v-icon
              >
              <v-icon v-else color="red">mdi-close</v-icon>
              <v-btn
                class="mt-2"
                variant="tonal"
                color="primary"
                size="small"
                @click="
                  $emit('abrir-modal-validar', partida.idPartidaTorneo, 2)
                "
              >
                Validar
              </v-btn>
            </span>
          </div>
          <!-- nick 2 -->
          <div class="player-info">
            <span :class="{ highlight: partida.idUsuario2 === idUsuario }">
              {{ partida.nick2 }}
            </span>
          </div>
          <!-- resultado 2 -->
          <div class="player-info">
            <span v-if="partida.resultadoUsuario2 != null">{{
              partida.resultadoUsuario2
            }}</span>
            <span v-else>
              <v-icon color="red">mdi-close</v-icon>
            </span>
          </div>
          <!-- lider 2 -->
          <div class="player-info">
            <span v-if="partida.liderMuertoUsuario2 != null">
              ¿General?
              {{
                partida.liderMuertoUsuario2 === true
                  ? "Sí"
                  : partida.liderMuertoUsuario2 === false
                    ? "No"
                    : "N/A"
              }}
            </span>
            <span v-else>
              ¿General?
              <v-icon color="red">mdi-close</v-icon>
            </span>
          </div>
          <!-- ejercito 2 -->
          <div class="player-info">
            <v-icon>mdi-shield-outline</v-icon>
            <span>{{ partida.ejercitoUsuario2 ?? "N/A" }}</span>
          </div>
          <!-- lista 2 -->
          <div class="player-info">
            <v-btn
              class="mt-2"
              variant="tonal"
              color="primary"
              size="small"
              @click="
                $emit(
                  'ver-lista',
                  partida.idUsuario2,
                  partida.idTorneo,
                  partida.nick2
                )
              "
            >
              Lista
            </v-btn>
          </div>
        </div>
      </div>
      <v-divider></v-divider>
      <v-list class="centered-list">
        <!-- ganador -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <v-icon>mdi-trophy</v-icon>
              {{ getGanador(partida) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- fecha -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <v-icon>mdi-calendar</v-icon>
              {{ formatDate(partida.fechaPartida) }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- escenario -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <v-icon>mdi-map-marker</v-icon>
              {{ partida.escenarioPartida }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Modificar partida -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              <div class="flex-column align-items-center">
                <v-btn
                  class="mt-2"
                  variant="tonal"
                  color="secondary"
                  @click="$emit('modificar-partida', partida)"
                >
                  Modificar Resultado
                </v-btn>
              </div>
            </v-list-item-title>
            <v-list-item-title>
              <div class="flex-column align-items-center">
                <v-btn
                  class="mt-2"
                  variant="tonal"
                  color="secondary"
                  @click="$emit('modificar-pairing', partida)"
                >
                  Modificar Pairing
                </v-btn>
              </div>
            </v-list-item-title>
            <v-list-item-title>
              <div class="flex-column align-items-center">
                <v-btn
                  class="mt-2"
                  variant="tonal"
                  color="error"
                  @click="$emit('eliminar-partida', partida)"
                >
                  Eliminar partida
                </v-btn>
              </div>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";

const props = defineProps<{
  partida: PartidaTorneoDTO;
  mesaIndex: number;
  idUsuario?: number;
  getGanador: (partida: PartidaTorneoDTO) => string;
  formatDate: (date: string | null | undefined) => string;
}>();

defineEmits([
  "abrir-modal-validar",
  "ver-lista",
  "modificar-partida",
  "modificar-pairing",
  "eliminar-partida",
]);
</script>

<style scoped>
/* Puedes trasladar los estilos necesarios aquí si los hay */
</style>
