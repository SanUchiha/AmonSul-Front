<template>
  <v-card class="torneo-card mx-auto my-3" max-width="300px">
    <v-img :src="torneo.cartelTorneo" height="200px" contain></v-img>

    <v-divider class="my-3"></v-divider>

    <v-card-title>{{ torneo.nombreTorneo }}</v-card-title>

    <v-card-subtitle>
      <v-icon left>mdi-map-marker</v-icon>
      Lugar: {{ torneo.lugarTorneo }}
    </v-card-subtitle>

    <v-card-subtitle>
      <v-icon left>mdi-calendar-month</v-icon>
      Fecha: {{ fechaTorneo }}
    </v-card-subtitle>

    <v-card-subtitle>
      <v-icon left>mdi-star</v-icon>
      Puntos: {{ torneo.puntosTorneo }}
    </v-card-subtitle>

    <v-card-subtitle>
      <v-icon left>mdi-format-list-bulleted</v-icon>
      Rondas: {{ torneo.numeroPartidas }}
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
const img = ref<string>("");

onMounted(async () => {
  fechaTorneo.value = await formatFechaSpa(props.torneo.fechaInicioTorneo);
});

const goToDetalle = () => {
  router.push(`/detalle-torneo/${props.torneo.idTorneo}`);
};
</script>

<style scoped>
/* Ajustes generales para la tarjeta */
.torneo-card {
  width: 100%; /* Asegura que la tarjeta use todo el ancho disponible del contenedor */
  max-width: 300px; /* Ancho máximo de la tarjeta */
  box-sizing: border-box; /* Incluye el padding y el border en el ancho total */
}

/* Asegura que la imagen se adapte bien en pantallas pequeñas */
.v-img {
  width: 100%;
  max-width: 100%;
}

/* Ajustes del botón para que ocupe todo el ancho disponible */
.v-btn {
  width: 100%;
}
</style>
