<template>
  <v-card class="torneo-card mx-auto my-3">
    <v-img :src="torneo.cartelTorneo" height="200px" contain></v-img>

    <v-divider class="my-3"></v-divider>

    <v-card-title class="torneo-titulo">{{ torneo.nombreTorneo }}</v-card-title>

    <v-card-subtitle class="text-left">
      <v-icon left>mdi-map-marker</v-icon>
      Lugar: <span class="subheading text-wrap">{{ torneo.lugarTorneo }}</span>
    </v-card-subtitle>

    <v-card-subtitle class="text-left">
      <v-icon left>mdi-calendar-month</v-icon>
      Fecha: <span class="subheading">{{ fechaTorneo }}</span>
    </v-card-subtitle>

    <v-card-subtitle class="text-left">
      <v-icon left>mdi-star</v-icon>
      Puntos: <span class="subheading">{{ torneo.puntosTorneo }}</span>
    </v-card-subtitle>

    <v-card-subtitle class="text-left">
      <v-icon left>mdi-format-list-bulleted</v-icon>
      Rondas: <span class="subheading">{{ torneo.numeroPartidas }}</span>
    </v-card-subtitle>

    <v-spacer class="my-3"></v-spacer>

    <v-card-actions>
      <v-btn
        variant="tonal"
        color="orange lighten-2"
        @click="goToDetalle"
        block
      >
        Ver Detalle
      </v-btn>
      <v-if torneo.estadoTorneo="TERMINADO">
        <v-btn
          variant="tonal"
          color="blue lighten-2"
          @click="goToResultadoTorneo"
          block
        >
          Ver Clasificación
        </v-btn>
      </v-if>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { formatFechaSpa } from "@/utils/Fecha";
import { defineProps, ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ torneo: Torneo }>();
const router = useRouter();
const fechaTorneo = ref<string>("");

onMounted(async () => {
  fechaTorneo.value = await formatFechaSpa(props.torneo.fechaInicioTorneo);
});

const goToDetalle = () => {
  router.push(`/detalle-torneo/${props.torneo.idTorneo}`);
};
const goToResultadoTorneo = () => {
  router.push(`/detalle-torneo-live/${props.torneo.idTorneo}`);
};

</script>

<style scoped>
.torneo-card {
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
}

.v-img {
  width: 100%;
  max-width: 100%;
}

.v-btn {
  width: 100%;
}

.torneo-titulo {
  white-space: normal !important;
  word-wrap: break-word !important;
  display: flex;
  justify-content: center;
  text-align: center;
}
</style>
