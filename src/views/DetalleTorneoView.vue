<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card v-if="torneo">
          <v-img :src="torneo.cartelTorneo" height="200px" />
          <v-card-title align="center">{{ torneo.nombreTorneo }}</v-card-title>
          <v-card-subtitle>{{ torneo.lugarTorneo }}</v-card-subtitle>
          <v-card-text>
            <p><strong>Descripción:</strong> {{ torneo.descripcionTorneo }}</p>
            <p><strong>Estado:</strong> {{ torneo.estadoTorneo }}</p>
            <p>
              <strong>Fecha de Inicio:</strong>
              {{ formatDate(torneo.fechaInicioTorneo) }} a las
              {{ torneo.horaInicioTorneo }}
            </p>
            <p>
              <strong>Fecha de Fin:</strong>
              {{ formatDate(torneo.fechaFinTorneo) }} a las
              {{ torneo.horaFinTorneo }}
            </p>
            <p>
              <strong>Fecha Fin de Inscripción:</strong>
              {{ formatDate(torneo.fechaFinInscripcion) }}
            </p>
            <p>
              <strong>Entrega de Listas:</strong>
              {{ formatDate(torneo.fechaEntregaListas) }}
            </p>
            <p><strong>Precio:</strong> {{ torneo.precioTorneo }}€</p>
            <p>
              <strong>Límite de Participantes:</strong>
              {{ torneo.limitePlazas || "Sin límite" }}
            </p>
            <p><strong>Tipo de Torneo:</strong> {{ torneo.tipoTorneo }}</p>
            <p>
              <strong>Número de Partidas:</strong> {{ torneo.numeroPartidas }}
            </p>
            <p><strong>Puntos del Torneo:</strong> {{ torneo.puntosTorneo }}</p>
            <p><strong>Métodos de Pago:</strong> {{ torneo.metodosPago }}</p>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn variant="outlined" color="orange lighten-2" @click="goBack">
              Volver
            </v-btn>
            <v-btn
              variant="tonal"
              color="success lighten-2"
              @click="inscripcion"
              >Apúntate</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { Torneo } from "@/interfaces/Torneo";
import { getTorneo } from "@/services/TorneosService";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
let torneo = ref<Torneo>();

onMounted(async () => {
  const idTorneo = Number(route.params.idTorneo);
  torneo.value = await getTorneo(idTorneo);
  console.log(torneo.value);
});

const formatDate = (date: string | number | Date | undefined) =>
  date ? new Date(date).toLocaleDateString() : "Fecha no disponible";

const goBack = () => router.go(-1);
const inscripcion = () => router.go(-1);
</script>

<style scoped>
.v-card-actions {
  display: flex;
  justify-content: space-between;
}
</style>
