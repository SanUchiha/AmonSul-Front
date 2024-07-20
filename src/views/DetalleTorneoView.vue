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

          <v-card-actions>
            <v-btn
              variant="outlined"
              color="blue lighten-2"
              @click="descargarBases"
              block
            >
              Descargar Bases
            </v-btn>
          </v-card-actions>

          <v-divider class="my-3"></v-divider>

          <v-card-actions>
            <v-btn variant="outlined" color="orange lighten-2" @click="goBack">
              Volver
            </v-btn>
            <v-btn
              variant="tonal"
              color="success lighten-1"
              @click="showModalResponse"
              >Apúntate</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <ResponseInscripcion :isVisible="showModal" @close="handleCloseModal" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Torneo } from "@/interfaces/Torneo";
import { getTorneo } from "@/services/TorneosService";
import ResponseInscripcion from "@/components/Torneos/ResponseInscripcion.vue";

const route = useRoute();
const router = useRouter();
let torneo = ref<Torneo>();
const showModal = ref(false);

onMounted(async () => {
  const idTorneo = Number(route.params.idTorneo);
  torneo.value = await getTorneo(idTorneo);
  console.log(torneo.value);
});

watch(
  () => showModal.value,
  (newValue) => {
    if (!newValue) {
      router.push("/mis-torneos");
    }
  }
);

const formatDate = (date: string | number | Date | undefined) =>
  date ? new Date(date).toLocaleDateString() : "Fecha no disponible";

const goBack = () => router.go(-1);
const descargarBases = () => router.go(-1);

const showModalResponse = () => {
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
.v-card-actions {
  display: flex;
  justify-content: space-between;
}
</style>
