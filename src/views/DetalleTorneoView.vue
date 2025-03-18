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
                  <v-img
                    :src="
                      torneo.cartelTorneo ||
                      require('@/assets/images/cartelMissing.jpg')
                    "
                    height="250px"
                    class="rounded-lg"
                  />
                  <v-card-title
                    class="text-h5 text-center font-weight-bold mt-3"
                  >
                    {{ torneo.nombreTorneo }}
                  </v-card-title>
                  <v-card-subtitle class="text-center mb-3">
                    <p class="text-wrap" v-if="formattedAddress.trim()">
                      <v-icon left class="location-icon">mdi-map-marker</v-icon>
                      <a
                        :href="googleMapsUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ formattedAddress }}
                      </a>
                    </p>
                    <p v-else>
                      <v-icon left class="location-icon">mdi-map-marker</v-icon>
                      {{ torneo.lugarTorneo }}
                    </p>
                  </v-card-subtitle>

                  <v-divider class="mb-3"></v-divider>

                  <v-card-text>
                    <v-row>
                      <v-col cols="12">
                        <p class="text-subtitle-1">
                          <v-icon left color="blue">mdi-text</v-icon>
                          <strong>Descripción</strong><br />
                          {{ torneo.descripcionTorneo }}
                        </p>
                      </v-col>

                      <v-divider></v-divider>

                      <v-col cols="10" offset="1" class="text-center">
                        <p class="text-h6">
                          <v-icon color="cyan">mdi-trophy</v-icon>
                          <strong>Puntos:</strong> {{ torneo.puntosTorneo }}
                        </p>
                      </v-col>

                      <v-divider class="mb-3"></v-divider>

                      <v-col cols="12" sm="6">
                        <p>
                          <v-icon left color="green">mdi-calendar</v-icon>
                          <strong>Fecha:</strong>
                          {{ formatDate(torneo.fechaInicioTorneo) }} a las
                          {{ torneo.horaInicioTorneo }}
                        </p>
                        <p>
                          <v-icon left color="red">mdi-calendar-clock</v-icon>
                          <strong>Inscripciones abiertas:</strong>
                          {{ formatDate(torneo.inicioInscripciones) }}
                        </p>
                        <p>
                          <v-icon left color="red">mdi-calendar-clock</v-icon>
                          <strong>Inscripción hasta:</strong>
                          {{ formatDate(torneo.fechaFinInscripcion) }}
                        </p>
                        <p>
                          <v-icon left color="orange">mdi-list-status</v-icon>
                          <strong>Entrega de Listas:</strong>
                          {{ formatDate(torneo.fechaEntregaListas) }}
                        </p>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <p>
                          <v-icon left color="green">mdi-cash</v-icon>
                          <strong>Precio:</strong> {{ torneo.precioTorneo }}€
                        </p>
                        <p>
                          <v-icon left color="teal">mdi-account-group</v-icon>
                          <strong>Participantes:</strong>
                          {{ participantes.length }}/{{
                            torneo.limiteParticipantes || "Sin límite"
                          }}
                        </p>
                        <p>
                          <v-icon left color="pink">mdi-dice-multiple</v-icon>
                          <strong>Partidas:</strong> {{ torneo.numeroPartidas }}
                        </p>
                      </v-col>
                    </v-row>
                  </v-card-text>

                  <v-divider class="mb-3"></v-divider>

                  <v-card-actions class="d-flex justify-space-between">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-btn
                          variant="tonal"
                          color="blue"
                          :disabled="!torneo.tieneBases"
                          @click="descargarBases"
                          block
                        >
                          <v-icon left>mdi-file-download</v-icon> Descargar
                          Bases
                        </v-btn>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <span
                          v-if="isInscripcionCerrada"
                          class="text-red text-subtitle-1"
                        >
                          Plazo de inscripción cerrado
                        </span>
                        <span
                          v-else-if="
                            new Date(torneo.fechaInicioTorneo) < new Date()
                          "
                          class="text-red text-subtitle-1"
                        >
                          Torneo ya disputado
                        </span>
                        <span
                          v-else-if="inscripcionState === 'completo'"
                          class="text-red text-subtitle-1"
                        >
                          Plazas agotadas
                        </span>
                        <span v-else-if="!estaApuntado">
                          <span v-if="!isInscripcionCerrada">
                            <span v-if="torneo.tipoTorneo != 'Individual'">
                              <v-btn
                                variant="tonal"
                                color="green"
                                @click="inscripcionPorEquipos"
                                block
                              >
                                <v-icon left>mdi-check-circle</v-icon> Apuntar
                                equipo
                              </v-btn>
                            </span>
                            <span v-else>
                              <v-btn
                                variant="tonal"
                                color="green"
                                @click="inscripcionIndividual"
                                block
                              >
                                <v-icon left>mdi-check-circle</v-icon> Apúntate
                              </v-btn>
                            </span>
                          </span>
                          <span v-else class="text-subtitle-1">
                            Estás apuntado pero las inscripciones están
                            cerradas, no está permitido borrar la inscripción.
                          </span>
                        </span>
                        <span v-else-if="estaApuntado">
                          <span v-if="!isInscripcionCerrada">
                            <span v-if="torneo.tipoTorneo != 'Individual'">
                              <v-btn
                                variant="tonal"
                                color="red"
                                @click="eliminarInscripcionEquipo(idEquipo)"
                                block
                                :disabled="!isCapitan"
                              >
                                <v-icon left>mdi-check-circle</v-icon>
                                {{ buttonText }}
                              </v-btn>
                            </span>
                            <span v-else>
                              <v-btn
                                variant="tonal"
                                color="red"
                                @click="inscripcionIndividual"
                                block
                              >
                                <v-icon left>mdi-check-circle</v-icon> Borrar
                                inscripción
                              </v-btn>
                            </span>
                          </span>
                          <span v-else class="text-subtitle-1">
                            Estás apuntado pero las inscripciones están
                            cerradas, no está permitido borrar la inscripción.
                          </span>
                        </span>
                        <span v-else>
                          <span v-if="torneo.tipoTorneo == 'Individual'">
                            <v-btn
                              variant="tonal"
                              v-if="!isLoading"
                              color="green"
                              @click="inscripcionIndividual"
                              block
                            >
                              <v-icon left>mdi-check-circle</v-icon> Apúntate
                            </v-btn>
                          </span>
                          <span v-else>
                            <v-btn
                              variant="tonal"
                              v-if="!isLoading"
                              color="green"
                              @click="inscripcionPorEquipos()"
                              block
                            >
                              <v-icon left>mdi-check-circle</v-icon> Apúntate
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

          <!-- Participantes -->
          <v-window-item value="two">
            <v-card flat>
              <v-card-title class="d-flex align-center">
                <p v-if="torneo?.tipoTorneo == 'Individual'">
                  <v-icon left>mdi-account-group</v-icon> Participantes
                </p>
                <p v-else><v-icon left>mdi-account-group</v-icon> Equipos</p>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  label="Buscar"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  dense
                ></v-text-field>
              </v-card-title>
              <v-divider></v-divider>
              <div v-if="torneo?.tipoTorneo == 'Individual'">
                <v-data-table
                  v-model:search="search"
                  :items="participantes"
                  :loading="isLoading"
                  :headers="headers"
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
              </div>
              <div v-else>
                <v-data-table
                  v-model:search="search"
                  :items="infoEquipos"
                  :loading="isLoading"
                  :headers="headersEquipos"
                  class="styled-table"
                  item-key="nombreEquipo"
                >
                  <!-- Estilizar la fila de equipos -->
                  <template v-slot:item="{ item }">
                    <tr
                      @click="toggleExpand(item.nombreEquipo)"
                      class="clickable-row"
                    >
                      <td>
                        <v-avatar color="indigo" size="40">
                          <img
                            src="@/assets/icons/equipos.png"
                            alt="Icono personalizado"
                            width="40"
                            height="40"
                          />
                        </v-avatar>
                        &nbsp;
                        <v-chip
                          color="orange darken-2"
                          text-color="white"
                          class="font-weight-bold"
                        >
                          {{ item.nombreEquipo }}
                        </v-chip>
                      </td>
                      <td class="text-center">
                        <v-icon>{{
                          expanded.includes(item.nombreEquipo)
                            ? "mdi-chevron-up"
                            : "mdi-chevron-down"
                        }}</v-icon>
                      </td>
                    </tr>

                    <!-- Contenido expandido con los participantes -->
                    <tr v-if="expanded.includes(item.nombreEquipo)">
                      <td colspan="3">
                        <v-card class="pa-3 mx-4 expanded-card">
                          <p class="text-subtitle-1 font-weight-bold">
                            Participantes
                          </p>
                          <v-list dense>
                            <v-list-item
                              v-for="participante in item.inscripciones"
                              :key="participante.idUsuario"
                            >
                              <template v-slot:prepend>
                                <v-btn
                                  icon
                                  @click="
                                    goToUserDetail(participante.idUsuario)
                                  "
                                >
                                  <img
                                    src="@/assets/icons/teamLeader.png"
                                    alt="Icono personalizado"
                                    width="50"
                                    height="50"
                                    v-if="
                                      participante.idUsuario === item?.idCapitan
                                    "
                                  />
                                  <img
                                    src="@/assets/icons/verdetalle.png"
                                    alt="Icono personalizado"
                                    width="50"
                                    height="50"
                                    v-else
                                  />
                                </v-btn>
                              </template>
                              <v-list-item-title>
                                &nbsp; {{ participante.nick || "Desconocido" }}
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-card>
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
      :idTorneo="idTorneo"
      @update:isVisible="showModalInscripcionPorEquipos = $event"
    />

    <!-- Modal Success -->
    <ModalSuccess
      :isVisible="showSuccessModal"
      :message="messageSuccess"
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
import {
  descargarBasesTorneo,
  getEquiposByTorneoAsync,
  getTorneo,
} from "@/services/TorneosService";
import {
  estaApuntadoTorneoAsync,
  getInscripcionesIndividualByUser,
  getInscripcionesTorneo,
  registrarInscripcion,
  cancelarInscripcion,
  eliminarEquipo,
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
const idTorneo = ref<number>(parseInt(route.params.idTorneo as string));

const torneo = ref<Torneo>();
const participantes = ref<InscripcionUsuarioIndividualDTO[]>([]);
const idUsuario = ref<string | null>(getidUsuario.value);
const estaApuntado = ref<boolean>(false);
const isTorneoCompletado = ref<boolean>(false);
const idInscripcion = ref<number>(0);
const idEquipo = ref<number | undefined>(undefined);

const torneosApuntado = ref<InscripcionUsuarioIndividualDTO[]>();

const tab = ref(0);
const search = ref<string>("");
const tipoTorneo = ref<string>("");

const isLoading = ref<boolean>(true);
const headers = [{ title: "Nick", key: "nick" }];
const headersEquipos = [{ title: "Nombre del equipo", key: "nombreEquipo" }];
const showSuccessModal = ref<boolean>(false);
const messageSuccess = ref<string>("");
const showErrorModal = ref<boolean>(false);
const isRegistering = ref<boolean>(false);
const showModalInscripcionPorEquipos = ref<boolean>(false);

const infoEquipos = ref<EquipoDTO[]>([]);

const expanded = ref<string[]>([]); // Guardará los equipos expandidos

const toggleExpand = (nombreEquipo: string) => {
  if (expanded.value.includes(nombreEquipo)) {
    console.log(
      "expanded.value.includes(nombreEquipo)",
      expanded.value.includes(nombreEquipo)
    );
    expanded.value = expanded.value.filter((item) => item !== nombreEquipo);
  } else {
    console.log(
      "expanded.value.push(nombreEquipo)",
      expanded.value.push(nombreEquipo)
    );
    expanded.value.push(nombreEquipo);
  }
};

//Conmuted para personalizar el botón de borrar inscripcion por equipos
const buttonText = computed(() => {
  const isCapitan = infoEquipos.value.some(
    (equipo) =>
      equipo.idCapitan ===
      (idUsuario.value ? parseInt(idUsuario.value) : undefined)
  );

  if (isCapitan) {
    return "Eliminar Equipo";
  } else {
    return "Solo el Capitán puede borrar";
  }
});

// Computado para determinar si el usuario es el capitán
const isCapitan = computed(() => {
  const equipoCapitan = infoEquipos.value.find(
    (equipo) =>
      equipo.idCapitan ===
      (idUsuario.value ? parseInt(idUsuario.value) : undefined)
  );
  console.log("equipoCapitan", equipoCapitan);
  return equipoCapitan !== undefined;
});

// Watch para actualizar el idEquipo cuando se encuentra el capitán
watch([infoEquipos, idUsuario], () => {
  const equipoCapitan = infoEquipos.value.find(
    (equipo) =>
      equipo.idCapitan ===
      (idUsuario.value ? parseInt(idUsuario.value) : undefined)
  );

  if (equipoCapitan) {
    idEquipo.value = equipoCapitan.idEquipo;
  } else {
    idEquipo.value = undefined;
  }
});

// Variables reactivas
const formattedAddress = ref<string>("");

// Computed property para generar el enlace a Google Maps
const googleMapsUrl = computed(() => {
  if (!torneo.value?.lugarTorneo) return "#";
  return `https://www.google.com/maps?q=${parseFloat(
    torneo.value!.lugarTorneo.split(", ")[0]
  )},${parseFloat(torneo.value!.lugarTorneo.split(", ")[1])}`;
});

// Función para obtener dirección inversa desde coordenadas
const getAddress = async (lat: number, lon: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.address) {
      console.log(" data.address", data);

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
      messageSuccess.value = "Te has borrado con éxito.";
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

const eliminarInscripcionEquipo = async (
  idEquipo: number | null | undefined
) => {
  isRegistering.value = true;
  if (!idEquipo) {
    showErrorModal.value = true;
    return;
  }
  try {
    const response = await eliminarEquipo(idEquipo);

    if (response.request?.status === 200) {
      messageSuccess.value = "Equipo eliminado con exito.";
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
    participantes.value = responseInscripcion.data;
    torneosApuntado.value = responseInscriptionesUser.data;

    // Verificar si el usuario ya está apuntado
    if (torneosApuntado.value != null) {
      torneosApuntado.value.forEach((element) => {
        if (element.idTorneo === idTorneo.value) {
          idInscripcion.value = element.idInscripcion;
          estaApuntado.value = true;
          if (element.idEquipo != null) idEquipo.value = element.idEquipo;
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

  if (torneo.value) tipoTorneo.value = torneo.value.tipoTorneo;

  if (idTorneo.value) {
    const responseEquipos = await getEquiposByTorneoAsync(idTorneo.value);

    infoEquipos.value = responseEquipos.data;
  }
  try {
    if (isValidCoordinates(torneo.value!.lugarTorneo)) {
      getAddress(
        parseFloat(torneo.value!.lugarTorneo.split(", ")[0]),
        parseFloat(torneo.value!.lugarTorneo.split(", ")[1])
      );
    }
  } catch (err) {
    console.error("Error al obtener coordenadas del torneo:", err);
  }
  if (idTorneo.value && idUsuario.value) {
    const responseEstaApuntado = await estaApuntadoTorneoAsync(
      idTorneo.value,
      parseInt(idUsuario.value)
    );

    if (responseEstaApuntado.data) estaApuntado.value = true;
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
  isRegistering.value = true;

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
      await registrarInscripcion(inscripcion);
      messageSuccess.value = "Te has registrado con éxito.";
      showSuccessModal.value = true;
    } catch (error) {
      isRegistering.value = false;
      showErrorModal.value = true;
    } finally {
      isRegistering.value = false;
    }
  } else {
    eliminarInscripcion(idInscripcion.value);
  }
};

const inscripcionPorEquipos = async () => {
  if (
    idUsuario.value != null &&
    idTorneo.value != 0 &&
    (tipoTorneo.value != "" || tipoTorneo.value != undefined) &&
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
.styled-table {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05); /* Fondo translúcido */
}

.clickable-row {
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

.clickable-row:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.expanded-card {
  background: rgba(0, 0, 0, 0.05);
  border-left: 4px solid #ffa726;
  border-radius: 8px;
}

.search-field {
  max-width: 250px;
}

.v-chip {
  font-size: 1.1em;
  padding: 8px;
}
</style>
