<template>
  <!-- Lo que se ve al desplegar un circuito: su clasificación y sus eventos, sin ventanas encima -->
  <div>
    <div class="d-flex ga-2 mb-3">
      <v-chip
        size="small"
        :color="pestana === 'clasificacion' ? 'primary' : undefined"
        @click="pestana = 'clasificacion'"
      >
        Clasificación
      </v-chip>
      <v-chip size="small" :color="pestana === 'eventos' ? 'primary' : undefined" @click="pestana = 'eventos'">
        Eventos ({{ torneos.length }})
      </v-chip>
    </div>

    <div v-if="cargando" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" size="28" />
    </div>

    <!-- Clasificación: los primeros y, si se pide, el resto -->
    <template v-else-if="pestana === 'clasificacion'">
      <p v-if="clasificacion.length === 0" class="text-body-2 text-medium-emphasis mb-0">
        Aún no hay resultados en este circuito.
      </p>
      <template v-else>
        <div class="fila cabecera text-caption text-medium-emphasis">
          <span>#</span>
          <span>Jugador</span>
          <span class="text-right">Puntos</span>
        </div>
        <div v-for="jugador in visibles" :key="jugador.nick" class="fila text-body-2">
          <span class="text-medium-emphasis">{{ jugador.posicion }}</span>
          <span class="nick" :class="{ 'font-weight-bold': jugador.posicion <= 3 }">{{ jugador.nick }}</span>
          <span class="text-right">{{ jugador.totalPuntos }}</span>
        </div>
        <p class="text-caption text-medium-emphasis mt-2 mb-0">Suma de sus 4 mejores resultados en el circuito.</p>
        <div v-if="clasificacion.length > DE_ENTRADA" class="text-center mt-1">
          <v-btn variant="text" size="small" color="primary" class="text-none" @click="verToda = !verToda">
            {{ verToda ? "Ver menos" : `Ver toda la clasificación (${clasificacion.length})` }}
          </v-btn>
        </div>
      </template>
    </template>

    <!-- Eventos: cada uno lleva a su página -->
    <template v-else>
      <p v-if="torneos.length === 0" class="text-body-2 text-medium-emphasis mb-0">Aún no tiene eventos.</p>
      <v-list v-else density="compact" bg-color="transparent" class="py-0">
        <template v-for="(torneo, i) in torneos" :key="torneo.idTorneo">
          <v-divider v-if="i > 0" />
          <v-list-item :to="`/detalle-evento/${torneo.idTorneo}`" append-icon="mdi-chevron-right" class="px-0">
            <v-list-item-title class="text-body-2 nick">{{ torneo.torneoNombre }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </template>

    <!-- Solo quien lo creó lo renombra o lo borra; los Amon Sûl son de la web -->
    <div v-if="esCreador" class="d-flex align-center flex-wrap ga-2 mt-3">
      <span class="text-caption text-medium-emphasis flex-grow-1">Lo has creado tú.</span>
      <v-btn size="small" variant="text" class="text-none" @click="abrirRenombrar">Renombrar</v-btn>
      <v-btn size="small" variant="text" color="error" class="text-none" @click="showBorrar = true">Borrar</v-btn>
    </div>
  </div>

  <ModalNombreCircuito
    v-model="showRenombrar"
    titulo="Renombrar circuito"
    textoBoton="Guardar"
    :nombreInicial="circuito.nombreCircuito"
    :guardando="guardando"
    :error="errorRenombrar"
    @guardar="renombrar"
  />

  <v-dialog v-model="showBorrar" max-width="420">
    <v-card>
      <v-card-title class="text-wrap">¿Borrar {{ circuito.nombreCircuito }}?</v-card-title>
      <v-card-text>
        <template v-if="torneos.length > 0">
          {{ torneos.length === 1 ? "El evento que tiene deja" : `Los ${torneos.length} eventos que tiene dejan` }}
          de estar en él; los eventos no se borran.
        </template>
        No se puede deshacer.
        <p v-if="errorBorrar" class="text-error mt-2">{{ errorBorrar }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showBorrar = false">Cancelar</v-btn>
        <v-btn color="error" variant="tonal" :loading="guardando" @click="borrar">Borrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, defineEmits, defineProps, onMounted, ref } from "vue";
import { CircuitoDTO } from "@/interfaces/Circuito";
import { useCircuitoData } from "@/composables/useCircuitoData";
import { useAuth } from "@/composables/useAuth";
import { borrarCircuitoAsync, renombrarCircuitoAsync } from "@/services/CircuitosService";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import { esCircuitoAmonSul } from "@/utils/circuitoAmonSul";
import ModalNombreCircuito from "./components/ModalNombreCircuito.vue";

const DE_ENTRADA = 5;

const props = defineProps<{ circuito: CircuitoDTO }>();
const emit = defineEmits<{
  (event: "renombrado", nombre: string): void;
  (event: "borrado", nombre: string): void;
}>();

const pestana = ref<"clasificacion" | "eventos">("clasificacion");
const verToda = ref(false);
const cargando = ref(true);

// Se carga al desplegarlo por primera vez; al recogerlo y volver a abrirlo ya está
const { torneos, clasificacion, loadTorneos, prepareClasificacion } = useCircuitoData();
const visibles = computed(() => (verToda.value ? clasificacion.value : clasificacion.value.slice(0, DE_ENTRADA)));

onMounted(async () => {
  try {
    await loadTorneos(props.circuito);
    await prepareClasificacion();
  } catch (error) {
    console.error("Error al cargar el circuito:", error);
  } finally {
    cargando.value = false;
  }
});

const { getidUsuario } = useAuth();
const esCreador = computed(
  () =>
    props.circuito.idUsuario != null &&
    props.circuito.idUsuario === Number(getidUsuario.value) &&
    !esCircuitoAmonSul(props.circuito.nombreCircuito)
);

const guardando = ref(false);
const showRenombrar = ref(false);
const errorRenombrar = ref<string | null>(null);
const showBorrar = ref(false);
const errorBorrar = ref<string | null>(null);

const abrirRenombrar = () => {
  errorRenombrar.value = null;
  showRenombrar.value = true;
};

const renombrar = async (nombre: string) => {
  guardando.value = true;
  errorRenombrar.value = null;
  try {
    await renombrarCircuitoAsync(props.circuito.idCircuito, nombre);
    showRenombrar.value = false;
    emit("renombrado", nombre);
  } catch (error) {
    errorRenombrar.value = mensajeDelBack(error, "No se ha podido renombrar el circuito. Inténtalo de nuevo.");
  } finally {
    guardando.value = false;
  }
};

const borrar = async () => {
  guardando.value = true;
  errorBorrar.value = null;
  try {
    await borrarCircuitoAsync(props.circuito.idCircuito);
    showBorrar.value = false;
    emit("borrado", props.circuito.nombreCircuito);
  } catch (error) {
    errorBorrar.value = mensajeDelBack(error, "No se ha podido borrar el circuito. Inténtalo de nuevo.");
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.fila {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 56px;
  column-gap: 8px;
  padding: 6px 0;
}

.fila + .fila {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cabecera {
  padding-top: 0;
}

.nick {
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
