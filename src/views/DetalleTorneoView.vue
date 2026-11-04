<template>
  <v-container class="pa-0 pa-sm-4">
    <LoadingGandalf v-if="isLoading" />
    <!-- Sencilla a propósito: lo que más se busca arriba (tu inscripción) y los datos como etiqueta y valor -->
    <!-- En Resultados, más ancha: las clasificaciones tienen varias columnas -->
    <v-card v-else-if="torneo" flat class="detalle mx-auto" :class="{ 'detalle--ancha': tab === 'resultados' }">
      <!-- Sin el número de inscritos en la pestaña: con él, las tres no caben en el móvil -->
      <v-tabs v-model="tab" grow class="pestanas-evento">
        <v-tab value="detalle">Detalle</v-tab>
        <v-tab value="inscritos">Inscritos</v-tab>
        <v-tab value="resultados">Resultados</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="detalle">
          <v-img
            :src="torneo.cartelTorneo || require('@/assets/images/cartelMissing.jpg')"
            height="260"
            class="cartel"
          />

          <div class="pa-4">
            <h1 class="text-h5 font-weight-bold titulo">{{ torneo.nombreTorneo }}</h1>
            <p class="text-body-2 text-medium-emphasis mt-1 mb-0">{{ resumen }}</p>

            <!-- Tu inscripción -->
            <div class="mt-4">
              <p v-if="estado.texto" class="text-body-2 mb-2">{{ estado.texto }}</p>
              <div v-if="estado.acciones.length" class="d-flex flex-wrap ga-2">
                <v-btn
                  v-for="accion in estado.acciones"
                  :key="accion.texto"
                  :color="accion.color ?? 'primary'"
                  :variant="accion.variant ?? 'tonal'"
                  :block="accion.block"
                  class="text-none"
                  @click="accion.hacer"
                >
                  {{ accion.texto }}
                </v-btn>
              </div>
            </div>

            <dl class="datos mt-6">
              <div class="dato">
                <dt>{{ esLiga ? "Fechas" : "Fecha" }}</dt>
                <dd>{{ fechaEvento }}</dd>
              </div>
              <div v-if="lugar" class="dato">
                <dt>Lugar</dt>
                <dd>
                  <a v-if="googleMapsUrl" :href="googleMapsUrl" target="_blank" rel="noopener noreferrer">{{ lugar }}</a>
                  <template v-else>{{ lugar }}</template>
                </dd>
              </div>
              <div class="dato">
                <dt>Precio</dt>
                <dd>{{ torneo.precioTorneo }} €</dd>
              </div>
              <div class="dato">
                <dt>Plazas</dt>
                <dd>
                  {{ plazasOcupadas }} / {{ torneo.limiteParticipantes || "sin límite" }}
                  <template v-if="porEquipos && torneo.limiteParticipantes">{{ esParejas ? "parejas" : "equipos" }}</template>
                </dd>
              </div>
              <div class="dato">
                <dt>{{ esLiga ? "Jornadas" : "Partidas" }}</dt>
                <!-- Antes de generar la liga o los grupos aún no hay jornadas -->
                <dd>{{ esLiga && torneo.numeroPartidas <= 1 ? "al cerrar las inscripciones" : torneo.numeroPartidas }}</dd>
              </div>
              <div class="dato">
                <dt>Inscripción</dt>
                <dd>del {{ fechaCorta(torneo.inicioInscripciones) }} al {{ fechaCorta(torneo.fechaFinInscripcion) }}</dd>
              </div>
              <div class="dato">
                <dt>{{ esLiga ? "Primera lista" : "Listas" }}</dt>
                <dd>hasta el {{ fechaCorta(torneo.fechaEntregaListas) }}</dd>
              </div>
              <div v-if="torneo.contacto" class="dato">
                <dt>Contacto</dt>
                <dd>{{ torneo.contacto }}</dd>
              </div>
            </dl>

            <template v-if="torneo.descripcionTorneo?.trim()">
              <h2 class="text-subtitle-2 text-medium-emphasis mt-6 mb-1">Descripción</h2>
              <p class="text-body-2 descripcion">{{ torneo.descripcionTorneo }}</p>
            </template>

            <v-btn v-if="torneo.tieneBases" variant="outlined" block class="mt-6 text-none" :loading="descargandoBases" @click="descargarBases">
              Descargar bases
            </v-btn>
          </div>
        </v-window-item>

        <!-- Inscritos: como la pestaña Listas, una línea por jugador -->
        <v-window-item value="inscritos">
          <div class="pa-3">
            <p class="text-caption text-medium-emphasis mb-2">{{ resumenInscritos }}</p>
            <v-text-field
              v-model="search"
              :placeholder="porEquipos ? 'Buscar equipo o jugador' : 'Buscar jugador'"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </div>
          <v-divider />

          <template v-if="!porEquipos">
            <p v-if="inscritosVisibles.length === 0" class="text-center text-medium-emphasis pa-6">
              {{ textoVacio }}
            </p>
            <div v-for="inscrito in inscritosVisibles" :key="inscrito.idUsuario" class="fila px-3 py-2">
              <a class="nick" role="link" tabindex="0" @click="goToUserDetail(inscrito.idUsuario)">
                {{ inscrito.nick }}
              </a>
            </div>
          </template>

          <template v-else>
            <p v-if="equiposVisibles.length === 0" class="text-center text-medium-emphasis pa-6">
              {{ textoVacio }}
            </p>
            <v-expansion-panels v-else v-model="equiposAbiertos" multiple variant="accordion">
              <v-expansion-panel v-for="equipo in equiposVisibles" :key="equipo.nombre" :value="equipo.nombre">
                <v-expansion-panel-title>
                  <span class="font-weight-bold text-truncate me-2">{{ equipo.nombre }}</span>
                  <span class="text-caption text-medium-emphasis flex-shrink-0">
                    {{ equipo.total }} {{ equipo.total === 1 ? "jugador" : "jugadores" }}
                  </span>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="panel-equipo">
                  <div v-for="jugador in equipo.jugadores" :key="jugador.idUsuario" class="fila px-3 py-2">
                    <a class="nick nick--jugador" role="link" tabindex="0" @click="goToUserDetail(jugador.idUsuario)">
                      {{ jugador.nick }}
                    </a>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>
        </v-window-item>

        <!-- Resultados: la vista en vivo de siempre, con sus pestañas. Se carga al abrirla -->
        <v-window-item value="resultados">
          <component :is="vistaResultados" />
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Borrar la inscripción o el equipo: se confirma -->
    <v-dialog v-model="showConfirmarBorrar" max-width="420">
      <v-card>
        <v-card-title class="text-wrap">{{ porEquipos ? textoBorrarEquipo : "¿Borrar tu inscripción?" }}</v-card-title>
        <v-card-text>Dejarás de estar en {{ textosEvento(torneo?.formatoTorneo).el }}. Puedes volver a apuntarte mientras siga abierto.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showConfirmarBorrar = false">Cancelar</v-btn>
          <v-btn color="error" variant="tonal" @click="confirmarBorrar">Borrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Tu inscripción: la misma ventana que en Mis eventos -->
    <ModalInscripcion
      v-if="showMiInscripcion && miInscripcion"
      :idInscripcion="miInscripcion.idInscripcion"
      :idUsuario="Number(idUsuario)"
      :idTorneo="idTorneo"
      :idOrganizador="torneo?.idUsuario ?? 0"
      :ejercitoElegido="miInscripcion.ejercitoElegido ?? null"
      @eliminar-inscripcion="showConfirmarBorrar = true"
      @close="showMiInscripcion = false"
    />

    <!-- Registro equipo -->
    <ModalRegistroEquipo
      :isVisible="showModalInscripcionPorEquipos"
      :tipoTorneo="torneo?.tipoTorneo"
      :idTorneo="idTorneo"
      @update:isVisible="showModalInscripcionPorEquipos = $event"
    />

    <!-- Antes de inscribirse: en liga y copa el ejército, y si comparte su correo con el organizador -->
    <ModalConfirmarInscripcion
      :isVisible="showConfirmarInscripcion"
      :titulo="pedirEjercito ? `¿Con qué ejército juegas ${textosEvento(torneo?.formatoTorneo).el}?` : `Inscribirte en ${textosEvento(torneo?.formatoTorneo).el}`"
      :pedirEjercito="pedirEjercito"
      @update:isVisible="showConfirmarInscripcion = $event"
      @confirm="registrarIndividual"
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
        <v-card-text class="d-flex justify-center align-center" style="height: 150px">
          <v-progress-circular indeterminate color="blue-lighten-3" :size="57"></v-progress-circular>
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
  eliminarEquipoAsync,
} from "@/services/InscripcionesService";
import { useAuth } from "@/composables/useAuth";
import {
  CrearInscripcionDTO,
  EquipoDTO,
  InscripcionUsuarioIndividualDTO,
} from "@/interfaces/Inscripcion";
import ModalError from "@/components/Commons/ModalError.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalConfirmarInscripcion from "@/components/Inscripcion/ModalConfirmarInscripcion.vue";
import { esPorJornadas, nombreEvento, textosEvento } from "@/Constant/FormatoTorneo";
import { esUsuarioBye } from "@/utils/bye";
import { tipoTorneoOptions } from "@/Constant/TiposTorneo";
import ModalInscripcion from "@/components/Inscripcion/ModalInscripcion.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import { diaDeHoy, formatHora, ultimoDiaEvento } from "@/utils/Fecha";
import ModalRegistroEquipo from "@/components/Inscripcion/ModalRegistroEquipo.vue";
import DetalleTorneoLiveView from "@/views/DetalleTorneoLiveView.vue";
import DetalleTorneoLiveMasView from "@/views/DetalleTorneoLiveMasView.vue";
import DetalleTorneoLiveEquiposView from "@/views/DetalleTorneoLiveEquiposView.vue";
import { entregarArchivos } from "@/utils/entregarArchivos";

const { getidUsuario } = useAuth();
const route = useRoute();
const router = useRouter();
const idTorneo = ref<number>(parseInt(route.params.idTorneo as string));

const torneo = ref<Torneo>();
// Liga y Copa comparten ficha: jornadas, ejército fijo y sin horario
const esLiga = computed(() => esPorJornadas(torneo.value?.formatoTorneo));
const participantes = ref<InscripcionUsuarioIndividualDTO[]>([]);
const idUsuario = ref<string | null>(getidUsuario.value);
const estaApuntado = ref<boolean>(false);
const idInscripcion = ref<number>(0);
const idEquipo = ref<number | undefined>(undefined);

const torneosApuntado = ref<InscripcionUsuarioIndividualDTO[]>();

const tab = ref<string>("detalle");
const search = ref<string | null>("");
const tipoTorneo = ref<string>("");

const isLoading = ref<boolean>(true);
const showSuccessModal = ref<boolean>(false);
const messageSuccess = ref<string>("");
const showErrorModal = ref<boolean>(false);
const isRegistering = ref<boolean>(false);
const showModalInscripcionPorEquipos = ref<boolean>(false);

const infoEquipos = ref<EquipoDTO[]>([]);

const porEquipos = computed(() => !!torneo.value && torneo.value.tipoTorneo !== "Individual");
const esParejas = computed(() => torneo.value?.tipoTorneo === "Parejas");
const textoBorrarEquipo = computed(() => (esParejas.value ? "¿Borrar tu pareja?" : "¿Borrar tu equipo?"));

// Computado para determinar si el usuario es el capitán
const isCapitan = computed(() => {
  const equipoCapitan = infoEquipos.value.find(
    equipo =>
      equipo.idCapitan ===
      (idUsuario.value ? parseInt(idUsuario.value) : undefined)
  );
  return equipoCapitan !== undefined;
});

// Watch para actualizar el idEquipo cuando se encuentra el capitán
watch([infoEquipos, idUsuario], () => {
  const equipoCapitan = infoEquipos.value.find(
    equipo =>
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
  if (!torneo.value?.lugarTorneo || !isValidCoordinates(torneo.value.lugarTorneo)) return "";
  return `https://www.google.com/maps?q=${parseFloat(
    torneo.value.lugarTorneo.split(", ")[0]
  )},${parseFloat(torneo.value.lugarTorneo.split(", ")[1])}`;
});

// Función para obtener dirección inversa desde coordenadas
const getAddress = async (lat: number, lon: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.address) {
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

// Computed para verificar si el plazo de inscripción está cerrado
const isInscripcionCerrada = computed(() => {
  if (
    !torneo.value ||
    !torneo.value.fechaFinInscripcion ||
    !torneo.value.inicioInscripciones
  )
    return false;
  // Por días: el último día del plazo aún se puede inscribir (comparar con la hora lo cerraba a medianoche)
  const hoy = diaDeHoy();
  return (
    hoy > torneo.value.fechaFinInscripcion.slice(0, 10) ||
    hoy < torneo.value.inicioInscripciones.slice(0, 10)
  );
});

// Disputado cuando ya pasó su último día: el mismo día del evento todavía no
const yaDisputado = computed(
  () =>
    !!torneo.value &&
    ultimoDiaEvento(torneo.value.fechaInicioTorneo, torneo.value.fechaFinTorneo) < diaDeHoy()
);

const goToUserDetail = (idUsuario: number) => {
  router.push({ name: "detalle-jugador", params: { idUsuario: idUsuario } });
};
// const goToEquipoDetail = (idEquipo: number) => {
//   //TODO: modal con la info (nick) de los jugadores que se pueda pulsar en ellos y te lleven a su perfil
// };

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
    const response = await eliminarEquipoAsync(idEquipo);

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
  try {
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
        torneosApuntado.value.forEach(element => {
          if (element.idTorneo === idTorneo.value) {
            idInscripcion.value = element.idInscripcion;
            estaApuntado.value = true;
            if (element.idEquipo != null) idEquipo.value = element.idEquipo;
          }
        });

      }
    }

    if (torneo.value) tipoTorneo.value = torneo.value.tipoTorneo;
    const pedida = String(route.query.tab ?? "");
    if (PESTANAS.includes(pedida)) tab.value = pedida;
    else if (haEmpezado.value) tab.value = "resultados";

    if (idTorneo.value) {
      const responseEquipos = await getEquiposByTorneoAsync(idTorneo.value);

      infoEquipos.value = responseEquipos.data;
    }
    try {
      if (torneo.value)
        if (isValidCoordinates(torneo.value.lugarTorneo)) {
          getAddress(
            parseFloat(torneo.value.lugarTorneo.split(", ")[0]),
            parseFloat(torneo.value.lugarTorneo.split(", ")[1])
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
  } catch (err) {
    console.error("Error al cargar el torneo:", err);
  } finally {
    isLoading.value = false;
  }
});

watch(
  () => showSuccessModal.value,
  newValue => {
    if (!newValue) {
      router.push({ name: "mis-torneos", params: { tab: "three" } });
    }
  }
);

// "AAAA-MM-DD…" del back como fecha local: con new Date(texto) sería medianoche UTC
const aFecha = (fecha?: string | null) => {
  const [anio, mes, dia] = (fecha ?? "").slice(0, 10).split("-").map(Number);
  return anio ? new Date(anio, mes - 1, dia) : null;
};
// «12 dic 2026»
const fechaCorta = (fecha?: string | null) =>
  aFecha(fecha)?.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) ?? "—";
// «Sáb, 12 dic 2026»: con el día de la semana, que es lo primero que se mira
const fechaLarga = (fecha?: string | null) => {
  const texto = aFecha(fecha)?.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : "—";
};

const fechaEvento = computed(() => {
  const t = torneo.value;
  if (!t) return "";
  const fin = ultimoDiaEvento(t.fechaInicioTorneo, t.fechaFinTorneo);
  if (esLiga.value || fin > t.fechaInicioTorneo.slice(0, 10))
    return `Del ${fechaCorta(t.fechaInicioTorneo)} al ${fechaCorta(fin)}`;
  const hora = formatHora(t.horaInicioTorneo);
  return hora && hora !== "00:00" ? `${fechaLarga(t.fechaInicioTorneo)} · ${hora}` : fechaLarga(t.fechaInicioTorneo);
});

// «Torneo · Individual · 700 puntos»; en liga y copa, también ida y vuelta y ELO
const resumen = computed(() => {
  const t = torneo.value;
  if (!t) return "";
  const tipo = tipoTorneoOptions.find(o => o.value === t.tipoTorneo)?.label ?? t.tipoTorneo;
  const partes = [nombreEvento(t.formatoTorneo), tipo, `${t.puntosTorneo} puntos`];
  if (esLiga.value) partes.push(t.idaYVuelta ? "Ida y vuelta" : "Solo ida", t.cuentaElo ? "Cuenta para el ELO" : "Sin ELO");
  return partes.join(" · ");
});

// La dirección legible; si no hay coordenadas, el texto tal cual
const lugar = computed(() => formattedAddress.value.trim() || (isValidCoordinates(torneo.value?.lugarTorneo ?? "") ? "" : torneo.value?.lugarTorneo ?? ""));

// El bye no es nadie: ni ocupa plaza ni sale en inscritos
const participantesReales = computed(() => participantes.value.filter(p => !esUsuarioBye(p.idUsuario, p.nick)));
const equiposReales = computed(() => infoEquipos.value.filter(e => !esUsuarioBye(e.idCapitan, e.nombreEquipo)));

// En los eventos por equipos o parejas, el límite es de equipos o parejas, como cuenta la gestión del organizador
const plazasOcupadas = computed(() =>
  porEquipos.value ? equiposReales.value.length : participantesReales.value.length
);
const torneoCompleto = computed(
  () => !!torneo.value?.limiteParticipantes && plazasOcupadas.value >= torneo.value.limiteParticipantes
);

const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const texto = computed(() => normalizar((search.value ?? "").trim()));
const porNick = (a: { nick?: string | null }, b: { nick?: string | null }) =>
  (a.nick ?? "").localeCompare(b.nick ?? "", "es", { sensitivity: "base" });

const inscritosVisibles = computed(() =>
  [...participantesReales.value].filter(p => normalizar(p.nick ?? "").includes(texto.value)).sort(porNick)
);

const equiposVisibles = computed(() =>
  equiposReales.value
    .map(e => {
      const nombre = e.nombreEquipo ?? "Equipo";
      const coincideEquipo = normalizar(nombre).includes(texto.value);
      return {
        nombre,
        total: e.inscripciones.length,
        jugadores: [...e.inscripciones]
          .filter(i => coincideEquipo || normalizar(i.nick ?? "").includes(texto.value))
          .sort(porNick),
      };
    })
    .filter(e => e.jugadores.length > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }))
);

// Al buscar se abren los equipos que coinciden
const equiposAbiertos = ref<string[]>([]);
watch(texto, () => {
  equiposAbiertos.value = texto.value ? equiposVisibles.value.map(e => e.nombre) : [];
});

// «45 jugadores» o «20 equipos»
const resumenInscritos = computed(() => {
  if (!porEquipos.value) {
    const n = participantesReales.value.length;
    return `${n} ${n === 1 ? "jugador" : "jugadores"}`;
  }
  const n = equiposReales.value.length;
  if (esParejas.value) return `${n} ${n === 1 ? "pareja" : "parejas"}`;
  return `${n} ${n === 1 ? "equipo" : "equipos"}`;
});

const textoVacio = computed(() => (texto.value ? "Nada coincide con la búsqueda." : "Todavía no hay inscritos."));

// La vista en vivo que toca: la individual también lleva la liga y la copa
const vistaResultados = computed(() => {
  const t = torneo.value;
  if (!t || esPorJornadas(t.formatoTorneo)) return DetalleTorneoLiveView;
  if (t.tipoTorneo !== "Individual") return DetalleTorneoLiveEquiposView;
  return t.listasPorJugador > 1 ? DetalleTorneoLiveMasView : DetalleTorneoLiveView;
});

// La pestaña va en la URL (?tab=resultados): Mis eventos enlaza directo a los resultados y al recargar se queda
const PESTANAS = ["detalle", "inscritos", "resultados"];
watch(tab, valor => {
  if (route.query.tab !== valor) router.replace({ query: { ...route.query, tab: valor } });
});

// Tu situación y lo que puedes hacer, justo bajo el nombre
interface AccionEstado {
  texto: string;
  hacer: () => void;
  color?: string;
  variant?: "flat" | "tonal" | "text" | "outlined";
  block?: boolean;
}

const haEmpezado = computed(() => !!torneo.value && torneo.value.fechaInicioTorneo.slice(0, 10) <= diaDeHoy());

const estado = computed<{ texto: string; acciones: AccionEstado[] }>(() => {
  const t = torneo.value;
  if (!t) return { texto: "", acciones: [] };
  const resultados: AccionEstado = { texto: "Resultados", hacer: goToResultados };
  if (yaDisputado.value) return { texto: "Ya se ha jugado.", acciones: [resultados] };

  const acciones: AccionEstado[] = [];
  let texto = "";
  if (estaApuntado.value) {
    texto = porEquipos.value ? (esParejas.value ? "Tu pareja está inscrita." : "Tu equipo está inscrito.") : "Estás inscrito.";
    acciones.push({ texto: "Mi inscripción", hacer: verMiInscripcion });
    if (isInscripcionCerrada.value) texto += " Las inscripciones están cerradas: ya no se puede borrar.";
    else if (!porEquipos.value || isCapitan.value)
      acciones.push({ texto: "Borrar inscripción", color: "error", variant: "text", hacer: () => (showConfirmarBorrar.value = true) });
    else texto += " Solo el capitán puede borrar la inscripción.";
  } else if (isInscripcionCerrada.value) {
    texto =
      t.inicioInscripciones && diaDeHoy() < t.inicioInscripciones.slice(0, 10)
        ? `Las inscripciones abren el ${fechaCorta(t.inicioInscripciones)}.`
        : "Inscripción cerrada.";
  } else if (torneoCompleto.value) {
    texto = "Plazas agotadas.";
  } else {
    acciones.push({
      texto: porEquipos.value ? (esParejas.value ? "Apuntar pareja" : "Apuntar equipo") : "Apúntate",
      variant: "flat",
      block: true,
      hacer: porEquipos.value ? inscripcionPorEquipos : inscripcionIndividual,
    });
  }
  if (haEmpezado.value) acciones.push(resultados);
  return { texto, acciones };
});

const goToResultados = () => {
  tab.value = "resultados";
};

// La inscripción individual, en la misma ventana que en Mis eventos; la de equipo se gestiona allí
const showMiInscripcion = ref(false);
const miInscripcion = computed(() => torneosApuntado.value?.find(i => i.idTorneo === idTorneo.value));
const verMiInscripcion = () => {
  if (porEquipos.value || !miInscripcion.value) router.push({ name: "mis-torneos" });
  else showMiInscripcion.value = true;
};

const showConfirmarBorrar = ref(false);
const confirmarBorrar = async () => {
  showConfirmarBorrar.value = false;
  showMiInscripcion.value = false;
  if (porEquipos.value) await eliminarInscripcionEquipo(idEquipo.value);
  else await eliminarInscripcion(idInscripcion.value);
};

// En un móvil el PDF puede tardar: sin esto no se ve nada y se vuelve a pulsar
const descargandoBases = ref<boolean>(false);

const descargarBases = async () => {
  descargandoBases.value = true;
  try {
    if (idTorneo.value) {
      const response = await descargarBasesTorneo(idTorneo.value);
      await entregarArchivos([
        {
          blob: response.data,
          nombre: `Bases_Torneo_${torneo.value?.nombreTorneo}.pdf`,
        },
      ]);
    }
  } catch (error) {
    console.error("Error descargando el archivo:", error);
    alert("Error al descargar el archivo. Por favor, inténtelo de nuevo.");
  } finally {
    descargandoBases.value = false;
  }
};

const showConfirmarInscripcion = ref<boolean>(false);
// En liga y copa el ejército de todo el evento se elige al inscribirse
const pedirEjercito = computed(() => esPorJornadas(torneo.value?.formatoTorneo));

const inscripcionIndividual = async () => {
  if (idInscripcion.value == 0) {
    showConfirmarInscripcion.value = true;
    return;
  }
  await registrarIndividual();
};

const registrarIndividual = async (datos?: { ejercito: string | null; compartirEmail: boolean }) => {
  isRegistering.value = true;

  if (
    idUsuario.value != null &&
    idTorneo.value != null &&
    !isInscripcionCerrada.value &&
    idInscripcion.value == 0
  ) {
    const inscripcion: CrearInscripcionDTO = {
      idUsuario: parseInt(idUsuario.value),
      idTorneo: idTorneo.value,
      ejercitoElegido: datos?.ejercito ?? undefined,
      compartirEmail: datos?.compartirEmail ?? null,
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
/* En el ordenador, estrecha y centrada: se lee como en el móvil */
.detalle {
  max-width: 720px;
}

.detalle--ancha {
  max-width: 1100px;
}

/* Menos margen dentro de cada pestaña: así caben las tres en mayúsculas en un móvil de 360 px */
.pestanas-evento :deep(.v-tab) {
  padding-inline: 10px;
}

.cartel {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.titulo {
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.datos {
  margin: 0;
}

.dato {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.dato dt {
  flex-shrink: 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.dato dd {
  margin: 0;
  text-align: right;
  overflow-wrap: anywhere;
}

.dato a {
  color: inherit;
}

.descripcion {
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.fila + .fila {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.nick {
  font-weight: 600;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
}

.nick:hover,
.nick:focus-visible {
  text-decoration: underline;
}

/* Los jugadores, por debajo del equipo: más a la derecha, sobre un fondo algo distinto y en letra más
   pequeña y suave, para que el nombre del equipo destaque */
.panel-equipo :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 0 0 24px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.nick--jugador {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>
