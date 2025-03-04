<template>
  <v-container>
    <v-card>
      <!-- Tabs -->
      <v-tabs v-model="tab" color="primary" grow>
        <v-tab value="one" aria-label="Información del Torneo"> Detalle </v-tab>
        <v-tab value="two" aria-label="Participantes"> Inscritos </v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <!-- Información del Torneo -->
          <v-window-item value="one">
            <v-row justify="center">
              <v-col cols="12" md="10">
                <v-card v-if="torneo" class="pa-3">
                  <v-img :src="torneo.cartelTorneo || require('@/assets/images/cartelMissing.jpg')" height="250px" class="rounded-lg" />
                  <v-card-title class="text-h5 text-center font-weight-bold mt-3">
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

                  <v-divider class="mb-3"></v-divider>

                  <v-card-text>
                    <v-row>
                      <v-col cols="12">
                        <p class="text-subtitle-1"><v-icon left color="blue">mdi-text</v-icon> <strong>Descripción</strong><br/> {{ torneo.descripcionTorneo }}</p>
                      </v-col>

                      <v-divider></v-divider>

                      <v-col cols="10" offset="1" class="text-center">
                        <p class="text-h6"><v-icon color="cyan">mdi-trophy</v-icon> <strong>Puntos:</strong> {{ torneo.puntosTorneo }}</p>
                      </v-col>

                      <v-divider class="mb-3"></v-divider>

                      <v-col cols="12" sm="6">
                        <p><v-icon left color="green">mdi-calendar</v-icon> <strong>Fecha:</strong> {{ formatDate(torneo.fechaInicioTorneo) }} a las {{ torneo.horaInicioTorneo }}</p>
                        <p><v-icon left color="red">mdi-calendar-clock</v-icon> <strong>Inscripciones abiertas:</strong> {{ formatDate(torneo.inicioInscripciones) }}</p>
                        <p><v-icon left color="red">mdi-calendar-clock</v-icon> <strong>Inscripción hasta:</strong> {{ formatDate(torneo.fechaFinInscripcion) }}</p>
                        <p><v-icon left color="orange">mdi-list-status</v-icon> <strong>Entrega de Listas:</strong> {{ formatDate(torneo.fechaEntregaListas) }}</p>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <p><v-icon left color="green">mdi-cash</v-icon> <strong>Precio:</strong> {{ torneo.precioTorneo }}€</p>
                        <p><v-icon left color="teal">mdi-account-group</v-icon> <strong>Participantes:</strong> {{ participantes.length }}/{{ torneo.limiteParticipantes || "Sin límite" }}</p>
                        <p><v-icon left color="pink">mdi-dice-multiple</v-icon> <strong>Partidas:</strong> {{ torneo.numeroPartidas }}</p>
                      </v-col>
                    </v-row>
                  </v-card-text>

                  <v-divider class="mb-3"></v-divider>

                  <v-card-actions class="d-flex justify-space-between">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-btn variant="tonal" color="blue" :disabled="!torneo.tieneBases" @click="descargarBases" block>
                          <v-icon left>mdi-file-download</v-icon> Descargar Bases
                        </v-btn>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <span v-if="isInscripcionCerrada" class="text-red text-subtitle-1">
                          Plazo de inscripción cerrado
                        </span>
                        <span v-else-if="inscripcionState === 'completo'" class="text-red text-subtitle-1">
                          Plazas agotadas
                        </span>
                        <span v-else-if="estaApuntado">
                          <span v-if="!isInscripcionCerrada">
                            <v-btn variant="tonal" color="red" @click="inscripcionIndividual" block>
                              <v-icon left>mdi-check-circle</v-icon> Borrar inscripción
                            </v-btn>
                          </span>
                          <span v-else class="text-subtitle-1">
                            Estás apuntado pero las inscripciones están cerradas, no está permitido borrar la inscripción.
                          </span>
                        </span>
                        <span v-else>
                          <span v-if="torneo.tipoTorneo == 'Individual'">
                            <v-btn variant="tonal" color="green" @click="inscripcionIndividual" block>
                              <v-icon left>mdi-check-circle</v-icon> Apuntarse
                            </v-btn>
                          </span>
                          <span v-else>
                            <v-btn variant="tonal" color="green" @click="inscripcionPorEquipos(torneo.tipoTorneo)" block>
                              <v-icon left>mdi-check-circle</v-icon> Apuntarse
                            </v-btn>
                          </span>
                          <!--<v-btn variant="tonal" color="green" @click="showModalResponse" block>
                            <v-icon left>mdi-check-circle</v-icon> Apuntarse
                          </v-btn>-->
                        </span>
                      </v-col>
                    </v-row>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <!-- Participantes -->
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="two">
            <v-card flat>
              <v-card-title class="d-flex align-center">
                <p v-if="torneo?.tipoTorneo == 'Individual'"><v-icon left>mdi-account-group</v-icon> Participantes</p>
                <p v-else><v-icon left>mdi-account-group</v-icon> Equipos</p>
                <v-spacer></v-spacer>
                <v-text-field v-model="search" label="Buscar" prepend-inner-icon="mdi-magnify" variant="outlined" dense></v-text-field>
              </v-card-title>
              <v-divider></v-divider>
              <div v-if="torneo?.tipoTorneo == 'Individual'">
                <v-data-table v-model:search="search" :items="participantes" :loading="isLoading" :headers="headers">
                  <template v-slot:item="{ item }">
                    <tr @click="goToUserDetail(item.idUsuario)" class="clickable-row">
                      <td><v-chip color="orange" dark>{{ item.nick }}</v-chip></td>
                    </tr>
                  </template>
                </v-data-table>
              </div>
              <div v-else>
                <v-data-table
                  v-model:search="search"
                  :items="infoEquipos"
                  :loading="isLoading"
                  :headers="headersEquipos"
                  class="custom-table"
                  item-key="nombreEquipo"
                >
                  <template v-slot:item="{ item }">
                    <tr @click="goToEquipoDetail(item)" class="clickable-row">
                      <td>
                        <v-chip color="orange" dark>{{
                          item.nombreEquipo
                        }}</v-chip>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </div>
            </v-card>
          </v-window-item>
        </v-window>
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

  </v-container>
</template>


<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Torneo } from "@/interfaces/Torneo";
import {
  descargarBasesTorneo,
  getEquiposByTorneoAsync,
  getTorneo,
} from "@/services/TorneosService";
import {
  getInscripcionesIndividualByUser,
  getInscripcionesTorneo,
  registrarInscripcion,
  cancelarInscripcion
} from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import {
  CrearInscripcionDTO,
  EquipoDTO,
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
const idInscripcion = ref<number>(0);
const torneosApuntado = ref<InscripcionUsuarioIndividualDTO[]>();

const tab = ref(0);
const search = ref<string>("");
const isLoading = ref<boolean>(true);
const headers = [{ title: "Nick", key: "nick" }];
const headersEquipos = [{ title: "Nombre del equipo", key: "nombreEquipo" }];
const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const isRegistering = ref<boolean>(false);
const showModalInscripcionPorEquipos = ref<boolean>(false);

const infoEquipos = ref<EquipoDTO | null>(null);



// Variables reactivas
const formattedAddress = ref<string>("");

// Computed property para generar el enlace a Google Maps
const googleMapsUrl = computed(() => {
  if (!torneo.value?.lugarTorneo) return "#";
  return `https://www.google.com/maps?q=${parseFloat(torneo.value!.lugarTorneo.split(", ")[0])},${parseFloat(torneo.value!.lugarTorneo.split(", ")[1])}`;
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






// Computed para gestionar el estado de inscripción
const inscripcionState = computed(() => {
  if (isTorneoCompletado.value) return "completo";
  if (estaApuntado.value) return "apuntado";
  return "noApuntado";
});

// Computed para verificar si el plazo de inscripción está cerrado
const isInscripcionCerrada = computed(() => {
  if (
    !torneo.value ||
    !torneo.value.fechaFinInscripcion ||
    !torneo.value.inicioInscripciones
  )
    return false;
  const fechaActual = new Date();
  const fechaFinInscripcion = new Date(torneo.value.fechaFinInscripcion);
  const fechaInicioInscripcion = new Date(torneo.value.inicioInscripciones);

  return (
    fechaActual > fechaFinInscripcion || fechaActual < fechaInicioInscripcion
  );
});

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUsuario } });
};
const goToEquipoDetail = (idEquipo: number) => {
  //TODO: modal con la info (nick) de los jugadores que se pueda pulsar en ellos y te lleven a su perfil
};


const eliminarInscripcion = async (idInscripcion: number) => {
  isRegistering.value = true;
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessModal.value = true;
    } else {
      showErrorModal.value = true;
    }
  } catch {
    isRegistering.value = false;
    showErrorModal.value = true;
  } finally {
    isRegistering.value = false;
  }
};


// Montaje y obtención de datos
onMounted(async () => {
  isLoading.value = true;
  if (idUsuario.value != null) {
    idTorneo.value = Number(route.params.idTorneo);

    //TODO Cambiar getInscripcionesUser por servicio que devuelva el estado de la inscripción al torneo. 
    // No es necesario tener una lista de inscripciones, es mas optimo solo la inscripción al torneo.
    // Paralelizar las solicitudes
    const [responseTorneo, responseInscripcion, responseInscriptionesUser] =
      await Promise.all([
        getTorneo(idTorneo.value),
        getInscripcionesTorneo(idTorneo.value),
        getInscripcionesIndividualByUser(idUsuario.value),
      ]);

    torneo.value = responseTorneo.data;
    //console.log("Torneo",torneo.value);
    participantes.value = responseInscripcion.data;
    torneosApuntado.value = responseInscriptionesUser.data;

    // Verificar si el usuario ya está apuntado
    if (torneosApuntado.value != null) {
      torneosApuntado.value.forEach((element) => {
        if (element.idTorneo === idTorneo.value) {
          idInscripcion.value=element.idInscripcion;
          estaApuntado.value = true;
        }
      });

      // Verificar si el torneo está completo
      if (torneo.value && torneo.value.limiteParticipantes) {
        if (participantes.value.length >= torneo.value.limiteParticipantes) {
          isTorneoCompletado.value = true;
        }
      }
    }
  }
  //TODO Mejorar y solo traer los equipos si es torneo por equipos
  if (idTorneo.value) {
    const responseEquipos = await getEquiposByTorneoAsync(idTorneo.value);

    infoEquipos.value = responseEquipos.data;
    //console.log("Equipos", responseEquipos.data);
  }
  try {
    if (isValidCoordinates(torneo.value!.lugarTorneo)){
      getAddress(parseFloat(torneo.value!.lugarTorneo.split(", ")[0]), parseFloat(torneo.value!.lugarTorneo.split(", ")[1]));
    }
  } catch (err) {
    console.error("Error al obtener coordenadas del torneo:", err);
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
    !isInscripcionCerrada.value &&
    idInscripcion.value == 0
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
  else{
    //TODO necesito la inscripcion del torneo a borrar
    eliminarInscripcion(idInscripcion.value);
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
