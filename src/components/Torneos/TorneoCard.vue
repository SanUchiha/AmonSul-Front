<template>
  <!-- Toda la tarjeta lleva al evento: allí están el detalle, los inscritos y los resultados -->
  <v-card class="pa-3" link @click="goToDetalle">
    <v-img
      :src="torneo.cartelTorneo || require('@/assets/images/cartelMissing.jpg')"
      height="250px"
      class="rounded-lg"
    />

    <v-divider class="my-3"></v-divider>

    <v-card-title
      class="ringbearer text-h6 text-center text-wrap font-weight-bold mt-3"
    >
      {{ torneo.nombreTorneo }}
    </v-card-title>
    <div v-if="esLiga || enCurso" class="d-flex justify-center ga-1 mb-2">
      <v-chip v-if="esLiga" size="small" color="primary">{{ nombreEvento(torneo.formatoTorneo) }}</v-chip>
      <v-chip v-if="enCurso" size="small" color="success" prepend-icon="mdi-sword-cross">En curso</v-chip>
    </div>
    <!-- La dirección, sin icono; sin dirección, nada -->
    <v-card-subtitle v-if="formattedAddress.trim() || torneo.lugarTorneo?.trim()" class="text-center mb-3">
      <p v-if="formattedAddress.trim()" class="text-wrap">
        <!-- La dirección abre el mapa, no el evento -->
        <a :href="googleMapsUrl" target="_blank" rel="noopener noreferrer" @click.stop>
          {{ formattedAddress }}
        </a>
      </p>
      <p v-else class="text-wrap">{{ torneo.lugarTorneo }}</p>
    </v-card-subtitle>

    <v-divider class="my-3"></v-divider>

    <!-- Solo la fecha: los puntos, las rondas y el formato están en el evento -->
    <v-card-text class="text-center py-1">
      <v-icon start color="green">mdi-calendar</v-icon>
      <!-- Una liga o un evento de varios días: del primero al último -->
      <template v-if="variosDias">
        Del {{ fechaTorneo }} al {{ formatFechaSpaWhitoutAsync(ultimoDia) }}
      </template>
      <template v-else>
        {{ fechaTorneo }}
        <template v-if="!esLiga"> a las {{ formatHora(torneo.horaInicioTorneo) }}</template>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { esPorJornadas, nombreEvento } from "@/Constant/FormatoTorneo";
import { diaDeHoy, formatFechaSpa, formatFechaSpaWhitoutAsync, formatHora, ultimoDiaEvento } from "@/utils/Fecha";
import { defineProps, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{ torneo: Torneo; verClasificacion: boolean }>();
// Liga o Copa
const esLiga = computed(() => esPorJornadas(props.torneo.formatoTorneo));
const ultimoDia = computed(() =>
  ultimoDiaEvento(props.torneo.fechaInicioTorneo, props.torneo.fechaFinTorneo)
);
const variosDias = computed(() => ultimoDia.value > props.torneo.fechaInicioTorneo.slice(0, 10));
// Ya empezado y sin terminar: una liga a mitad o un torneo que se juega hoy
const enCurso = computed(
  () => props.torneo.fechaInicioTorneo.slice(0, 10) <= diaDeHoy() && ultimoDia.value >= diaDeHoy()
);
const router = useRouter();
const fechaTorneo = ref<string>("");

// Variables reactivas
const formattedAddress = ref<string>("");

// Computed property para generar el enlace a Google Maps
const googleMapsUrl = computed(() => {
  if (!props.torneo.lugarTorneo) return "#";
  return `https://www.google.com/maps?q=${parseFloat(
    props.torneo.lugarTorneo.split(", ")[0]
  )},${parseFloat(props.torneo.lugarTorneo.split(", ")[1])}`;
});

// Función para obtener dirección inversa desde coordenadas
const getAddress = async (lat: number, lon: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.address) {
      const { road, house_number, city, town, village, state, postcode } =
        data.address;

      // Priorizar ciudad, pueblo o aldea
      const locationCity = city || town || village || "";

      // Construir dirección formateada
      formattedAddress.value = [
        road ? `${road}${house_number ? `, ${house_number}` : ""}` : "",
        locationCity,
        state,
        postcode,
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
  if (isValidCoordinates(props.torneo.lugarTorneo)) {
    getAddress(
      parseFloat(props.torneo.lugarTorneo.split(", ")[0]),
      parseFloat(props.torneo.lugarTorneo.split(", ")[1])
    );
  }
});

const goToDetalle = () => {
  router.push(`/detalle-evento/${props.torneo.idTorneo}`);
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
