<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px">
    <LoadingGandalf />
  </div>
  <v-container v-else class="gestion text-left">
    <v-btn color="primary" variant="flat" class="mb-3 mx-auto d-flex crear" @click="crear = true">
      Crear evento
    </v-btn>

    <v-chip-group v-model="vista" mandatory column selected-class="text-primary" class="mb-2 fichas">
      <v-chip value="proximos" filter>Próximos y en curso ({{ proximos.length }})</v-chip>
      <v-chip value="terminados" filter>Terminados ({{ terminados.length }})</v-chip>
    </v-chip-group>

    <v-card v-if="lista.length === 0" variant="outlined" class="pa-4 text-center">
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{
          vista === "proximos"
            ? "No organizas ningún evento próximo. Crea uno con «Crear evento»."
            : "Aún no ha terminado ningún evento tuyo."
        }}
      </p>
    </v-card>
    <v-row v-else dense>
      <v-col v-for="evento in visibles" :key="evento.idTorneo" cols="12" sm="6" lg="4">
        <!-- Toda la tarjeta lleva a su gestión -->
        <v-card variant="outlined" class="pa-3 h-100" link @click="router.push(rutaGestion(evento))">
          <div class="d-flex align-start ga-2">
            <div class="text-body-1 font-weight-bold nombre flex-grow-1">{{ evento.nombreTorneo }}</div>
            <v-chip v-if="estaEnCurso(evento)" size="x-small" color="success" variant="tonal" class="flex-shrink-0 mt-1">
              En curso
            </v-chip>
            <v-btn
              icon="mdi-trash-can-outline"
              variant="text"
              size="small"
              density="comfortable"
              color="error"
              class="flex-shrink-0 mt-n1"
              :aria-label="`Borrar ${evento.nombreTorneo}`"
              @click.stop="pedirBorrado(evento)"
            />
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ fechas(evento) }} · {{ nombreEvento(evento.formatoTorneo) }} · {{ tipo(evento) }}
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- Por tandas: los terminados pueden ser muchos -->
    <div v-if="lista.length > visibles.length" class="text-center mt-2">
      <v-btn variant="tonal" size="small" @click="cuantosVer += TANDA">
        Ver más ({{ lista.length - visibles.length }})
      </v-btn>
    </div>
  </v-container>

  <ModalCrearTorneo
    :isVisible="crear"
    :idUsuario="idUsuario"
    @close="crear = false"
    @confirm="alCrear"
  />

  <!-- Borrar no tiene vuelta atrás: se confirma -->
  <v-dialog :model-value="!!aBorrar" :persistent="borrando" max-width="420" @update:model-value="aBorrar = null">
    <v-card v-if="aBorrar">
      <v-card-title class="text-wrap">
        ¿Borrar {{ textosEvento(aBorrar.formatoTorneo).el }}?
      </v-card-title>
      <v-card-text>
        Se borrará <strong>{{ aBorrar.nombreTorneo }}</strong>. No se puede deshacer.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="borrando" @click="aBorrar = null">Cancelar</v-btn>
        <v-btn color="error" variant="tonal" :loading="borrando" @click="borrar">Borrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { TorneoPropioDTO } from "@/interfaces/Torneo";
import { deleteTorneo, getTorneosCreadosUsuario } from "@/services/TorneosService";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import { FORMATO_COPA, esPorJornadas, nombreEvento, textosEvento } from "@/Constant/FormatoTorneo";
import { tipoTorneoOptions } from "@/Constant/TiposTorneo";
import { diaDeHoy, formatFechaSpaWhitoutAsync, ultimoDiaEvento } from "@/utils/Fecha";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import ModalCrearTorneo from "@/components/GestionTorneos/ModalCrearTorneo.vue";

const TANDA = 10;

const router = useRouter();
const { getidUsuario } = useAuth();
const { triggerToast } = useToast();
const idUsuario = parseInt(getidUsuario.value);

const isLoading = ref(true);
const eventos = ref<TorneoPropioDTO[]>([]);
const vista = ref<"proximos" | "terminados">("proximos");
const cuantosVer = ref(TANDA);
const crear = ref(false);

// Las fechas, como en Mis eventos: un evento termina el día que acaba
const primerDia = (e: TorneoPropioDTO) => (e.fechaInicioTorneo ?? e.fechaFinTorneo ?? "").slice(0, 10);
const ultimoDia = (e: TorneoPropioDTO) => ultimoDiaEvento(primerDia(e), e.fechaFinTorneo);
const haTerminado = (e: TorneoPropioDTO) => !!primerDia(e) && ultimoDia(e) < diaDeHoy();
const estaEnCurso = (e: TorneoPropioDTO) => !!primerDia(e) && primerDia(e) <= diaDeHoy() && !haTerminado(e);

const fechas = (e: TorneoPropioDTO) => {
  const inicio = primerDia(e);
  if (!inicio) return "Sin fecha";
  const fin = ultimoDia(e);
  return fin > inicio
    ? `Del ${formatFechaSpaWhitoutAsync(inicio)} al ${formatFechaSpaWhitoutAsync(fin)}`
    : formatFechaSpaWhitoutAsync(inicio);
};
const tipo = (e: TorneoPropioDTO) => tipoTorneoOptions.find(t => t.value === e.tipoTorneo)?.label ?? e.tipoTorneo;

// Próximos: primero el que antes empieza. Terminados: primero el que acabó más tarde
const proximos = computed(() =>
  eventos.value.filter(e => !haTerminado(e)).sort((a, b) => primerDia(a).localeCompare(primerDia(b)))
);
const terminados = computed(() =>
  eventos.value.filter(e => haTerminado(e)).sort((a, b) => ultimoDia(b).localeCompare(ultimoDia(a)))
);
const lista = computed(() => (vista.value === "proximos" ? proximos.value : terminados.value));
const visibles = computed(() => lista.value.slice(0, cuantosVer.value));
watch(vista, () => (cuantosVer.value = TANDA));

// Cada formato tiene su gestión
const rutaGestion = (e: TorneoPropioDTO) => {
  const params = { idTorneo: e.idTorneo };
  if (esPorJornadas(e.formatoTorneo))
    return {
      name: e.formatoTorneo === FORMATO_COPA ? "detalle-torneo-gestion-copa" : "detalle-torneo-gestion-liga",
      params,
    };
  if (e.tipoTorneo !== "Individual") return { name: "detalle-torneo-gestion-equipos", params };
  if (e.listasPorJugador > 1) return { name: "detalle-torneo-gestion-individual-mas", params };
  return { name: "detalle-torneo-gestion", params };
};

const cargar = async () => {
  try {
    const response = await getTorneosCreadosUsuario(String(idUsuario));
    eventos.value = response.data;
    // Sin eventos próximos, se empieza por los terminados
    if (proximos.value.length === 0 && terminados.value.length > 0) vista.value = "terminados";
  } catch (error) {
    console.error("Error recuperando los eventos creados por el usuario:", error);
  } finally {
    isLoading.value = false;
  }
};

const alCrear = async () => {
  crear.value = false;
  vista.value = "proximos";
  await cargar();
};

const aBorrar = ref<TorneoPropioDTO | null>(null);
const borrando = ref(false);
const pedirBorrado = (evento: TorneoPropioDTO) => (aBorrar.value = evento);
const borrar = async () => {
  if (!aBorrar.value) return;
  const evento = aBorrar.value;
  borrando.value = true;
  try {
    await deleteTorneo(evento.idTorneo);
    eventos.value = eventos.value.filter(e => e.idTorneo !== evento.idTorneo);
    triggerToast("success", `Se ha borrado ${textosEvento(evento.formatoTorneo).el}`);
  } catch (error) {
    console.error("Error borrando el evento:", error);
    triggerToast("error", `No se ha podido borrar ${textosEvento(evento.formatoTorneo).el}`);
  } finally {
    borrando.value = false;
    aBorrar.value = null;
  }
};

onMounted(cargar);
</script>

<style scoped>
/* En el ordenador, ancha para las tarjetas; en el móvil, una debajo de otra */
.gestion {
  max-width: 1100px;
}

/* A todo lo ancho en el móvil; en el ordenador, sin estirarse */
.crear {
  width: 100%;
  max-width: 360px;
}

/* Las fichas, centradas como el botón */
.fichas :deep(.v-slide-group__content) {
  justify-content: center;
}

.nombre {
  overflow-wrap: anywhere;
}
</style>
