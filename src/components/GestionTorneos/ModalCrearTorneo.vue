<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Crear torneo</v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <v-form ref="form" v-model="isValid" lazy-validation>
          <!-- Nombre del torneo -->
          <v-text-field
            v-model="nombreTorneo"
            label="Nombre del torneo"
            required
            type="text"
            :rules="[(v:string) => !!v || 'Campo obligatorio']"
          ></v-text-field>

          <!-- Descripción del torneo -->
          <v-textarea
            v-model="descripcionTorneo"
            label="Descripción del torneo (opcional)"
            type="text"
            clearable
          ></v-textarea>

          <!-- Lugar del torneo -->
          <!-- Campo de búsqueda de dirección -->
          <v-text-field
            v-model="searchQuery"
            label="¿Dónde se celebra el torneo?"
            placeholder="Ej: Calle Gran Vía, Madrid"
            @keyup.enter="searchLocation"
            required
            :loading="isSearching"
          >
            <template v-slot:append>
              <v-btn color="primary" variant="tonal" @click="searchLocation"
                >Buscar</v-btn
              >
            </template>
          </v-text-field>

          <!-- Mensaje de error -->
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <!-- Muestra la dirección formateada si es válida -->
          <p v-else>Dirección validada: {{ formattedAddress }}</p>

          <!-- Mapa solo para visualización (NO interactivo) -->
          <l-map
            v-if="selectedLocation"
            :zoom="zoom"
            :center="[selectedLocation.lat, selectedLocation.lng]"
            :options="{
              dragging: false,
              zoomControl: false,
              scrollWheelZoom: false,
            }"
            style="height: 300px; width: 100%"
          >
            <l-tile-layer :url="tileLayerUrl"></l-tile-layer>
            <l-marker :lat-lng="selectedLocation">
              <l-popup>{{ formattedAddress }}</l-popup>
            </l-marker>
          </l-map>

          <!-- Límite de participantes -->
          <v-text-field
            v-model="limiteParticipantes"
            label="Limite de jugadores"
            required
            type="number"
            :rules="[(v: number) => !isNaN(v) || 'Debe ser un número',
               (v: number) => v > 0 || 'Debe ser mayor que 0']"
          ></v-text-field>

          <!-- puntosTorneo -->
          <v-text-field
            v-model="puntosTorneo"
            label="¿A cuantos puntos es el torneo?"
            required
            type="number"
            :rules="[(v: number) => !isNaN(v) || 'Debe ser un número',
               (v: number) => v > 0 || 'Debe ser mayor que 0']"
          ></v-text-field>

          <!-- listasPorJugador -->
          <v-text-field
            v-model="listasPorJugador"
            label="¿Cúantas listas necesitará un jugador?"
            required
            type="number"
            :rules="[(v: number) => !isNaN(v) || 'Debe ser un número',
               (v: number) => v > 0 || 'Debe ser mayor que 0']"
          ></v-text-field>

          <!-- Numero de rondas -->
          <v-text-field
            v-model="numeroPartidas"
            label="¿Cuantas rondas tiene el torneo?"
            required
            type="number"
            :rules="[(v: number) => !isNaN(v) || 'Debe ser un número',
               (v: number) => v > 0 || 'Debe ser mayor que 0']"
          ></v-text-field>

          <!-- Tipo de torneo -->
          <v-select
            v-model="tipoTorneo"
            label="¿De qué tipo es el torneo?"
            required
            :items="['Individual', 'Parejas', 'Equipos de 4', 'Equipos de 6']"
            :rules="[(v:string) => !!v || 'Campo obligatorio']"
          />

          <!-- fecha de inicio -->
          <v-text-field
            v-model="fechaInicioTorneo"
            label="Fecha de inicio del torneo"
            type="date"
            :rules="[
              validateRequired,
              validateNotPast,
              validateFechaInicioFinTorneo,
            ]"
            required
            @dateChanged="handleDateChangeInicio"
          ></v-text-field>

          <!-- Fecha de fin del torneo -->
          <v-text-field
            v-model="fechaFinTorneo"
            label="Fecha de fin del torneo"
            type="date"
            :rules="[validateRequired, validateFechaFinInicioTorneo]"
            required
            @dateChanged="handleDateChangeFin"
          ></v-text-field>

          <!-- Precio del torneo -->
          <v-text-field
            v-model="precioTorneo"
            label="¿Cuál es el precio del torneo?"
            required
            type="number"
            :rules="[(v: number) => !isNaN(v) || 'Debe ser un número']"
          ></v-text-field>

          <!-- metodosPago -->
          <v-textarea
            v-model="metodosPago"
            label="¿Como se puede pagar?"
            type="text"
            clearable
          ></v-textarea>

          <!-- Inicio de las inscripciones -->
          <v-text-field
            v-model="fechaInicioInscripcion"
            label="Inicio de las inscripciones"
            type="date"
            :rules="[
              validateRequired,
              validateAntesDe(
                fechaFinInscripcion,
                'Debe ser antes de la fecha de fin de inscripción'
              ),
              validateAntesDe(
                fechaInicioTorneo,
                'Debe ser antes de la fecha de inicio del torneo'
              ),
            ]"
            required
            clearable
            @dateChanged="handleDateChangeInicioInscripcion"
          ></v-text-field>

          <!-- Último día para apuntarse -->
          <v-text-field
            v-model="fechaFinInscripcion"
            label="Último día para apuntarse al torneo"
            type="date"
            :rules="[
              validateRequired,
              validateFinDespuesDeInicio(
                fechaInicioInscripcion,
                'Debe ser posterior al inicio de inscripción'
              ),
              validateAntesDe(
                fechaInicioTorneo,
                'Debe ser antes del inicio del torneo'
              ),
            ]"
            required
            @dateChanged="handleDateChangeInscripcion"
          ></v-text-field>

          <!-- Último día para entregar las listas -->
          <v-text-field
            v-model="fechaFinEntregaListas"
            label="Último día para entregar las listas"
            type="date"
            :rules="[
              validateRequired,
              validateFinDespuesDeInicio(
                fechaFinInscripcion,
                'Debe ser posterior al cierre de inscripciones'
              ),
              validateAntesDe(
                fechaInicioTorneo,
                'Debe ser antes del inicio del torneo'
              ),
            ]"
            required
            @dateChanged="handleDateChangeListas"
          ></v-text-field>

          <!-- bases del torneo -->
          <v-file-input
            clearable
            label="Bases del torneo"
            required
            accept="application/pdf"
            show-size
            @change="onFileChange"
          ></v-file-input>

          <!-- cartel del torneo -->
          <v-file-input
            ref="imageInput"
            label="Selecciona una imagen"
            @change="onImageSelected"
            accept="image/*"
            show-size
          ></v-file-input>

          <!-- hora del comienza del torneo -->
          <v-text-field
            v-model="horaInicioTorneo"
            label="Hora de inicio del torneo (HH:MM)"
            clearable
            :rules="[
              (v:any) =>
                /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v) ||
                'Formato debe ser HH:MM',
            ]"
          ></v-text-field>
          <!-- hora a la que acaba del torneo -->
          <v-text-field
            v-model="horaFinTorneo"
            label="Hora de finalización del torneo (HH:MM)"
            clearable
            :rules="[
              (v:any) =>
                /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v) ||
                'Formato debe ser HH:MM',
            ]"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-row justify="center" class="my-4 ga-5">
          <v-btn
            :disabled="isGenerating || formattedAddress == ''"
            @click="confirmarConfiguracion"
            color="primary"
            variant="tonal"
            >Crear</v-btn
          >
          <v-btn variant="tonal" color="secondary" @click="closeModal" large
            >Cancelar</v-btn
          >
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de progreso circular -->
  <v-dialog v-model="isGenerating" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
      ></v-progress-circular>
      <div class="text-center">Guardando torneo...</div>
    </v-card>
  </v-dialog>

  <!-- Modal response eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Torneo creado correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido crear el torneo. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { CrearTorneoDTO } from "@/interfaces/Torneo";
import { crearTorneo } from "@/services/TorneosService";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const searchQuery = ref<string>("");
const formattedAddress = ref<string>("");
const selectedLocation = ref<{ lat: number; lng: number } | null>(null);
const errorMessage = ref<string>("");
const zoom = ref<number>(14);
const tileLayerUrl = ref<string>(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
);

const isSearching = ref<boolean>(false);
// Función para buscar la dirección ingresada por el usuario
const searchLocation = async () => {
  if (!searchQuery.value.trim()) return;

  isSearching.value = true;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    searchQuery.value
  )}&addressdetails=1`;

  try {
    const response = await axios.get(url);
    if (response.data.length > 0) {
      const firstResult = response.data[0];
      selectedLocation.value = {
        lat: parseFloat(firstResult.lat),
        lng: parseFloat(firstResult.lon),
      };
      lugarTorneo.value = firstResult.lat + ", " + firstResult.lon;
      formattedAddress.value = formatAddress(firstResult);
      errorMessage.value = "";
    } else {
      errorMessage.value =
        "No se encontró la dirección. Se guardará sin enlace a Google Maps.";
      selectedLocation.value = null;
      lugarTorneo.value = searchQuery.value;
      formattedAddress.value = searchQuery.value;
    }
  } catch (error) {
    console.error("Error buscando la dirección:", error);
    errorMessage.value = "Error al buscar la dirección.";
  } finally {
    isSearching.value = false;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatAddress = (data: any): string => {
  if (!data || !data.display_name) return "Dirección no disponible";

  const { name, address } = data;

  // Extraer componentes clave
  const road = address.road || name || "";
  const houseNumber = address.house_number ? `, ${address.house_number}` : "";
  const city = address.city || address.town || address.village || "";
  const state = address.state || "";
  const postcode = address.postcode || "";
  const country = address.country || "";

  // Construir dirección con formato legible
  return [`${road}${houseNumber}`, city, state, postcode, country]
    .filter(Boolean) // Elimina valores vacíos
    .join(", ");
};

const props = defineProps<{
  isVisible: boolean;
  idUsuario: number;
}>();
const emit = defineEmits(["close", "confirm"]);

const internalIsVisible = ref(props.isVisible);
const isValid = ref(true);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
  }
);

const handleDateChangeInicio = (newDate: string | null) => {
  if (newDate) fechaInicioTorneo.value = convertirFecha(newDate);
};
const handleDateChangeFin = (newDate: string | null) => {
  if (newDate) fechaFinTorneo.value = convertirFecha(newDate);
};
const handleDateChangeInscripcion = (newDate: string | null) => {
  if (newDate) fechaFinInscripcion.value = convertirFecha(newDate);
};
const handleDateChangeListas = (newDate: string | null) => {
  if (newDate) fechaFinEntregaListas.value = convertirFecha(newDate);
};
const handleDateChangeInicioInscripcion = (newDate: string | null) => {
  if (newDate) fechaInicioInscripcion.value = convertirFecha(newDate);
};
const nombreTorneo = ref<string>();
const limiteParticipantes = ref<number>();
const descripcionTorneo = ref<string>();
const precioTorneo = ref<number>();
const numeroPartidas = ref<number>();
const puntosTorneo = ref<number>();
const listasPorJugador = ref<number>();
const estadoTorneo = ref<number>(1);
const lugarTorneo = ref<string>();
const tipoTorneo = ref<string>("");
const esLiga = ref<boolean>(false);
const idRangoTorneo = ref<number>(1);
const esMatchedPlayTorneo = ref<boolean>(false);
const metodosPago = ref<string>("");
const horaInicioTorneo = ref<string>("00:00");
const horaFinTorneo = ref<string>("00:00");
const fechaInicioInscripcion = ref<string>("");
const fechaInicioTorneo = ref<string>("");
const fechaFinTorneo = ref<string>("");
const fechaFinEntregaListas = ref<string>("");
const fechaFinInscripcion = ref<string>("");
const imageInput = ref<HTMLInputElement | null>(null);
const imageBase64 = ref<string | null>(null);
const byteArrayBases = ref<Uint8Array | null>(null);
const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const errorFechaTorneo = ref<string>("");
const errorFechaInscripcion = ref<string>("");
const errorFechaCierreInscripcion = ref<string>("");
const errorFechaListas = ref<string>("");

watch([fechaInicioTorneo, fechaFinTorneo], ([inicio, fin]) => {
  errorFechaTorneo.value =
    inicio && fin && new Date(inicio) > new Date(fin)
      ? "La fecha de comienzo del torneo debe ser anterior a la fecha de finalización."
      : "";
});

watch([fechaInicioInscripcion, fechaFinInscripcion], ([inicio, fin]) => {
  errorFechaInscripcion.value =
    inicio && fin && new Date(inicio) > new Date(fin)
      ? "La fecha de apertura de inscripciones debe ser anterior a la de cierre."
      : "";
});

watch(
  [fechaFinInscripcion, fechaInicioTorneo],
  ([finInscrip, inicioTorneo]) => {
    errorFechaCierreInscripcion.value =
      finInscrip &&
      inicioTorneo &&
      new Date(finInscrip) > new Date(inicioTorneo)
        ? "El cierre de inscripciones debe ser anterior al inicio del torneo."
        : "";
  }
);

watch(
  [fechaFinEntregaListas, fechaInicioTorneo],
  ([finListas, inicioTorneo]) => {
    errorFechaListas.value =
      finListas && inicioTorneo && new Date(finListas) > new Date(inicioTorneo)
        ? "La fecha de cierre de envío de listas debe ser anterior al inicio del torneo."
        : "";
  }
);

const convertirFecha = (dateString: string) => {
  const dateParts = dateString.split("/");

  if (dateParts.length !== 3) {
    throw new Error("El formato de la fecha debe ser dd-mm-aaaa");
  }

  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];

  return `${year}-${month}-${day}`;
};

const onImageSelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 500; // Cambia esto al ancho máximo deseado
        const maxHeight = 500; // Cambia esto a la altura máxima deseada
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convertir el canvas a base64
          imageBase64.value = canvas.toDataURL("image/jpeg", 0.7); // Ajusta la calidad de 0 a 1
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        byteArrayBases.value = new Uint8Array(arrayBuffer);
      }
    };

    reader.readAsArrayBuffer(file);
  }
};

const confirmarConfiguracion = async () => {
  if (!isValid.value) {
    const missingFields = [];
    if (!nombreTorneo.value) missingFields.push("Nombre del torneo");
    if (!limiteParticipantes.value) missingFields.push("Limite de jugadores");
    if (!lugarTorneo.value) missingFields.push("Lugar del torneo");
    if (!puntosTorneo.value) missingFields.push("Puntos del torneo");
    if (!numeroPartidas.value) missingFields.push("Número de rondas");
    if (!listasPorJugador.value) missingFields.push("Listas por jugador");
    if (!fechaInicioTorneo.value)
      missingFields.push("Fecha de inicio del torneo");
    if (!fechaFinTorneo.value) missingFields.push("Fecha de fin del torneo");
    if (!precioTorneo.value) missingFields.push("Precio del torneo");
    if (!fechaFinInscripcion.value)
      missingFields.push("Último día para apuntarse");
    if (!fechaInicioInscripcion.value)
      missingFields.push("Primer día para apuntarse");
    if (!fechaFinEntregaListas.value)
      missingFields.push("Último día para entregar listas");
    if (!horaFinTorneo.value)
      missingFields.push("Hora de finalización del torneo");
    if (!horaInicioTorneo.value)
      missingFields.push("Hora de inicio del torneo");
    if (!tipoTorneo.value) missingFields.push("Tipo de torneo");

    // Alert with missing fields
    alert(
      `Por favor, rellena los siguientes campos:\n- ${missingFields.join(
        "\n- "
      )}`
    );
    return;
  }

  const basesTorneoBase64 = byteArrayBases.value
    ? btoa(
        new Uint8Array(byteArrayBases.value).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      )
    : null;

  if (tipoTorneo.value == "Equipos de 4") tipoTorneo.value = "Equipos_4";
  if (tipoTorneo.value == "Equipos de 6") tipoTorneo.value = "Equipos_6";

  const nuevoTorneo: CrearTorneoDTO = {
    idUsuario: props.idUsuario,
    nombreTorneo: nombreTorneo.value ?? "",
    limiteParticipantes: limiteParticipantes.value ?? 50,
    fechaInicioTorneo: fechaInicioTorneo.value ?? "",
    fechaFinTorneo: fechaFinTorneo.value ?? "",
    precioTorneo: precioTorneo.value ?? 0,
    numeroPartidas: numeroPartidas.value ?? 3,
    puntosTorneo: puntosTorneo.value ?? 500,
    estadoTorneo: estadoTorneo.value,
    lugarTorneo: lugarTorneo.value ?? "",
    tipoTorneo: tipoTorneo.value,
    esLiga: esLiga.value,
    idRangoTorneo: idRangoTorneo.value,
    esMatchedPlayTorneo: esMatchedPlayTorneo.value,
    fechaEntregaListas: fechaFinEntregaListas.value ?? "",
    fechaFinInscripcion: fechaFinInscripcion.value ?? "",
    horaInicioTorneo: horaInicioTorneo.value + ":00",
    horaFinTorneo: horaFinTorneo.value + ":00",
    cartelTorneo: imageBase64.value ?? "",
    basesTorneo: basesTorneoBase64 ?? "",
    descripcionTorneo: descripcionTorneo.value,
    inicioInscripciones: fechaInicioInscripcion.value ?? "",
    listasPorJugador: listasPorJugador.value ?? 1,
  };
  try {
    isGenerating.value = true;
    await crearTorneo(nuevoTorneo);

    showSuccessModal.value = true;
    resetElement();
  } catch (error) {
    showErrorModal.value = true;
    console.error(error);
  } finally {
    isGenerating.value = false;
  }

  emit("confirm");
  closeModal();
};

const resetElement = () => {
  nombreTorneo.value = "";
  limiteParticipantes.value = 0;
  fechaInicioTorneo.value = "";
  fechaFinTorneo.value = "";
  precioTorneo.value = 0;
  numeroPartidas.value = 3;
  puntosTorneo.value = 500;
  lugarTorneo.value = "";
  fechaFinEntregaListas.value = "";
  fechaFinInscripcion.value = "";
  horaInicioTorneo.value = ":00";
  horaFinTorneo.value = ":00";
  imageBase64.value = "";
  descripcionTorneo.value = "";
  fechaInicioInscripcion.value = "";
  listasPorJugador.value = 1;
};

const today = new Date().toISOString().split("T")[0];

const validateRequired = (v: string) => !!v || "Campo obligatorio";
const validateNotPast = (v: string) =>
  v >= today || "No puede ser una fecha pasada";
const validateFechaInicioFinTorneo = (v: string) =>
  !fechaFinTorneo.value ||
  v <= fechaFinTorneo.value ||
  "Debe ser anterior o igual a la fecha de fin";
const validateFechaFinInicioTorneo = (v: string) =>
  !fechaInicioTorneo.value ||
  v >= fechaInicioTorneo.value ||
  "Debe ser posterior o igual a la fecha de inicio";

const validateFinDespuesDeInicio =
  (inicio: string, mensaje = "Debe ser posterior o igual al inicio") =>
  (v: string) =>
    !inicio || !v || v >= inicio || mensaje;

const validateAntesDe = (fechaLimite: string, mensaje: string) => (v: string) =>
  !fechaLimite || !v || v <= fechaLimite || mensaje;
</script>
<style scoped></style>
