<template>
  <v-card class="mx-auto my-3" max-width="100%">
    <!-- Imagen del torneo -->
    <v-img :src="torneo.cartelTorneo" height="200px" contain></v-img>

    <v-divider class="my-3"></v-divider>

    <!-- Título del torneo -->
    <v-card-title>{{ torneo.nombreTorneo }}</v-card-title>

    <!-- Subtítulos con iconos -->
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

    <!-- Botón de acciones -->
    <v-card-actions>
      <v-btn color="orange lighten-2" @click="goToDetalle" block>
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
  console.log(props.torneo);
  fechaTorneo.value = await formatFechaSpa(props.torneo.fechaInicioTorneo);
});

const goToDetalle = () => {
  router.push(`/detalle-torneo/${props.torneo.idTorneo}`);
};
</script>

<style scoped>
/* Ajustes generales para la tarjeta */
.v-card {
  display: flex;
  flex-direction: column;
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
