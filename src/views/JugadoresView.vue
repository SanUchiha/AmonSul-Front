<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px">
    <LoadingGandalf />
  </div>
  <v-container v-else class="usuarios text-left">
    <p class="text-body-2 text-medium-emphasis mb-3">{{ jugadores.length }} jugadores</p>

    <v-tabs v-model="tab" color="primary" grow class="mb-3">
      <v-tab value="listado">Listado</v-tab>
      <v-tab value="mapa">Mapa</v-tab>
    </v-tabs>

    <template v-if="tab === 'listado'">
      <!-- Un solo buscador: nick, comunidad o ciudad -->
      <v-text-field
        v-model="busqueda"
        placeholder="Buscar por nick, comunidad o ciudad"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        class="mb-2"
      />
      <!-- Uno al lado del otro también en el móvil: así no ocupan media pantalla -->
      <v-row dense class="mb-2">
        <v-col cols="6">
          <v-autocomplete
            v-model="faccion"
            :items="facciones"
            label="Facción"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="provincia"
            :items="provincias"
            label="Provincia"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
      </v-row>

      <v-card v-if="filtrados.length === 0" variant="outlined" class="pa-4 text-center">
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ hayFiltros ? "Ningún jugador coincide con la búsqueda." : "Aún no hay jugadores." }}
        </p>
      </v-card>
      <template v-else>
        <p v-if="hayFiltros" class="text-caption text-medium-emphasis mb-2">
          {{ filtrados.length }} {{ filtrados.length === 1 ? "jugador" : "jugadores" }}
        </p>
        <v-card ref="lista" variant="outlined" class="lista">
          <v-list density="compact" bg-color="transparent" class="py-0">
            <template v-for="(jugador, i) in visibles" :key="jugador.idUsuario">
              <v-divider v-if="i > 0" />
              <v-list-item
                :to="{ name: 'detalle-jugador', params: { idUsuario: jugador.idUsuario } }"
                append-icon="mdi-chevron-right"
              >
                <v-list-item-title class="font-weight-bold nick">{{ jugador.nick }}</v-list-item-title>
                <div v-if="detalle(jugador)" class="text-caption text-medium-emphasis detalle">
                  {{ detalle(jugador) }}
                </div>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
        <!-- Por páginas: son más de mil -->
        <v-pagination
          v-if="paginas > 1"
          v-model="pagina"
          :length="paginas"
          :total-visible="5"
          density="comfortable"
          class="mt-3"
        />
      </template>
    </template>

    <MapaUsuarios v-else :usersView="jugadores" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { UsuarioDTO } from "@/interfaces/Usuario";
import { useUsuariosStore } from "@/store/usuarios";
import { esUsuarioBye } from "@/utils/bye";
import { codigoProvinciaDeCiudad, PROVINCIAS } from "@/utils/provincia";
import MapaUsuarios from "@/components/Mapa/MapaUsuarios.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";

const POR_PAGINA = 20;

const usuariosStore = useUsuariosStore();
const isLoading = ref(false);
const tab = ref("listado");
const busqueda = ref<string | null>("");
const faccion = ref<string | null>(null);
const provincia = ref<string | null>(null);
const pagina = ref(1);
const lista = ref<{ $el: HTMLElement } | null>(null);

// Ni el bye ni las cuentas borradas («Desconocido N») son jugadores
const jugadores = computed<UsuarioDTO[]>(() =>
  usuariosStore.usuarios
    .filter(u => !esUsuarioBye(u.idUsuario, u.nick) && !/^desconocido \d+$/i.test(u.nick.trim()))
    .sort((a, b) => a.nick.localeCompare(b.nick, "es", { sensitivity: "base" }))
);

// Sin tildes ni mayúsculas: «almeria» encuentra Almería
const normalizar = (texto?: string | null) =>
  (texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const detalle = (jugador: UsuarioDTO) =>
  [jugador.faccion?.nombreFaccion, jugador.ciudad].filter(Boolean).join(" · ");

// Solo las facciones y provincias que tienen algún jugador
const facciones = computed(() =>
  [...new Set(jugadores.value.map(j => j.faccion?.nombreFaccion).filter((f): f is string => !!f))].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  )
);
const provincias = computed(() =>
  [...new Set(jugadores.value.map(j => codigoProvinciaDeCiudad(j.ciudad)).filter((c): c is string => !!c))]
    .map(codigo => ({ title: PROVINCIAS[codigo] ?? codigo, value: codigo }))
    .sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }))
);

const hayFiltros = computed(() => !!normalizar(busqueda.value) || !!faccion.value || !!provincia.value);

const filtrados = computed(() => {
  const texto = normalizar(busqueda.value);
  return jugadores.value.filter(
    j =>
      (!faccion.value || j.faccion?.nombreFaccion === faccion.value) &&
      (!provincia.value || codigoProvinciaDeCiudad(j.ciudad) === provincia.value) &&
      (!texto ||
        normalizar(j.nick).includes(texto) ||
        normalizar(j.faccion?.nombreFaccion).includes(texto) ||
        normalizar(j.ciudad).includes(texto))
  );
});

const paginas = computed(() => Math.ceil(filtrados.value.length / POR_PAGINA));
const visibles = computed(() => filtrados.value.slice((pagina.value - 1) * POR_PAGINA, pagina.value * POR_PAGINA));

// Cada búsqueda o filtro empieza por la primera página
watch([busqueda, faccion, provincia], () => (pagina.value = 1));
// Al cambiar de página, al principio de la lista
watch(pagina, () => lista.value?.$el.scrollIntoView({ behavior: "smooth", block: "start" }));

onMounted(async () => {
  if (usuariosStore.usuarios.length) return;
  isLoading.value = true;
  try {
    await usuariosStore.requestUsuarios();
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* En el ordenador, estrecha y centrada: se lee como en el móvil */
.usuarios {
  max-width: 720px;
}

/* Al saltar de página, que la barra de arriba no tape el principio de la lista */
.lista {
  scroll-margin-top: 80px;
}

.nick,
.detalle {
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
