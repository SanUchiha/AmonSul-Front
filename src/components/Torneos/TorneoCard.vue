<template>
  <v-card class="pa-3">
    <v-img :src="torneo.cartelTorneo || require('@/assets/images/cartelMissing.jpg')" height="250px" class="rounded-lg" />

    <v-divider class="my-3"></v-divider>

    <v-card-title class="ringbearer text-h6 text-center text-wrap font-weight-bold mt-3">
      {{ torneo.nombreTorneo }}
    </v-card-title>
    <v-card-subtitle class="text-center mb-3">
      <p class="text-wrap" v-if="formattedAddress.trim()">
        <v-icon left class="location-icon">mdi-map-marker</v-icon>
        <a :href="googleMapsUrl" target="_blank" rel="noopener noreferrer">
          {{ formattedAddress }}
        </a>
      </p>
      <p v-else><v-icon left class="location-icon">mdi-map-marker</v-icon> {{ torneo.lugarTorneo }}</p>
    </v-card-subtitle>

    <v-divider class="my-3"></v-divider>

    <v-card-text>
      <v-row>
        <v-col cols="10" offset="1" class="text-left">
          <p><v-icon left color="green">mdi-calendar</v-icon> <strong>Fecha:</strong> {{ fechaTorneo }} a las {{ torneo.horaInicioTorneo }}</p>  
          <p><v-icon color="cyan">mdi-trophy</v-icon> <strong>Puntos:</strong> {{ torneo.puntosTorneo }}</p>
          <p><v-icon color="cyan">mdi-format-list-bulleted</v-icon> <strong>Rondas:</strong> {{ torneo.numeroPartidas }}</p>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider class="mb-3"></v-divider>

    <v-card-actions class="d-flex justify-space-between">
      <v-row>
        <v-col cols="12" sm="6">
          <v-btn
            variant="tonal"
            color="orange lighten-2"
            @click="goToDetalle"
          >
            Ver Detalle
          </v-btn>
        </v-col>
        <v-col v-if=(verClasificacion) cols="12" sm="6">
          <v-btn
            variant="tonal"
            color="blue lighten-2"
            @click="goToResultadoTorneo"
          >
            Ver Clasificación
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { formatFechaSpa } from "@/utils/Fecha";
import { defineProps, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ torneo: Torneo; verClasificacion: boolean }>();
const router = useRouter();
const fechaTorneo = ref<string>("");


// Variables reactivas
const formattedAddress = ref<string>("");

// Computed property para generar el enlace a Google Maps
const googleMapsUrl = computed(() => {
  if (!props.torneo.lugarTorneo) return "#";
  return `https://www.google.com/maps?q=${parseFloat(props.torneo.lugarTorneo.split(", ")[0])},${parseFloat(props.torneo.lugarTorneo.split(", ")[1])}`;
});

// Función para obtener dirección inversa desde coordenadas
const getAddress = async (lat: number, lon: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.address) {
      console.log(" data.address", data);

      const { road, house_number, city, town, village, state, postcode } = data.address;

      // Priorizar ciudad, pueblo o aldea
      const locationCity = city || town || village || "";

      // Construir dirección formateada
      formattedAddress.value = [
        road ? `${road}${house_number ? `, ${house_number}` : ""}` : "",
        locationCity,
        state,
        postcode
      ]
        .filter(Boolean) // Eliminar valores vacíos
        .join(", "); // Unir con comas
    } else {
      formattedAddress.value = "Dirección no disponible";
    }
  } catch (error) {
    console.error("Error obteniendo la dirección:", error);
  }
};
const isValidCoordinates = (value: string): boolean => {
  if (!value) return false;

  // Expresión regular para validar coordenadas (lat, lng)
  const regex = /^-?\d{1,2}\.\d+,\s*-?\d{1,3}\.\d+$/;

  return regex.test(value.trim());
};



onMounted(async () => {
  fechaTorneo.value = await formatFechaSpa(props.torneo.fechaInicioTorneo);
  if (isValidCoordinates(props.torneo.lugarTorneo)){
    getAddress(parseFloat(props.torneo.lugarTorneo.split(", ")[0]), parseFloat(props.torneo.lugarTorneo.split(", ")[1]));
  }
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
