<template>
  <v-container class="circuitos text-left">
    <!-- Cualquiera puede crear uno: los organizadores meten sus eventos desde la gestión -->
    <v-btn color="primary" variant="flat" class="mb-3 mx-auto d-flex crear" @click="abrirCrear">
      Crear circuito
    </v-btn>

    <v-text-field
      v-model="busqueda"
      placeholder="Buscar circuito"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-2"
    />

    <!-- Los tres últimos años, el actual primero; los demás y «Todos», en el desplegable -->
    <div class="d-flex flex-wrap justify-center ga-2 mb-3">
      <v-chip
        v-for="a in aniosRecientes"
        :key="a"
        size="small"
        :color="anio === a ? 'primary' : undefined"
        :prepend-icon="anio === a ? 'mdi-check' : undefined"
        @click="anio = a"
      >
        {{ a }} ({{ deAnio(a).length }})
      </v-chip>
      <v-menu>
        <template #activator="{ props: menu }">
          <v-chip
            v-bind="menu"
            size="small"
            :color="enDesplegable ? 'primary' : undefined"
            :prepend-icon="enDesplegable ? 'mdi-check' : undefined"
            append-icon="mdi-menu-down"
          >
            {{ enDesplegable ? textoAnio(anio) : "Más" }}
          </v-chip>
        </template>
        <v-list density="compact">
          <v-list-item v-for="a in aniosOtros" :key="a" :active="anio === a" @click="anio = a">
            {{ a }} ({{ deAnio(a).length }})
          </v-list-item>
          <v-list-item :active="anio === TODOS" @click="anio = TODOS">Todos ({{ circuitos.length }})</v-list-item>
        </v-list>
      </v-menu>
    </div>

    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <v-card v-else-if="filtrados.length === 0" variant="outlined" class="pa-4 text-center">
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{ busqueda ? "Ningún circuito coincide con la búsqueda." : "No hay circuitos este año." }}
      </p>
    </v-card>
    <!-- Al pulsar uno se despliega debajo con su clasificación y sus eventos; solo uno abierto a la vez -->
    <v-expansion-panels v-else v-model="abierto" variant="accordion" class="lista">
      <v-expansion-panel v-for="circuito in filtrados" :key="circuito.idCircuito" :value="circuito.idCircuito" elevation="0">
        <v-expansion-panel-title>
          <div class="min-w-0">
            <div class="font-weight-bold nombre">{{ circuito.nombreCircuito }}</div>
            <div v-if="circuito.numeroEventos != null" class="text-caption text-medium-emphasis">
              {{ circuito.numeroEventos }} {{ circuito.numeroEventos === 1 ? "evento" : "eventos" }}
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <DetalleCircuito :circuito="circuito" @renombrado="onRenombrado" @borrado="onBorrado" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <ModalNombreCircuito
      v-model="showCrear"
      titulo="Crear circuito"
      textoBoton="Crear"
      :guardando="creando"
      :error="errorCrear"
      @guardar="crear"
    />

    <ModalSuccess
      :isVisible="showSuccess"
      :message="mensajeExito"
      @update:isVisible="showSuccess = $event"
    />
  </v-container>
</template>

<script lang="ts" setup>
import DetalleCircuito from "@/components/Circuito/DetalleCircuito.vue";
import ModalNombreCircuito from "@/components/Circuito/components/ModalNombreCircuito.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import { CircuitoDTO } from "@/interfaces/Circuito";
import { crearCircuitoAsync, getCircuitos } from "@/services/CircuitosService";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import { ref, onMounted, computed, watch } from "vue";

// El circuito desplegado
const abierto = ref<number | null>(null);

// Referencia para almacenar los circuitos
const circuitos = ref<CircuitoDTO[]>([]);
const loading = ref<boolean>(false);

// Cada circuito, en un solo año: el de su creación (así la suma de los años da «Todos»). Si el servidor aún no
// la manda, el que lleve en el nombre
const TODOS = 0;
const ANIO_ACTUAL = new Date().getFullYear();
const aniosDe = (circuito: CircuitoDTO): number[] => {
  if (circuito.fechaCreacion) return [Number(circuito.fechaCreacion.slice(0, 4))];
  const enElNombre = circuito.nombreCircuito.match(/\b(20\d{2})\b/);
  return enElNombre ? [Number(enElNombre[1])] : [];
};
const deAnio = (anio: number) => circuitos.value.filter(c => aniosDe(c).includes(anio));
// El actual primero; los demás, del más nuevo al más antiguo
const anios = computed(() => {
  const todos = [...new Set(circuitos.value.flatMap(aniosDe))];
  return todos.sort((a, b) => (a === ANIO_ACTUAL ? -1 : b === ANIO_ACTUAL ? 1 : b - a));
});
// Fichas para el año actual y los dos anteriores (los que haya); el resto, al desplegable
const aniosRecientes = computed(() =>
  anios.value.filter(a => a <= ANIO_ACTUAL && a > ANIO_ACTUAL - 3)
);
const aniosOtros = computed(() => anios.value.filter(a => !aniosRecientes.value.includes(a)));
const anio = ref<number>(TODOS);
const enDesplegable = computed(() => !aniosRecientes.value.includes(anio.value));
const textoAnio = (a: number) => (a === TODOS ? `Todos (${circuitos.value.length})` : `${a} (${deAnio(a).length})`);
// Al cargar, el año actual; si no hay circuitos de este año, el primero que haya
watch(anios, lista => {
  if (anio.value === TODOS || !lista.includes(anio.value)) anio.value = lista[0] ?? TODOS;
});

// Sin tildes ni mayúsculas
const busqueda = ref<string | null>("");
const normalizar = (texto?: string | null) =>
  (texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const filtrados = computed(() => {
  const texto = normalizar(busqueda.value);
  return (anio.value === TODOS ? circuitos.value : deAnio(anio.value)).filter(
    c => !texto || normalizar(c.nombreCircuito).includes(texto)
  );
});

// Función para cargar los circuitos
const loadCircuitos = async () => {
  loading.value = true;
  try {
    const response = await getCircuitos();
    // Los más nuevos primero, como al añadir un torneo a un circuito: en el móvil los de este año quedaban al final
    circuitos.value = [...response.data].sort((a: CircuitoDTO, b: CircuitoDTO) => b.idCircuito - a.idCircuito);
  } catch (error) {
    console.error("Error al cargar circuitos:", error);
  } finally {
    loading.value = false;
  }
};


// Crear un circuito: queda a nombre de quien lo crea
const showCrear = ref(false);
const creando = ref(false);
const errorCrear = ref<string | null>(null);
const showSuccess = ref(false);
const mensajeExito = ref("");

const abrirCrear = () => {
  errorCrear.value = null;
  showCrear.value = true;
};

const crear = async (nombre: string) => {
  creando.value = true;
  errorCrear.value = null;
  try {
    await crearCircuitoAsync(nombre);
    showCrear.value = false;
    await loadCircuitos();
    mensajeExito.value = `Circuito «${nombre}» creado. Los organizadores pueden añadir sus torneos desde la gestión.`;
    showSuccess.value = true;
  } catch (error) {
    errorCrear.value = mensajeDelBack(error, "No se ha podido crear el circuito. Inténtalo de nuevo.");
  } finally {
    creando.value = false;
  }
};

// El creador lo ha renombrado o borrado desde el desplegable
const onRenombrado = async () => {
  await loadCircuitos();
};

const onBorrado = async (nombre: string) => {
  abierto.value = null;
  await loadCircuitos();
  mensajeExito.value = `Circuito «${nombre}» borrado.`;
  showSuccess.value = true;
};

// Cargar circuitos cuando el componente esté montado
onMounted(() => {
  loadCircuitos();
});
</script>

<style lang="scss" scoped>
/* En el ordenador, estrecha y centrada: se lee como en el móvil */
.circuitos {
  max-width: 720px;
}

/* A todo lo ancho en el móvil; en el ordenador, sin estirarse */
.crear {
  width: 100%;
  max-width: 360px;
}

.nombre {
  overflow-wrap: anywhere;
  white-space: normal;
}

/* Como las demás listas: un borde alrededor y una línea entre circuitos */
.lista {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.lista :deep(.v-expansion-panel-title) {
  padding: 10px 16px;
  min-height: 0;
}
</style>
