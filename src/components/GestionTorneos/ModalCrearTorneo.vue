<template>
  <!-- Crear un evento paso a paso: no se pasa al siguiente hasta que el actual es válido -->
  <v-dialog v-model="internalIsVisible" max-width="600px" scrollable persistent>
    <v-card>
      <v-card-title class="d-flex align-center pt-3">
        <span class="flex-grow-1">Crear evento</span>
        <v-btn icon="mdi-close" variant="text" density="comfortable" aria-label="Cerrar" @click="closeModal" />
      </v-card-title>

      <!-- En qué paso va y cuánto queda -->
      <div class="px-6 pb-3">
        <div class="text-caption text-medium-emphasis">Paso {{ paso }} de {{ PASOS.length }}</div>
        <div class="text-subtitle-1 font-weight-bold">{{ PASOS[paso - 1] }}</div>
        <v-progress-linear :model-value="(paso / PASOS.length) * 100" color="primary" rounded class="mt-2" />
      </div>
      <v-divider />

      <v-card-text>
        <!-- Un formulario por paso: validarlo es validar solo lo que se ve -->
        <v-form ref="form" @submit.prevent="siguiente">
          <!-- 1. Formato: qué tipo de evento es -->
          <template v-if="paso === 1">
            <v-select
              v-model="formatoTorneo"
              label="Tipo de evento"
              :items="tipoEventoOptions"
              item-title="label"
              item-value="value"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
              </template>
            </v-select>

            <v-alert v-if="!porJornadas" type="info" variant="tonal" density="compact" class="mb-4 text-left text-body-2">
              Se juega por rondas. Las rondas se generan una a una desde la gestión del torneo y emparejan a
              jugadores con resultados parecidos según la clasificación. Cada jugador entrega su lista antes de
              empezar.
            </v-alert>
            <v-alert v-else-if="esLiga" type="info" variant="tonal" density="compact" class="mb-4 text-left text-body-2">
              Cada jugador se enfrenta a todos los demás y elige su ejército al inscribirse. Las jornadas se
              generan desde la gestión cuando cierres las inscripciones: con N jugadores salen N−1 jornadas (N si
              son impares), el doble con ida y vuelta.
            </v-alert>
            <v-alert v-else-if="esCopa" type="info" variant="tonal" density="compact" class="mb-4 text-left text-body-2">
              Los jugadores se reparten en grupos y en cada grupo juegan todos contra todos, por jornadas y con
              calendario abierto. Los mejores de cada grupo pasan a una eliminatoria que avanza sola. Cada jugador
              elige su ejército al inscribirse.
            </v-alert>

            <!-- Liga y Copa: solo ida o ida y vuelta es parte de qué evento es -->
            <v-select
              v-if="porJornadas"
              v-model="idaYVuelta"
              :label="esCopa ? '¿Grupos a solo ida o ida y vuelta?' : '¿Solo ida o ida y vuelta?'"
              :items="idaYVueltaOptions"
              item-title="label"
              item-value="value"
            />

            <!-- Tipo de torneo: la Liga y la Copa son individuales -->
            <template v-if="!porJornadas">
              <v-select
                v-model="tipoTorneo"
                label="¿De qué tipo es el torneo?"
                :items="tipoTorneoOptions"
                item-title="label"
                item-value="value"
                :hint="tipoTorneoOptions.find(t => t.value === tipoTorneo)?.subtitle"
                persistent-hint
                :rules="[(v: string) => !!v || 'Campo obligatorio']"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
                </template>
              </v-select>
              <!-- Modo de listas, solo en Parejas -->
              <v-select
                v-if="tipoTorneo === 'Parejas'"
                v-model="listaPorPareja"
                label="¿Cómo entregan las listas las parejas?"
                :items="modoListasParejaOptions"
                item-title="label"
                item-value="value"
              />
            </template>
          </template>

          <!-- 2. Datos: cómo se llama, de qué va y dónde es -->
          <template v-else-if="paso === 2">
            <v-text-field
              v-model="nombreTorneo"
              :label="`Nombre ${textos.del}`"
              type="text"
              counter="200"
              :rules="[
                (v: string) => !!v || 'Campo obligatorio',
                (v: string) => !v || v.length <= 200 || 'Como mucho 200 caracteres',
              ]"
            />
            <v-textarea
              v-model="descripcionTorneo"
              :label="`Descripción ${textos.del} (opcional)`"
              rows="3"
              auto-grow
              clearable
            />

            <!-- Lugar: se busca la dirección y se enseña en el mapa -->
            <v-text-field
              v-model="searchQuery"
              :label="`¿Dónde se celebra ${textos.el}?`"
              placeholder="Ej: Calle Gran Vía, Madrid"
              :loading="isSearching"
              hint="Si no lo encuentra, se guarda tal cual, sin enlace a Google Maps"
              persistent-hint
              @keydown.enter.prevent="searchLocation"
            >
              <template #append>
                <v-btn color="primary" variant="tonal" @click="searchLocation">Buscar</v-btn>
              </template>
            </v-text-field>
            <p v-if="errorMessage" class="text-caption text-warning mt-2 mb-0">{{ errorMessage }}</p>
            <p v-else-if="formattedAddress" class="text-caption text-medium-emphasis mt-2 mb-0">
              Dirección: {{ formattedAddress }}
            </p>
            <!-- Mapa solo para ver (no interactivo) -->
            <l-map
              v-if="selectedLocation"
              :zoom="zoom"
              :center="[selectedLocation.lat, selectedLocation.lng]"
              :options="{ dragging: false, zoomControl: false, scrollWheelZoom: false }"
              class="mt-3"
              style="height: 220px; width: 100%; border-radius: 4px"
            >
              <l-tile-layer :url="tileLayerUrl" />
              <l-marker :lat-lng="selectedLocation">
                <l-popup>{{ formattedAddress }}</l-popup>
              </l-marker>
            </l-map>

            <v-text-field
              v-model="contacto"
              label="Contacto (email o teléfono, opcional)"
              hint="El contacto será visible si se rellena"
              persistent-hint
              clearable
              type="text"
              class="mt-4"
            />
          </template>

          <!-- 3. Reglas: cómo se juega y cómo se clasifica -->
          <template v-else-if="paso === 3">
            <v-text-field
              v-model="puntosTorneo"
              :label="`¿A cuántos puntos es ${textos.el}?`"
              type="number"
              :rules="[
                (v: number) => !isNaN(v) || 'Debe ser un número',
                (v: number) => v > 0 || 'Debe ser mayor que 0',
              ]"
            />

            <!-- En Liga y Copa una lista por jugador y las rondas salen de las jornadas -->
            <template v-if="!porJornadas">
              <v-text-field
                v-model="listasPorJugador"
                label="¿Cuántas listas necesitará un jugador?"
                type="number"
                :disabled="esListaConjunta"
                :hint="esListaConjunta ? 'Con lista conjunta cada pareja entrega una' : ''"
                persistent-hint
                :rules="[
                  (v: number) => !isNaN(v) || 'Debe ser un número',
                  (v: number) => v > 0 || 'Debe ser mayor que 0',
                ]"
              />
              <v-text-field
                v-model="numeroPartidas"
                label="¿Cuántas rondas tiene el torneo?"
                type="number"
                :rules="[
                  (v: number) => !isNaN(v) || 'Debe ser un número',
                  (v: number) => v > 0 || 'Debe ser mayor que 0',
                ]"
              />
            </template>

            <!-- Opciones de liga y copa -->
            <template v-else>
              <v-select
                v-model="cuentaElo"
                label="¿Cuenta para el ELO?"
                :items="cuentaEloOptions"
                item-title="label"
                item-value="value"
              />
            </template>

            <!-- Opciones de la copa -->
            <template v-if="esCopa">
              <v-text-field
                v-model.number="numeroGrupos"
                type="number"
                label="¿Cuántos grupos?"
                :rules="[
                  (v: number) => v >= 1 || 'Al menos un grupo',
                  (v: number) => v <= 32 || 'Como mucho 32 grupos',
                ]"
              />
              <v-text-field
                v-model.number="clasificadosPorGrupo"
                type="number"
                label="¿Cuántos pasan de cada grupo?"
                hint="Si no llenan el cuadro, entran los mejores siguientes"
                persistent-hint
                :rules="[
                  (v: number) => v >= 1 || 'Al menos uno',
                  (v: number) => numeroGrupos * v >= 2 || 'A la eliminatoria tienen que pasar al menos dos',
                ]"
                class="mb-2"
              />
              <v-select
                v-model="repartoGrupos"
                label="¿Cómo se reparten los grupos?"
                :items="repartoGruposOptions"
                item-title="label"
                item-value="value"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
                </template>
              </v-select>
              <v-select
                v-model="desempateEliminatoria"
                label="Empate en la eliminatoria"
                :items="desempateEliminatoriaOptions"
                item-title="label"
                item-value="value"
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
                </template>
              </v-select>
              <v-select
                v-model="tercerPuesto"
                label="¿Tercer puesto?"
                :items="tercerPuestoOptions"
                item-title="label"
                item-value="value"
              />
            </template>

            <v-select
              v-model="classificationType"
              label="¿Qué tipo de clasificación se utilizará?"
              :items="classificationTypeOptions"
              item-title="label"
              item-value="value"
              :rules="[(v: number) => !!v || 'Campo obligatorio']"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props" :subtitle="item.raw.subtitle" />
              </template>
            </v-select>
            <!-- Cómo puntúa el tipo elegido -->
            <v-alert
              v-if="classificationType"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-4 text-left text-body-2"
            >
              {{ ClassificationTypeDescriptions[classificationType].detalle }}
              {{ DESEMPATE_CLASIFICACION }}
            </v-alert>
          </template>

          <!-- 4. Fechas: todas juntas, porque unas dependen de otras -->
          <template v-else-if="paso === 4">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="fechaInicioTorneo"
                  :label="`Inicio ${textos.del}`"
                  type="date"
                  :rules="[validateRequired, validateNotPast, validateFechaInicioFinTorneo]"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="fechaFinTorneo"
                  :label="`Fin ${textos.del}`"
                  type="date"
                  :rules="[validateRequired, validateFechaFinInicioTorneo]"
                />
              </v-col>
            </v-row>

            <!-- La liga y la copa no tienen horario -->
            <v-row v-if="!porJornadas" dense>
              <v-col cols="6">
                <v-text-field
                  v-model="horaInicioTorneo"
                  label="Hora de inicio"
                  placeholder="HH:MM"
                  clearable
                  :rules="[validateHora]"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="horaFinTorneo"
                  label="Hora de fin"
                  placeholder="HH:MM"
                  clearable
                  :rules="[validateHora]"
                />
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="fechaInicioInscripcion"
                  label="Inicio de las inscripciones"
                  type="date"
                  clearable
                  :rules="[
                    validateRequired,
                    validateAntesDe(fechaFinInscripcion, 'Debe ser antes de la fecha de fin de inscripción'),
                    validateAntesDe(fechaInicioTorneo, `Debe ser antes de la fecha de inicio ${textos.del}`),
                  ]"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="fechaFinInscripcion"
                  :label="`Último día para apuntarse ${textos.al}`"
                  type="date"
                  :rules="[
                    validateRequired,
                    validateFinDespuesDeInicio(fechaInicioInscripcion, 'Debe ser posterior al inicio de inscripción'),
                    validateAntesDe(fechaInicioTorneo, `Debe ser antes del inicio ${textos.del}`),
                  ]"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="fechaFinEntregaListas"
              :label="porJornadas ? 'Último día para entregar la primera lista' : 'Último día para entregar las listas'"
              :hint="porJornadas ? 'Después cada jugador puede cambiarla en cada jornada' : ''"
              persistent-hint
              type="date"
              :rules="[
                validateRequired,
                validateFinDespuesDeInicio(fechaFinInscripcion, 'Debe ser posterior al cierre de inscripciones'),
                validateAntesDe(fechaInicioTorneo, `Debe ser antes del inicio ${textos.del}`),
              ]"
            />
          </template>

          <!-- 5. Inscripción: plazas, precio, bases y cartel -->
          <template v-else-if="paso === 5">
            <v-text-field
              v-model="limiteParticipantes"
              :label="etiquetaLimitePlazas(tipoTorneo)"
              type="number"
              :rules="[
                (v: number) => !isNaN(v) || 'Debe ser un número',
                (v: number) => v > 0 || 'Debe ser mayor que 0',
              ]"
            />
            <v-text-field
              v-model="precioTorneo"
              :label="`¿Cuál es el precio ${textos.del}?`"
              type="number"
              suffix="€"
              :rules="[(v: number) => !isNaN(v) || 'Debe ser un número']"
            />
            <v-textarea v-model="metodosPago" label="¿Cómo se puede pagar? (opcional)" rows="2" auto-grow clearable />
            <v-file-input
              v-model="archivoBases"
              :label="`Bases ${textos.del} en PDF (opcional)`"
              accept="application/pdf"
              prepend-icon=""
              prepend-inner-icon="mdi-file-pdf-box"
              show-size
              clearable
            />
            <v-file-input
              v-model="archivoCartel"
              label="Cartel (opcional)"
              accept="image/*"
              prepend-icon=""
              prepend-inner-icon="mdi-image"
              show-size
              clearable
            />
          </template>

          <!-- 6. Revisar antes de crear: cada bloque se puede cambiar volviendo a su paso -->
          <template v-else>
            <v-alert v-if="errorCreacion" type="error" variant="tonal" density="compact" class="mb-4 text-left">
              <div class="font-weight-bold">No se ha podido crear {{ textos.el }}</div>
              {{ errorCreacion }}
            </v-alert>
            <div v-for="bloque in resumen" :key="bloque.paso" class="mb-3">
              <div class="d-flex align-center">
                <div class="text-subtitle-2 font-weight-bold flex-grow-1">{{ PASOS[bloque.paso - 1] }}</div>
                <v-btn variant="text" size="small" class="text-none" @click="paso = bloque.paso">Cambiar</v-btn>
              </div>
              <dl class="resumen">
                <div v-for="fila in bloque.filas" :key="fila.etiqueta" class="fila">
                  <dt class="text-medium-emphasis">{{ fila.etiqueta }}</dt>
                  <dd>{{ fila.valor }}</dd>
                </div>
              </dl>
            </div>
          </template>
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-4 py-3">
        <v-btn v-if="paso > 1" variant="text" :disabled="isGenerating" @click="paso--">Atrás</v-btn>
        <v-btn v-else variant="text" @click="closeModal">Cancelar</v-btn>
        <v-spacer />
        <v-btn
          v-if="paso < PASOS.length"
          color="primary"
          variant="flat"
          :loading="isSearching"
          @click="siguiente"
        >
          Siguiente
        </v-btn>
        <v-btn v-else color="primary" variant="flat" :loading="isGenerating" @click="confirmarConfiguracion">
          Crear {{ nombreEvento(formatoTorneo).toLowerCase() }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ModalSuccess
    :isVisible="showSuccessModal"
    :message="mensajeCreado"
    @update:isVisible="showSuccessModal = $event"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import { CrearTorneoDTO } from "@/interfaces/Torneo";
import { crearTorneo } from "@/services/TorneosService";
import { modoListasParejaOptions, tipoTorneoOptions, etiquetaLimitePlazas } from "@/Constant/TiposTorneo";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {
  ClassificationType,
  ClassificationTypeDescriptions,
  ClassificationTypeLabels,
  DESEMPATE_CLASIFICACION,
} from "@/Constant/TipoClasificacion";
import {
  DESEMPATE_GRUPOS,
  FORMATO_COPA,
  FORMATO_LIGA,
  FORMATO_SUIZO,
  REPARTO_ELO,
  cuentaEloOptions,
  desempateEliminatoriaOptions,
  esPorJornadas,
  idaYVueltaOptions,
  nombreEvento,
  repartoGruposOptions,
  tercerPuestoOptions,
  textosEvento,
  tipoEventoOptions,
} from "@/Constant/FormatoTorneo";
import { formatFechaSpaWhitoutAsync } from "@/utils/Fecha";

const props = defineProps<{
  isVisible: boolean;
  idUsuario: number;
}>();
const emit = defineEmits(["close", "confirm"]);

const PASOS = ["Formato", "Datos", "Reglas", "Fechas", "Inscripción", "Revisar"];
const paso = ref(1);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const form = ref<any>(null);

const internalIsVisible = ref(props.isVisible);
watch(
  () => props.isVisible,
  visible => {
    internalIsVisible.value = visible;
    // Cada vez que se abre, desde el principio
    if (visible) paso.value = 1;
  }
);

// Lugar: se busca con OpenStreetMap
const searchQuery = ref<string>("");
const formattedAddress = ref<string>("");
const selectedLocation = ref<{ lat: number; lng: number } | null>(null);
const errorMessage = ref<string>("");
const zoom = ref<number>(14);
const tileLayerUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const isSearching = ref<boolean>(false);
// La dirección que se buscó: si se cambia el texto y no se vuelve a buscar, al pasar de paso se busca
const busquedaHecha = ref<string>("");

const searchLocation = async () => {
  const consulta = searchQuery.value.trim();
  if (!consulta) return;

  isSearching.value = true;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    consulta
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
      errorMessage.value = "No se encontró la dirección. Se guardará sin enlace a Google Maps.";
      selectedLocation.value = null;
      lugarTorneo.value = consulta;
      formattedAddress.value = consulta;
    }
    busquedaHecha.value = consulta;
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
  const road = address.road || name || "";
  const houseNumber = address.house_number ? `, ${address.house_number}` : "";
  const city = address.city || address.town || address.village || "";
  const state = address.state || "";
  const postcode = address.postcode || "";
  const country = address.country || "";
  return [`${road}${houseNumber}`, city, state, postcode, country].filter(Boolean).join(", ");
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
const listaPorPareja = ref<boolean>(false);
const esListaConjunta = computed(() => tipoTorneo.value === "Parejas" && listaPorPareja.value);
const formatoTorneo = ref<string>(FORMATO_SUIZO);
const cuentaElo = ref<boolean>(false);
const idaYVuelta = ref<boolean>(false);
const esLiga = computed(() => formatoTorneo.value === FORMATO_LIGA);
const esCopa = computed(() => formatoTorneo.value === FORMATO_COPA);
const porJornadas = computed(() => esPorJornadas(formatoTorneo.value));
// Solo en Copa
const numeroGrupos = ref<number>(2);
const clasificadosPorGrupo = ref<number>(2);
const repartoGrupos = ref<string>(REPARTO_ELO);
const desempateEliminatoria = ref<string>(DESEMPATE_GRUPOS);
const tercerPuesto = ref<boolean>(false);
// Los textos del formulario hablan del tipo de evento elegido
const textos = computed(() => textosEvento(formatoTorneo.value));
// Liga y Copa son individuales, con una lista por jugador, sin horario, y sus rondas son las jornadas que se generen
watch(porJornadas, jornadas => {
  if (!jornadas) return;
  tipoTorneo.value = "Individual";
  listasPorJugador.value = 1;
  numeroPartidas.value = 1;
  listaPorPareja.value = false;
  horaInicioTorneo.value = "00:00";
  horaFinTorneo.value = "00:00";
});
// Con lista conjunta cada pareja entrega una sola lista
watch(esListaConjunta, conjunta => {
  if (conjunta) listasPorJugador.value = 1;
});
const idRangoTorneo = ref<number>(1);
const esMatchedPlayTorneo = ref<boolean>(false);
const metodosPago = ref<string>("");
const horaInicioTorneo = ref<string>("00:00");
const horaFinTorneo = ref<string>("00:00");
const contacto = ref<string | undefined>(undefined);
const fechaInicioInscripcion = ref<string>("");
const fechaInicioTorneo = ref<string>("");
const fechaFinTorneo = ref<string>("");
const fechaFinEntregaListas = ref<string>("");
const fechaFinInscripcion = ref<string>("");
const isGenerating = ref<boolean>(false);
// Por qué no se ha podido crear, tal como lo cuenta el servidor
const errorCreacion = ref<string>("");
const showSuccessModal = ref<boolean>(false);
const mensajeCreado = ref<string>("");
const classificationType = ref<ClassificationType>();

// Bases y cartel: se guardan los ficheros para que no se pierdan al ir y volver entre pasos
const archivoBases = ref<File[] | File | null>(null);
const archivoCartel = ref<File[] | File | null>(null);
const byteArrayBases = ref<Uint8Array | null>(null);
const imageBase64 = ref<string | null>(null);
const primerFichero = (valor: File[] | File | null) => (Array.isArray(valor) ? valor[0] : valor) ?? null;

watch(archivoBases, valor => {
  const file = primerFichero(valor);
  if (!file) {
    byteArrayBases.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    if (event.target?.result) byteArrayBases.value = new Uint8Array(event.target.result as ArrayBuffer);
  };
  reader.readAsArrayBuffer(file);
});

// El cartel, a 500 px como mucho y en JPEG
watch(archivoCartel, valor => {
  const file = primerFichero(valor);
  if (!file) {
    imageBase64.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 500;
      const maxHeight = 500;
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
        imageBase64.value = canvas.toDataURL("image/jpeg", 1);
      }
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
});

const classificationTypeOptions = [
  ClassificationType.NORMAL,
  ClassificationType.EXTENDED,
  ClassificationType.ALEMAN,
].map(value => ({
  label: ClassificationTypeLabels[value],
  subtitle: ClassificationTypeDescriptions[value].resumen,
  value,
}));

const today = new Date().toISOString().split("T")[0];

const validateRequired = (v: string) => !!v || "Campo obligatorio";
const validateNotPast = (v: string) => v >= today || "No puede ser una fecha pasada";
const validateFechaInicioFinTorneo = (v: string) =>
  !fechaFinTorneo.value || v <= fechaFinTorneo.value || "Debe ser anterior o igual a la fecha de fin";
const validateFechaFinInicioTorneo = (v: string) =>
  !fechaInicioTorneo.value || v >= fechaInicioTorneo.value || "Debe ser posterior o igual a la fecha de inicio";
const validateFinDespuesDeInicio =
  (inicio: string, mensaje = "Debe ser posterior o igual al inicio") =>
  (v: string) =>
    !inicio || !v || v >= inicio || mensaje;
const validateAntesDe = (fechaLimite: string, mensaje: string) => (v: string) =>
  !fechaLimite || !v || v <= fechaLimite || mensaje;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateHora = (v: any) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v) || "Formato debe ser HH:MM";

// Las fechas dependen unas de otras: si ya hay avisos, al cambiar una se revisan todas, y no solo la que cambia
watch([fechaInicioTorneo, fechaFinTorneo, fechaInicioInscripcion, fechaFinInscripcion, fechaFinEntregaListas], async () => {
  if (paso.value !== 4 || !form.value?.$el.querySelector(".v-input--error")) return;
  await nextTick();
  form.value.validate();
});

// Solo se pasa de paso si el actual es válido
const siguiente = async () => {
  // Si se escribió una dirección y no se buscó, se busca ahora: así no se queda sin lugar
  if (paso.value === 2 && searchQuery.value.trim() && searchQuery.value.trim() !== busquedaHecha.value)
    await searchLocation();

  const { valid } = await form.value.validate();
  if (!valid) {
    // Al primer campo con error: en el móvil puede quedar fuera de la pantalla
    form.value.$el.querySelector(".v-input--error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  paso.value++;
};

// El resumen del último paso, por bloques
const conValor = (valor: unknown, sinValor = "—") =>
  valor === undefined || valor === null || valor === "" ? sinValor : String(valor);
const fecha = (valor: string) => (valor ? formatFechaSpaWhitoutAsync(valor) : "—");
const resumen = computed(() => {
  const tipo = tipoTorneoOptions.find(t => t.value === tipoTorneo.value)?.label ?? tipoTorneo.value;
  const opcion = (opciones: { value: unknown; label: string }[], valor: unknown) =>
    opciones.find(o => o.value === valor)?.label ?? conValor(valor);
  return [
    {
      paso: 1,
      filas: [
        { etiqueta: "Evento", valor: `${nombreEvento(formatoTorneo.value)} · ${tipo}` },
        ...(porJornadas.value ? [{ etiqueta: "Partidos", valor: opcion(idaYVueltaOptions, idaYVuelta.value) }] : []),
      ],
    },
    {
      paso: 2,
      filas: [
        { etiqueta: "Nombre", valor: conValor(nombreTorneo.value) },
        { etiqueta: "Lugar", valor: conValor(formattedAddress.value || lugarTorneo.value, "Sin lugar") },
        ...(contacto.value ? [{ etiqueta: "Contacto", valor: contacto.value }] : []),
      ],
    },
    {
      paso: 3,
      filas: [
        { etiqueta: "Puntos", valor: conValor(puntosTorneo.value) },
        ...(porJornadas.value
          ? [{ etiqueta: "ELO", valor: opcion(cuentaEloOptions, cuentaElo.value) }]
          : [
              { etiqueta: "Listas por jugador", valor: conValor(listasPorJugador.value) },
              { etiqueta: "Rondas", valor: conValor(numeroPartidas.value) },
            ]),
        ...(esCopa.value
          ? [{ etiqueta: "Grupos", valor: `${numeroGrupos.value}, pasan ${clasificadosPorGrupo.value} de cada uno` }]
          : []),
        {
          etiqueta: "Clasificación",
          valor: classificationType.value ? ClassificationTypeLabels[classificationType.value] : "—",
        },
      ],
    },
    {
      paso: 4,
      filas: [
        {
          etiqueta: textos.value.el.replace(/^\w/, c => c.toUpperCase()),
          valor:
            fechaFinTorneo.value > fechaInicioTorneo.value
              ? `Del ${fecha(fechaInicioTorneo.value)} al ${fecha(fechaFinTorneo.value)}`
              : `${fecha(fechaInicioTorneo.value)}${porJornadas.value ? "" : ` de ${horaInicioTorneo.value} a ${horaFinTorneo.value}`}`,
        },
        {
          etiqueta: "Inscripciones",
          valor: `Del ${fecha(fechaInicioInscripcion.value)} al ${fecha(fechaFinInscripcion.value)}`,
        },
        { etiqueta: "Listas hasta", valor: fecha(fechaFinEntregaListas.value) },
      ],
    },
    {
      paso: 5,
      filas: [
        { etiqueta: "Plazas", valor: conValor(limiteParticipantes.value) },
        { etiqueta: "Precio", valor: `${conValor(precioTorneo.value, "0")} €` },
        { etiqueta: "Bases", valor: primerFichero(archivoBases.value)?.name ?? "Sin bases" },
        { etiqueta: "Cartel", valor: primerFichero(archivoCartel.value)?.name ?? "Sin cartel" },
      ],
    },
  ];
});

const closeModal = () => {
  internalIsVisible.value = false;
  emit("close");
};

const confirmarConfiguracion = async () => {
  const basesTorneoBase64 = byteArrayBases.value
    ? btoa(new Uint8Array(byteArrayBases.value).reduce((data, byte) => data + String.fromCharCode(byte), ""))
    : null;

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
    idRangoTorneo: idRangoTorneo.value,
    esMatchedPlayTorneo: esMatchedPlayTorneo.value,
    fechaEntregaListas: fechaFinEntregaListas.value ?? "",
    fechaFinInscripcion: fechaFinInscripcion.value ?? "",
    horaInicioTorneo: horaInicioTorneo.value + ":00",
    horaFinTorneo: horaFinTorneo.value + ":00",
    cartelTorneo: imageBase64.value ?? "",
    basesTorneo: basesTorneoBase64 ?? "",
    descripcionTorneo: descripcionTorneo.value,
    // Antes no se mandaba y se perdía
    metodosPago: metodosPago.value || undefined,
    inicioInscripciones: fechaInicioInscripcion.value ?? "",
    listasPorJugador: listasPorJugador.value ?? 1,
    listaPorPareja: esListaConjunta.value,
    classificationType: classificationType.value ?? ClassificationType.NORMAL,
    contacto: contacto.value || undefined,
    formatoTorneo: formatoTorneo.value,
    cuentaElo: porJornadas.value && cuentaElo.value,
    idaYVuelta: porJornadas.value && idaYVuelta.value,
    ...(esCopa.value && {
      numeroGrupos: numeroGrupos.value,
      clasificadosPorGrupo: clasificadosPorGrupo.value,
      repartoGrupos: repartoGrupos.value,
      desempateEliminatoria: desempateEliminatoria.value,
      tercerPuesto: tercerPuesto.value,
    }),
  };

  errorCreacion.value = "";
  try {
    isGenerating.value = true;
    const respuesta = await crearTorneo(nuevoTorneo);
    mensajeCreado.value = esLiga.value
      ? "Liga creada correctamente."
      : esCopa.value
        ? "Copa creada correctamente."
        : "Torneo creado correctamente.";
    // Creado, pero con algo que avisar (p. ej. las bases no se han podido guardar)
    if (respuesta?.data?.aviso) mensajeCreado.value += ` ${respuesta.data.aviso}`;
    showSuccessModal.value = true;
    resetElement();
    emit("confirm");
    closeModal();
  } catch (error) {
    // Se queda abierto con todo rellenado, para corregirlo o volver a intentarlo
    errorCreacion.value =
      motivoDelError(error) ??
      "Ha fallado algo inesperado. Inténtalo de nuevo en un rato y, si sigue fallando, escríbenos desde Contacto.";
    console.error(error);
  } finally {
    isGenerating.value = false;
  }
};

// El motivo que manda el servidor: su mensaje, o qué datos no tienen el formato que espera
const motivoDelError = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null;
  if (!error.response) return "No se ha podido conectar con el servidor. Comprueba tu conexión y vuelve a intentarlo.";
  const data = error.response.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const campos = Object.keys(data.errors).map(campo => campo.replace(/^\$\./, ""));
    return `Algún dato no tiene el formato correcto (${campos.join(", ")}). Revisa los pasos y vuelve a intentarlo.`;
  }
  return null;
};

const resetElement = () => {
  errorCreacion.value = "";
  paso.value = 1;
  nombreTorneo.value = "";
  limiteParticipantes.value = undefined;
  fechaInicioTorneo.value = "";
  fechaFinTorneo.value = "";
  precioTorneo.value = undefined;
  numeroPartidas.value = undefined;
  puntosTorneo.value = undefined;
  lugarTorneo.value = "";
  searchQuery.value = "";
  busquedaHecha.value = "";
  formattedAddress.value = "";
  selectedLocation.value = null;
  errorMessage.value = "";
  fechaFinEntregaListas.value = "";
  fechaFinInscripcion.value = "";
  horaInicioTorneo.value = "00:00";
  horaFinTorneo.value = "00:00";
  archivoCartel.value = null;
  archivoBases.value = null;
  descripcionTorneo.value = "";
  metodosPago.value = "";
  fechaInicioInscripcion.value = "";
  listasPorJugador.value = undefined;
  listaPorPareja.value = false;
  tipoTorneo.value = "";
  classificationType.value = undefined;
  contacto.value = undefined;
  formatoTorneo.value = FORMATO_SUIZO;
  numeroGrupos.value = 2;
  clasificadosPorGrupo.value = 2;
  repartoGrupos.value = REPARTO_ELO;
  desempateEliminatoria.value = DESEMPATE_GRUPOS;
  tercerPuesto.value = false;
  cuentaElo.value = false;
  idaYVuelta.value = false;
};
</script>

<style scoped>
.resumen {
  margin: 0;
}

.fila {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0;
  font-size: 0.875rem;
}

.fila dt {
  flex-shrink: 0;
}

.fila dd {
  text-align: right;
  overflow-wrap: anywhere;
}
</style>
