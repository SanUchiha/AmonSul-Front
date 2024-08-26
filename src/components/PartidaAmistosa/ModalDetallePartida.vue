<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card>
      <v-card-title class="modal-title">
        <h3>Detalle Partida</h3>
        <v-spacer></v-spacer>
        <v-btn icon @click="close" class="close-button">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text>
        <div class="player-container">
          <div class="player-details">
            <div class="player-info">
              <span>{{ partida?.nickUsuario1 }}</span>
            </div>
            <div class="player-info">
              <span>{{ partida?.resultadoUsuario1 ?? "No especificado" }}</span>
            </div>
            <div class="player-info">
              <v-icon>mdi-shield-outline</v-icon>
              <span>{{ partida?.ejercitoUsuario1 ?? "No especificado" }}</span>
            </div>
          </div>
          <div class="versus">
            <v-icon>mdi-vs</v-icon>
          </div>
          <v-divider vertical class="divider"></v-divider>

          <div class="player-details">
            <div class="player-info">
              <span>{{ partida?.nickUsuario2 }}</span>
            </div>
            <div class="player-info">
              <span>{{ partida?.resultadoUsuario2 ?? "No especificado" }}</span>
            </div>
            <div class="player-info">
              <v-icon>mdi-shield-outline</v-icon>
              <span>{{ partida?.ejercitoUsuario2 ?? "No especificado" }}</span>
            </div>
          </div>
        </div>

        <v-divider></v-divider>

        <v-list class="centered-list">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <v-icon>mdi-trophy</v-icon>
                {{ partida?.ganadorPartidaNick ?? "Empate" }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <v-icon>mdi-calendar</v-icon>
                {{ formattedFecha }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <v-icon>mdi-map-marker</v-icon>
                {{ partida?.escenarioPartida ?? "N/A" }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                <v-icon>mdi-cash-multiple</v-icon>
                {{ partida?.puntosPartida ?? "No especificado" }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                ELO: {{ partida?.esElo ? "Sí" : "No" }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ViewPartidaAmistosaDTO } from "@/interfaces/Partidas";
import { formatFechaSpa } from "@/utils/Fecha";
import { defineProps, ref, watch, defineEmits, onMounted } from "vue";

const props = defineProps<{
  partida: ViewPartidaAmistosaDTO;
}>();
const emit = defineEmits<{ (event: "close"): void }>();

const show = ref(true);
const formattedFecha = ref<string | null>(null);

const close = () => {
  show.value = false;
  emit("close");
};

watch(show, (newValue) => {
  if (!newValue) {
    emit("close");
  }
});

onMounted(async () => {
  if (props.partida?.fechaPartida) {
    formattedFecha.value = await formatFechaSpa(props.partida.fechaPartida);
  }
});
</script>

<style scoped>
.modal-title {
  display: flex;
  align-items: center;
}

.modal-title h3 {
  margin: 0;
}

.close-button {
  margin-left: auto;
}

.player-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}

.player-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.versus {
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-info {
  display: flex;
  align-items: center;
  margin: 0.5em 0;
}

.player-info v-icon {
  margin-right: 0.5em;
  color: aqua;
}

.v-list-item-subtitle {
  /* font-weight: bold; */
  font-size: large;
}

.centered-list {
  text-align: center;
}
</style>
