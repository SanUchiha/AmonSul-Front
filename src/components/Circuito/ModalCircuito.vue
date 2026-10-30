<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card class="elevation-2 rounded">
      <v-card-title class="d-flex justify-space-between align-center ga-2 text-wrap">
        <span class="headline flex-grow-1">{{ props.circuito?.nombreCircuito }}</span>
        <v-btn 
          icon 
          size="small" 
          variant="text"
          @click="close"
          class="close-button flex-shrink-0"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <CircuitoTorneosList :torneos="torneos" />

        <!-- Solo quien lo creó lo renombra o lo borra -->
        <div v-if="esCreador" class="mt-4">
          <p class="text-caption text-medium-emphasis mb-2">Has creado este circuito.</p>
          <div class="d-flex flex-wrap ga-2">
            <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" @click="abrirRenombrar">
              Renombrar
            </v-btn>
            <v-btn size="small" variant="tonal" color="error" prepend-icon="mdi-delete" @click="showBorrar = true">
              Borrar
            </v-btn>
          </div>
        </div>
      </v-card-text>
      
      <v-divider class="my-3"></v-divider>

      <CircuitoModalActions 
        @ver-clasificacion="abrirModalClasificacion"
        @close="close"
      />
    </v-card>
  </v-dialog>

  <ModalNombreCircuito
    v-model="showRenombrar"
    titulo="Renombrar circuito"
    textoBoton="Guardar"
    :nombreInicial="props.circuito?.nombreCircuito"
    :guardando="guardando"
    :error="errorRenombrar"
    @guardar="renombrar"
  />

  <v-dialog v-model="showBorrar" max-width="420">
    <v-card>
      <v-card-title class="text-wrap">¿Borrar {{ props.circuito?.nombreCircuito }}?</v-card-title>
      <v-card-text>
        <template v-if="torneos.length > 0">
          {{ torneos.length === 1 ? "El torneo que tiene deja" : `Los ${torneos.length} torneos que tiene dejan` }}
          de estar en él; los torneos no se borran.
        </template>
        No se puede deshacer.
        <p v-if="errorBorrar" class="text-error mt-2">{{ errorBorrar }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="showBorrar = false">Cancelar</v-btn>
        <v-btn color="error" variant="tonal" :loading="guardando" @click="borrar">Borrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de clasificación -->
  <ModalClasificacion 
    v-model="showModalClasificacion"
    :circuito-nombre="props.circuito?.nombreCircuito || ''"
    :clasificacion="clasificacion"
    :loading="loadingClasificacion"
  />
</template>
<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";
import { CircuitoDTO } from "@/interfaces/Circuito";
import { useCircuitoData } from "@/composables/useCircuitoData";
import { useAuth } from "@/composables/useAuth";
import { borrarCircuitoAsync, renombrarCircuitoAsync } from "@/services/CircuitosService";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import { esCircuitoAmonSul } from "@/utils/circuitoAmonSul";
import CircuitoTorneosList from "./components/CircuitoTorneosList.vue";
import CircuitoModalActions from "./components/CircuitoModalActions.vue";
import ModalClasificacion from "./components/ModalClasificacion.vue";
import ModalNombreCircuito from "./components/ModalNombreCircuito.vue";

const props = defineProps<{
  circuito: CircuitoDTO | null;
  showModalCircuito: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "renombrado", nombre: string): void;
  (event: "borrado", nombre: string): void;
}>();

const { getidUsuario } = useAuth();
// Los Amon Sûl son de la web: aunque estén a nombre de la administración, no se renombran ni se borran
const esCreador = computed(
  () =>
    props.circuito?.idUsuario != null &&
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
  if (!props.circuito) return;
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
  if (!props.circuito) return;
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

const show = ref<boolean>(true);
const showModalClasificacion = ref<boolean>(false);
const loadingClasificacion = ref<boolean>(false);

// Usar el composable para la lógica de datos
const { torneos, clasificacion, loadTorneos, prepareClasificacion } = useCircuitoData();

const close = () => {
  show.value = false;
  emit("close");
};

const abrirModalClasificacion = async () => {
  loadingClasificacion.value = true;
  showModalClasificacion.value = true;
  try {
    await prepareClasificacion();
  } catch (error) {
    console.error("Error al cargar la clasificación:", error);
  } finally {
    loadingClasificacion.value = false;
  }
};

watch(show, (newValue) => {
  if (!newValue) {
    emit("close");
  }
});

// Observa los cambios en props.circuito para recargar torneos
watch(
  () => props.circuito,
  (newCircuito) => {
    if (newCircuito) {
      loadTorneos(newCircuito);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.close-button {
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.05);
  }
}
</style>
