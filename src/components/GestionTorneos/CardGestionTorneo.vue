<template>
  <v-card v-if="torneo" class="mb-4">
    <v-card-title>{{ torneo.torneo.nombreTorneo }}</v-card-title>
    <v-card-text>
      <p><strong>Plazas restantes:</strong> {{ plazasRestantes }}</p>
      <p>
        <strong>Fin entrega de listas:</strong>
        {{ formatDate(torneo.torneo.fechaEntregaListas) }}
      </p>
      <p>
        <strong>Fin de inscripción:</strong>
        {{ formatDate(torneo.torneo.fechaFinInscripcion) }}
      </p>
      <p>
        <strong>Pagos: :</strong>
        {{ pagosRealizados }}/{{ totalInscripciones }}
      </p>
      <p>
        <strong>Listas entregadas: :</strong>
        {{ listasEntregadas }}/{{ totalInscripciones }}
      </p>
      <p>
        <strong>Listas legales: :</strong>
        {{ listasLegales }}/{{ totalInscripciones }}
      </p>
      <p><strong>Listas de luz:</strong> {{ listasLuz }}</p>
      <p><strong>Listas de oscuridad:</strong> {{ listasOscuridad }}</p>
    </v-card-text>
    <v-card-actions>
      <v-row>
        <v-col>
          <v-btn
            variant="tonal"
            color="secondary"
            @click="modificarTorneo"
            block
            >Modificar torneo</v-btn
          >
        </v-col>
        <v-col>
          <v-btn
            variant="tonal"
            color="secondary"
            @click="modificarBasesTorneo"
            block
            >Modificar bases</v-btn
          >
        </v-col>

        <v-col>
          <v-btn
            variant="tonal"
            color="secondary"
            @click="handlerMostrarListas"
            block
            >{{ mostrarListas ? "Ocultar" : "Mostrar" }} Listas</v-btn
          >
        </v-col>

        <v-col>
          <v-btn
            variant="tonal"
            color="secondary"
            @click="handlerMostrarClasificacion"
            block
            >{{
              mostrarClasificacion ? "Ocultar" : "Mostrar"
            }}
            Clasificación</v-btn
          > </v-col
        ><v-col>
          <v-btn
            variant="tonal"
            color="secondary"
            @click="descargarListasTorneo"
            block
          >
            Descargar Listas</v-btn
          >
        </v-col>
        <v-col>
          <CardAddTorneoLiga :idTorneo="props.torneo?.torneo.idTorneo!" />
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>

  <!-- modal para modificar el torneo -->
  <ModalModificarTorneo
    :isVisible="showModificarTorneoModal"
    :torneo="torneoMod"
    @close="cerrarModal()"
  />

  <!-- modal para modificar el torneo -->
  <ModalModificarBasesTorneo
    :isVisible="showModificarBasesTorneoModal"
    :torneo="torneoMod"
    @close="cerrarModal()"
  />

  <!-- modal para manejar mostrar listas del torneo -->
  <ModalHandlerMostrarListas
    :isVisible="showModalHandlerMostrarListas"
    :torneo="torneoMod"
    @close="cerrarModal()"
    @confirm="onCambioMostrarListas"
  />

  <!-- modal para manejar mostrar listas del torneo -->
  <ModalHandlerMostrarClasificacion
    :isVisible="showModalHandlerMostrarClasificacion"
    :torneo="torneoMod"
    @close="cerrarModal()"
    @confirm="onCambioMostrarClasificacion"
  />

  <!-- modal torneo modificado con exito -->
  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Torneo modificado con exito."
    @update:isVisible="showSuccessModal = $event"
  />
  <!-- modal Error al modificar el torneo -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se han podido modificar el torneo. Intentalo de nuevo y si el error persiste contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />
  <LoadingLOTR
    :isVisible="isDownloading"
    mensaje="Generando PDF, por favor espera..."
  >
    <template #default>
      <div v-if="isDownloading" style="margin-top: 10px">
        <div style="text-align: center; font-size: 12px; margin-top: 4px">
          {{ progressPDF }}%
        </div>
      </div>
    </template>
  </LoadingLOTR>
</template>

<script setup lang="ts">
import { Torneo, TorneoGestionInfoDTO } from "@/interfaces/Torneo";
import { computed, ref } from "vue";
import ModalModificarTorneo from "./ModalModificarTorneo.vue";
import { getListasTorneoAsync, getTorneo } from "@/services/TorneosService";
import ModalModificarBasesTorneo from "./ModalModificarBasesTorneo.vue";
import CardAddTorneoLiga from "./CardAddTorneoLiga.vue";
import ModalHandlerMostrarListas from "./ModalHandlerMostrarListas.vue";
import ModalHandlerMostrarClasificacion from "./ModalHandlerMostrarClasificacion.vue";
import { ClassificationType } from "@/Constant/TipoClasificacion";
import ModalError from "../Commons/ModalError.vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import LoadingLOTR from "../Commons/LoadingLOTR.vue";
import { ListaCompletaDTO } from "@/interfaces/Lista";
import jsPDF from "jspdf";

// eslint-disable-next-line
const props = defineProps<{ torneo: TorneoGestionInfoDTO | null }>();
const showErrorModal = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const showModificarTorneoModal = ref<boolean>(false);
const showModificarBasesTorneoModal = ref<boolean>(false);
const showModalHandlerMostrarListas = ref<boolean>(false);
const showModalHandlerMostrarClasificacion = ref<boolean>(false);
const mostrarListas = ref(props.torneo?.torneo.mostrarListas);
const mostrarClasificacion = ref(props.torneo?.torneo.mostrarClasificacion);

const progressPDF = ref<number>(0);

const idTorneo = ref<number>(0);
const isLoading = ref<boolean>(false);
const isDownloading = ref<boolean>(false);
const torneoMod = ref<Torneo>({
  idTorneo: 0,
  idUsuario: 0,
  nombreTorneo: "",
  descripcionTorneo: "",
  fechaInicioTorneo: "",
  fechaFinTorneo: "",
  precioTorneo: 0,
  numeroPartidas: 0,
  puntosTorneo: 0,
  estadoTorneo: "ESPERANDO",
  lugarTorneo: "",
  tipoTorneo: "Individual",
  esPrivadoTorneo: false,
  idRangoTorneo: 0,
  esMatchedPlayTorneo: false,
  fechaEntregaListas: "",
  fechaFinInscripcion: "",
  basesTorneo: "",
  cartelTorneo: "",
  metodosPago: [],
  horaInicioTorneo: "",
  horaFinTorneo: "",
  tieneBases: false,
  inicioInscripciones: "",
  listasPorJugador: 0,
  mostrarListas: false,
  mostrarClasificacion: false,
  classificationType: ClassificationType.NORMAL,
});

const plazasRestantes = computed(() => {
  if (
    !props.torneo ||
    props.torneo.inscripciones.length == undefined ||
    props.torneo.torneo.limiteParticipantes == null
  ) {
    return "Sin límite";
  }
  return (
    props.torneo.torneo.limiteParticipantes - props.torneo.inscripciones.length
  );
});

const listasLuz = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(i => i.bando === "good").length;
});

const listasOscuridad = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(i => i.bando === "evil").length;
});

const totalInscripciones = computed(() => {
  return props.torneo ? props.torneo.inscripciones.length : 0;
});

const pagosRealizados = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(
    inscripcion => inscripcion.esPago === "SI"
  ).length;
});

const listasLegales = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(
    inscripcion => inscripcion.estadoLista === "OK"
  ).length;
});

const listasEntregadas = computed(() => {
  if (!props.torneo) return 0;
  return props.torneo.inscripciones.filter(
    inscripcion =>
      inscripcion.estadoLista === "ENTREGADA" ||
      inscripcion.estadoLista === "OK" ||
      inscripcion.estadoLista === "ILEGAL"
  ).length;
});

const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

const modificarTorneo = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModificarTorneoModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
};

const modificarBasesTorneo = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModificarBasesTorneoModal.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
};

const cerrarModal = async () => {
  showModificarBasesTorneoModal.value = false;
  showModificarTorneoModal.value = false;
  showModalHandlerMostrarListas.value = false;
  showModalHandlerMostrarClasificacion.value = false;
};

const onCambioMostrarListas = (nuevoValor: boolean) => {
  mostrarListas.value = nuevoValor;
  showModalHandlerMostrarListas.value = false;
};

const onCambioMostrarClasificacion = (nuevoValor: boolean) => {
  mostrarClasificacion.value = nuevoValor;
  showModalHandlerMostrarClasificacion.value = false;
};

const handlerMostrarListas = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModalHandlerMostrarListas.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
};

const handlerMostrarClasificacion = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    const responseTorneo = await getTorneo(idTorneo.value);
    torneoMod.value = responseTorneo.data;
    showModalHandlerMostrarClasificacion.value = true;
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showErrorModal.value = false;
  }
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const descargarListasTorneo = async () => {
  if (
    props.torneo?.torneo.idTorneo != undefined &&
    props.torneo?.torneo.idTorneo != 0 &&
    props.torneo?.torneo.idTorneo != null
  )
    idTorneo.value = props.torneo?.torneo.idTorneo;

  try {
    isDownloading.value = true;
    const response = await getListasTorneoAsync(idTorneo.value);
    const listas: ListaCompletaDTO[] = response.data;
    const chunkedListas = chunkArray(listas, 40);
    const total = chunkedListas.reduce((acc, arr) => acc + arr.length, 0);
    let processed = 0;
    for (let i = 0; i < chunkedListas.length; i++) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 10;
      for (let idx = 0; idx < chunkedListas[i].length; idx++) {
        const lista = chunkedListas[i][idx];
        if (lista.listaData) {
          const imgMatch = lista.listaData.match(
            /^data:image\/(png|jpeg|jpg);base64,/
          );
          if (imgMatch) {
            if (idx !== 0) doc.addPage();

            doc.setFontSize(18);
            doc.text(`${lista.nick}`, pageWidth / 2, 20, { align: "center" });

            const margin = 15;
            const imgProps = doc.getImageProperties(lista.listaData);
            let imgWidth = pageWidth - margin * 2;
            let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            if (imgHeight > pageHeight - 40 - margin) {
              imgHeight = pageHeight - 40 - margin;
              imgWidth = (imgProps.width * imgHeight) / imgProps.height;
            }
            const x = (pageWidth - imgWidth) / 2;
            const yImg = 30;
            doc.addImage(
              lista.listaData,
              imgMatch[1],
              x,
              yImg,
              imgWidth,
              imgHeight
            );
          } else {
            doc.text(`${lista.nick}`, 10, y);
            y += 10;
            const lines = doc.splitTextToSize(lista.listaData, 180);
            doc.text(lines, 10, y);
            y += lines.length * 7;
            doc.line(10, y, 200, y); // separador
            y += 10;
            if (y > 270 && idx < chunkedListas[i].length - 1) {
              doc.addPage();
              y = 10;
            }
          }
        } else {
          doc.text(`${lista.nick}`, 10, y);
          y += 10;
        }
        processed++;
        progressPDF.value = Math.round((processed / total) * 100);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      const baseName = props.torneo?.torneo.nombreTorneo
        ? props.torneo?.torneo.nombreTorneo + "_listas"
        : "listas_torneo";
      const fileName =
        chunkedListas.length > 1
          ? `${baseName}_${i + 1}.pdf`
          : `${baseName}.pdf`;
      doc.save(fileName);
    }
  } catch (error) {
    console.error(error);
    showErrorModal.value = true;
  } finally {
    progressPDF.value = 0;
    isDownloading.value = false;
    showErrorModal.value = false;
  }
};
</script>
<style scoped>
.responsive-text {
  font-size: 16px; /* Tamaño base */
  text-align: center;
}

@media (max-width: 768px) {
  .responsive-text {
    font-size: 14px; /* Tamaño más pequeño para móviles */
  }
}

@media (max-width: 480px) {
  .responsive-text {
    font-size: 12px; /* Ajuste adicional para pantallas muy pequeñas */
  }
}
</style>
