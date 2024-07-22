<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="12">
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
              {{ torneo.limiteParticipantes || "Sin límite" }}
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
            >
              Descargar Bases
            </v-btn>
          </v-card-actions>

          <v-divider class="my-3"></v-divider>

          <v-card-actions>
            <v-btn variant="outlined" color="orange lighten-2" @click="goBack">
              Volver
            </v-btn>
            <div v-if="!estaApuntado">
              <v-btn
                variant="tonal"
                color="success lighten-1"
                @click="showModalResponse"
                >Apúntate</v-btn
              >
            </div>
            <div v-else class="color-text">Ya estás apúntado a este torneo</div>
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
import { descargarBasesTorneo, getTorneo } from "@/services/TorneosService";
import ResponseInscripcion from "@/components/Torneos/ResponseInscripcion.vue";
import {
  getInscripcionesUser,
  registrarInscripcion,
} from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import {
  CrearInscripcionDTO,
  InscripcionUsuarioDTO,
} from "@/interfaces/Inscripcion";

const { getidUsuario } = useAuth();
const route = useRoute();
const router = useRouter();
const torneo = ref<Torneo>();
const showModal = ref(false);
const idUsuario = ref<string>(getidUsuario.value!);
const idTorneo = ref<number>();
const estaApuntado = ref<boolean>(false);
const torneosApuntado = ref<InscripcionUsuarioDTO[]>();

onMounted(async () => {
  idTorneo.value = Number(route.params.idTorneo);
  torneo.value = await getTorneo(idTorneo.value);
  // comprobar si ya esta apuntado
  torneosApuntado.value = await getInscripcionesUser(idUsuario.value);

  torneosApuntado.value!.forEach((element) => {
    if (element.idTorneo == idTorneo.value) estaApuntado.value = true;
  });
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

const descargarBases = async () => {
  try {
    const blob = await descargarBasesTorneo(idTorneo.value!);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bases_Torneo_${torneo.value?.nombreTorneo}.pdf`;
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando el archivo:", error);
    alert("Error al descargar el archivo. Por favor, inténtelo de nuevo.");
  }
};

const showModalResponse = async () => {
  try {
    const body: CrearInscripcionDTO = {
      idUsuario: parseInt(idUsuario.value),
      idTorneo: idTorneo.value!,
    };
    console.log("innx", body);
    await registrarInscripcion(body);
    showModal.value = true;
  } catch {
    alert("Error en la inscripción. Habla con el administrador.");
  }
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

.color-text {
  color: #4caf50; /* Success Lighten-1 color */
}
</style>
