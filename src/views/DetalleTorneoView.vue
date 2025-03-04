<template>
  <v-container>
    <v-card>
      <!-- Tabs -->
      <v-tabs v-model="tab" color="primary" grow>
        <v-tab value="one" aria-label="Información del Torneo"> Detalle </v-tab>
        <v-tab value="two" aria-label="Participantes"> Inscritos </v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <!-- Tab Información del Torneo -->
          <v-tabs-window-item value="one">
            <v-row justify="center">
              <v-col cols="12" md="12">
                <v-card v-if="torneo">
                  <v-img :src="torneo.cartelTorneo" height="200px" />
                  <v-card-title align="center">{{
                    torneo.nombreTorneo
                  }}</v-card-title>
                  <v-card-subtitle align="center">{{
                    torneo.lugarTorneo
                  }}</v-card-subtitle>
                  <v-card-text>
                    <p>
                      <strong>Descripción:</strong>
                      {{ torneo.descripcionTorneo }}
                    </p>
                    <p>
                      <strong>Fecha:</strong>
                      {{ formatDate(torneo.fechaInicioTorneo) }} a las
                      {{ torneo.horaInicioTorneo }}
                    </p>
                    <p>
                      <strong>Inscripción hasta:</strong>
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
                    <p>
                      <strong>Número de Partidas:</strong>
                      {{ torneo.numeroPartidas }}
                    </p>
                    <p>
                      <strong>Puntos del Torneo:</strong>
                      {{ torneo.puntosTorneo }}
                    </p>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      variant="tonal"
                      color="blue lighten-2"
                      @click="descargarBases"
                      block
                      >Descargar Bases</v-btn
                    >
                  </v-card-actions>

                  <v-divider class="my-3"></v-divider>

                  <v-card-actions>
                    <v-btn
                      variant="tonal"
                      color="orange lighten-2"
                      @click="goBack"
                      >Volver</v-btn
                    >

                    <!-- Verificación de la fecha de inscripción -->
                    <div v-if="isInscripcionCerrada" class="color-text">
                      ¡Plazo de inscripción cerrado!
                    </div>
                    <div
                      v-else-if="inscripcionState === 'completo'"
                      class="color-text"
                    >
                      ¡COMPLETO!
                    </div>
                    <div
                      v-else-if="inscripcionState === 'apuntado'"
                      class="color-text"
                    >
                      Ya estás apuntado
                    </div>
                    <div v-else>
                      <div v-if="torneo.tipoTorneo == 'Individual'">
                        <v-btn
                          variant="tonal"
                          color="success lighten-1"
                          @click="inscripcionIndividual"
                          :disabled="isRegistering"
                          >Apúntate</v-btn
                        >
                      </div>
                      <div v-else>
                        <v-btn
                          variant="tonal"
                          color="success lighten-1"
                          @click="inscripcionPorEquipos(torneo.tipoTorneo)"
                          :disabled="isRegistering"
                          >Apúntate</v-btn
                        >
                      </div>
                    </div>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>

          <!-- Tab Participantes -->
          <v-tabs-window-item value="two">
            <v-card flat>
              <v-card-title class="d-flex align-center pe-2">
                Participantes
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  density="compact"
                  label="Buscar"
                  prepend-inner-icon="mdi-magnify"
                  variant="solo-filled"
                  flat
                  hide-details
                  single-line
                ></v-text-field>
              </v-card-title>

              <v-divider></v-divider>

              <v-data-table
                v-model:search="search"
                :items="participantes"
                :loading="isLoading"
                :headers="headers"
                class="custom-table"
                item-key="nick"
              >
                <template v-slot:item="{ item }">
                  <tr
                    @click="goToUserDetail(item.idUsuario)"
                    class="clickable-row"
                  >
                    <td>
                      <v-chip color="orange" dark>{{ item.nick }}</v-chip>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>

    <!-- Registro equipo -->
    <ModalRegistroEquipo
      :isVisible="showModalInscripcionPorEquipos"
      :tipoTorneo="torneo?.tipoTorneo"
      :idTorneo="torneo?.idTorneo"
      @update:isVisible="showModalInscripcionPorEquipos = $event"
    />

    <!-- Modal Success -->
    <ModalSuccess
      :isVisible="showSuccessModal"
      message="Te has registrado con éxito."
      @update:isVisible="showSuccessModal = $event"
    />

    <!-- Modal Error -->
    <ModalError
      :isVisible="showErrorModal"
      message="No se ha podido registrar la inscripción. Contacta con el administrador."
      @update:isVisible="showErrorModal = $event"
    />

    <!-- Spinner Modal -->
    <v-dialog v-model="isRegistering" persistent width="300">
      <v-card>
        <v-card-text
          class="d-flex justify-center align-center"
          style="height: 150px"
        >
          <v-progress-circular
            indeterminate
            color="blue-lighten-3"
            :size="57"
          ></v-progress-circular>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Torneo } from "@/interfaces/Torneo";
import { descargarBasesTorneo, getTorneo } from "@/services/TorneosService";
import {
  getInscripcionesIndividualByUser,
  getInscripcionesTorneo,
  registrarInscripcion,
} from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import {
  CrearInscripcionDTO,
  InscripcionUsuarioIndividualDTO,
} from "@/interfaces/Inscripcion";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalRegistroEquipo from "@/components/Inscripcion/ModalRegistroEquipo.vue";

const { getidUsuario } = useAuth();
const route = useRoute();
const router = useRouter();

const torneo = ref<Torneo>();
const participantes = ref<InscripcionUsuarioIndividualDTO[]>([]);
const idUsuario = ref<string | null>(getidUsuario.value);
const idTorneo = ref<number>();
const estaApuntado = ref<boolean>(false);
const isTorneoCompletado = ref<boolean>(false);
const torneosApuntado = ref<InscripcionUsuarioIndividualDTO[]>();

const tab = ref(0);
const search = ref<string>("");
const isLoading = ref<boolean>(true);
const headers = [{ title: "Nick", key: "nick" }];
const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const isRegistering = ref<boolean>(false);
const showModalInscripcionPorEquipos = ref<boolean>(false);

// Computed para gestionar el estado de inscripción
const inscripcionState = computed(() => {
  if (isTorneoCompletado.value) return "completo";
  if (estaApuntado.value) return "apuntado";
  return "noApuntado";
});

// Computed para verificar si el plazo de inscripción está cerrado
const isInscripcionCerrada = computed(() => {
  if (!torneo.value || !torneo.value.fechaFinInscripcion) return false;
  const fechaActual = new Date();
  const fechaFinInscripcion = new Date(torneo.value.fechaFinInscripcion);
  return fechaActual > fechaFinInscripcion;
});

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUsuario } });
};

// Montaje y obtención de datos
onMounted(async () => {
  isLoading.value = true;
  if (idUsuario.value != null) {
    idTorneo.value = Number(route.params.idTorneo);

    // Paralelizar las solicitudes
    const [responseTorneo, responseInscripcion, responseInscriptionesUser] =
      await Promise.all([
        getTorneo(idTorneo.value),
        getInscripcionesTorneo(idTorneo.value),
        getInscripcionesIndividualByUser(idUsuario.value),
      ]);

    torneo.value = responseTorneo.data;
    participantes.value = responseInscripcion.data;
    torneosApuntado.value = responseInscriptionesUser.data;

    // Verificar si el usuario ya está apuntado
    if (torneosApuntado.value != null) {
      torneosApuntado.value.forEach((element) => {
        if (element.idTorneo === idTorneo.value) estaApuntado.value = true;
      });

      // Verificar si el torneo está completo
      if (torneo.value && torneo.value.limiteParticipantes) {
        if (participantes.value.length >= torneo.value.limiteParticipantes) {
          isTorneoCompletado.value = true;
        }
      }
    }
  }
  isLoading.value = false;
});

watch(
  () => showSuccessModal.value,
  (newValue) => {
    if (!newValue) {
      router.push({ name: "mis-torneos", params: { tab: "three" } });
    }
  }
);

const formatDate = (date: string | number | Date | undefined) =>
  date ? new Date(date).toLocaleDateString() : "Fecha no disponible";

const goBack = () => router.go(-1);

const descargarBases = async () => {
  try {
    if (idTorneo.value) {
      const response = await descargarBasesTorneo(idTorneo.value);
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bases_Torneo_${torneo.value?.nombreTorneo}.pdf`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Error descargando el archivo:", error);
    alert("Error al descargar el archivo. Por favor, inténtelo de nuevo.");
  }
};

const inscripcionIndividual = async () => {
  if (
    idUsuario.value != null &&
    idTorneo.value != null &&
    !isInscripcionCerrada.value
  ) {
    const inscripcion: CrearInscripcionDTO = {
      idUsuario: parseInt(idUsuario.value),
      idTorneo: idTorneo.value!,
    };
    try {
      isRegistering.value = true;
      await registrarInscripcion(inscripcion);
      showSuccessModal.value = true;
    } catch (error) {
      showErrorModal.value = true;
    } finally {
      isRegistering.value = false;
    }
  }
};

const inscripcionPorEquipos = async (tipoTorneo: string) => {
  if (
    idUsuario.value != null &&
    idTorneo.value != null &&
    !isInscripcionCerrada.value
  ) {
    showModalInscripcionPorEquipos.value = true;
  }
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
