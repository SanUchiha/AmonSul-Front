<template>
  <v-dialog v-model="internalIsVisible" max-width="600px">
    <v-card>
      <v-card-title>Modificar torneo</v-card-title>

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
          <v-textarea
            v-model="lugarTorneo"
            label="¿Donde es el torneo?"
            type="text"
            clearable
            required
            :rules="[(v:string) => !!v || 'Campo obligatorio']"
          ></v-textarea>
          <!-- Límite de participantes -->
          <v-text-field
            v-model="limiteParticipantes"
            label="Limite de jugadores"
            required
            type="number"
            :rules="[(v:number) => !!v || 'Campo obligatorio y número']"
          ></v-text-field>
          <!-- puntosTorneo -->
          <v-text-field
            v-model="puntosTorneo"
            label="¿A cuantos puntos es el torneo?"
            required
            type="number"
            :rules="[(v:number) => !!v || 'Campo obligatorio y número']"
          ></v-text-field>
          <!-- Numero de rondas -->
          <v-text-field
            v-model="numeroPartidas"
            label="¿Cuantas rondas tiene el torneo?"
            required
            type="number"
            :rules="[(v:number) => !!v || 'Campo obligatorio']"
          ></v-text-field>
          <!-- fecha de inicio -->
          <DatePicker
            v-model="showFechaInicioTorneo"
            :rules="[(v:string) => !!v || 'Campo obligatorio']"
            clearable
            hide-details="auto"
            color="primary"
            label="Fecha de inicio del torneo"
            @dateChanged="handleDateChangeInicio"
          ></DatePicker>
          <v-spacer class="my-4"></v-spacer>
          <!-- Fecha de fin del torneo -->
          <DatePicker
            v-model="showFechaFinTorneo"
            :rules="[(v:string) => !!v || 'Campo obligatorio']"
            clearable
            hide-details="auto"
            color="primary"
            label="Fecha de fin del torneo"
            @dateChanged="handleDateChangeFin"
          ></DatePicker>
          <v-spacer class="my-4"></v-spacer>
          <!-- Precio del torneo -->
          <v-text-field
            v-model="precioTorneo"
            label="¿Cual es el precio del torneo"
            required
            type="number"
            :rules="[(v:number) => !!v || 'Campo obligatorio']"
          ></v-text-field>
          <!-- metodosPago -->
          <v-textarea
            v-model="metodosPago"
            label="¿Como se puede pagar?"
            type="text"
            clearable
          ></v-textarea>
          <!-- Último día para apuntarse -->
          <DatePicker
            v-model="showFechaFinInscripcion"
            :rules="[
              (v:string) => !!v || 'Campo obligatorio',
            ]"
            clearable
            hide-details="auto"
            color="primary"
            label="Último día para apuntarse al torneo"
            @dateChanged="handleDateChangeInscripcion"
          ></DatePicker>
          <v-spacer class="my-4"></v-spacer>
          <!-- Último día para entregar las listas -->
          <DatePicker
            v-model="showFechaEntregaListas"
            :rules="[
              (v:string) => !!v || 'Campo obligatorio',
            ]"
            clearable
            hide-details="auto"
            color="primary"
            label="Último día para entregar las listas"
            @dateChanged="handleDateChangeListas"
          ></DatePicker>
          <v-spacer class="my-4"></v-spacer>
          <!-- bases del torneo -->
          <v-file-input
            clearable
            label="Bases del torneo"
            required
            accept="application/pdf"
            @change="onFileChange"
          ></v-file-input>
          <!-- cartel del torneo -->
          <v-file-input
            ref="imageInput"
            label="Selecciona una imagen"
            @change="onImageSelected"
            accept="image/*"
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
            :disabled="isGenerating"
            @click="confirmarConfiguracion"
            color="primary"
            variant="tonal"
            >Modificar</v-btn
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
    </v-card>
  </v-dialog>

  <!-- Modal response eliminar inscripcion -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Torneo modificado correctamente."
    @update:isVisible="showSuccessModal = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido modificar el torneo. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import { ModificarTorneoDTO, Torneo } from "@/interfaces/Torneo";
import DatePicker from "../Commons/DatePicker.vue";
import { modificarTorneo } from "@/services/TorneosService";

const props = defineProps<{
  isVisible: boolean;
  torneo: Torneo | undefined;
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
  if (newDate) fechaInicio.value = convertirFecha(newDate);
};
const handleDateChangeFin = (newDate: string | null) => {
  if (newDate) fechaFin.value = convertirFecha(newDate);
};
const handleDateChangeInscripcion = (newDate: string | null) => {
  if (newDate) fechaInscripcion.value = convertirFecha(newDate);
};
const handleDateChangeListas = (newDate: string | null) => {
  if (newDate) fechaListas.value = convertirFecha(newDate);
};
const nombreTorneo = ref<string>();
const limiteParticipantes = ref<number>();
const descripcionTorneo = ref<string>();
const showFechaInicioTorneo = ref<boolean>(false);
const showFechaFinTorneo = ref<boolean>(false);
const precioTorneo = ref<number>();
const numeroPartidas = ref<number>();
const puntosTorneo = ref<number>();
const estadoTorneo = ref<number>(1);
const lugarTorneo = ref<string>();
const tipoTorneo = ref<string>("");
const esLiga = ref<boolean>(false);
const idRangoTorneo = ref<number>(1);
const esMatchedPlayTorneo = ref<boolean>(false);
const showFechaEntregaListas = ref<boolean>(false);
const showFechaFinInscripcion = ref<boolean>(false);
const metodosPago = ref<string[]>([]);
const horaInicioTorneo = ref<string>("00:00");
const horaFinTorneo = ref<string>("00:00");

const fechaInicio = ref<string>();
const fechaFin = ref<string>();
const fechaListas = ref<string>();
const fechaInscripcion = ref<string>();

const imageInput = ref<HTMLInputElement | null>(null);
const imageBase64 = ref<string | null>(null);

const byteArrayBases = ref<Uint8Array | null>(null);

const isGenerating = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);

watch(
  () => props.torneo,
  (newTorneo) => {
    if (newTorneo) {
      nombreTorneo.value = newTorneo.nombreTorneo || "";
      limiteParticipantes.value = newTorneo.limiteParticipantes;
      descripcionTorneo.value = newTorneo.descripcionTorneo || "";
      lugarTorneo.value = newTorneo.lugarTorneo || "";
      precioTorneo.value = newTorneo.precioTorneo;
      numeroPartidas.value = newTorneo.numeroPartidas;
      puntosTorneo.value = newTorneo.puntosTorneo;
      metodosPago.value = newTorneo.metodosPago;
      horaInicioTorneo.value = newTorneo.horaInicioTorneo || "00:00";
      horaFinTorneo.value = newTorneo.horaFinTorneo || "00:00";
      fechaInicio.value = newTorneo.fechaInicioTorneo;
      fechaFin.value = newTorneo.fechaFinTorneo;
      fechaListas.value = newTorneo.fechaEntregaListas;
      fechaInscripcion.value = newTorneo.fechaFinInscripcion;
    }
  },
  { immediate: true }
);

watch(
  () => props.isVisible,
  (newValue) => {
    internalIsVisible.value = newValue;
    if (newValue && props.torneo) {
      // Asegurarse de recargar valores cuando el modal se abre
      const torneo = props.torneo;
      nombreTorneo.value = torneo.nombreTorneo || "";
      limiteParticipantes.value = torneo.limiteParticipantes;
      descripcionTorneo.value = torneo.descripcionTorneo || "";
      lugarTorneo.value = torneo.lugarTorneo || "";
      precioTorneo.value = torneo.precioTorneo;
      numeroPartidas.value = torneo.numeroPartidas;
      puntosTorneo.value = torneo.puntosTorneo;
      metodosPago.value = torneo.metodosPago || "";
      horaInicioTorneo.value = torneo.horaInicioTorneo || "00:00";
      horaFinTorneo.value = torneo.horaFinTorneo || "00:00";
      fechaInicio.value = torneo.fechaInicioTorneo;
      fechaFin.value = torneo.fechaFinTorneo;
      fechaListas.value = torneo.fechaEntregaListas;
      fechaInscripcion.value = torneo.fechaFinInscripcion;
    }
  }
);

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

watch([fechaInicio, fechaFin], ([newStart, newEnd]) => {
  if (newStart && newEnd && new Date(newStart) > new Date(newEnd)) {
    alert("La fecha de inicio debe ser anterior a la fecha de fin.");
    fechaFin.value = "";
  }
});

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
    if (!fechaInicio.value) missingFields.push("Fecha de inicio del torneo");
    if (!fechaFin.value) missingFields.push("Fecha de fin del torneo");
    if (!precioTorneo.value) missingFields.push("Precio del torneo");
    if (!fechaInscripcion.value)
      missingFields.push("Último día para apuntarse");
    if (!fechaListas.value)
      missingFields.push("Último día para entregar listas");
    if (!horaFinTorneo.value)
      missingFields.push("Hora de finalización del torneo");
    if (!horaInicioTorneo.value)
      missingFields.push("Hora de inicio del torneo");

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

  const nuevoTorneo: ModificarTorneoDTO = {
    nombreTorneo: nombreTorneo.value,
    limiteParticipantes: limiteParticipantes.value,
    fechaInicioTorneo: fechaInicio.value,
    fechaFinTorneo: fechaFin.value,
    precioTorneo: precioTorneo.value,
    numeroPartidas: numeroPartidas.value,
    puntosTorneo: puntosTorneo.value,
    estadoTorneo: estadoTorneo.value,
    lugarTorneo: lugarTorneo.value,
    tipoTorneo: tipoTorneo.value,
    esLiga: esLiga.value,
    idRangoTorneo: idRangoTorneo.value,
    esMatchedPlayTorneo: esMatchedPlayTorneo.value,
    fechaEntregaListas: fechaListas.value,
    fechaFinInscripcion: fechaInscripcion.value,
    horaInicioTorneo: horaInicioTorneo.value + ":00",
    horaFinTorneo: horaFinTorneo.value + ":00",
    cartelTorneo: imageBase64.value!,
    basesTorneo: basesTorneoBase64!,
    descripcionTorneo: descripcionTorneo.value,
    idTorneo: props.torneo?.idTorneo,
  };
  try {
    isGenerating.value = true;
    await modificarTorneo(nuevoTorneo);

    showSuccessModal.value = true;
  } catch (error) {
    showErrorModal.value = true;
    console.error(error);
  } finally {
    isGenerating.value = false;
  }

  emit("confirm");
  closeModal();
};
</script>
<style scoped>
.remove-btn {
  background-color: transparent;
  color: red;
  margin-left: 16px; /* Espacio entre el texto y el botón */
  padding: 0;
  min-width: auto;
  display: flex;
  align-items: center;
}

.remove-btn .v-icon {
  font-size: 18px; /* Tamaño del ícono */
}

.emparejamientos-container {
  display: flex;
  flex-direction: column;
}

.emparejamiento-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.emparejamiento-text {
  flex-grow: 1;
}

.progress-card {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}
.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
