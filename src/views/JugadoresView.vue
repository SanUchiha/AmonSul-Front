<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px">
    <LoadingGandalf />
  </div>
  <v-container v-else class="usuarios text-left">
    <h1 class="text-h5 font-weight-bold mb-1">Usuarios</h1>
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
        class="mb-3"
      />

      <v-card v-if="filtrados.length === 0" variant="outlined" class="pa-4 text-center">
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ busqueda ? `Ningún jugador coincide con «${busqueda}».` : "Aún no hay jugadores." }}
        </p>
      </v-card>
      <template v-else>
        <p v-if="busqueda" class="text-caption text-medium-emphasis mb-2">
          {{ filtrados.length }} {{ filtrados.length === 1 ? "jugador" : "jugadores" }}
        </p>
        <v-card variant="outlined">
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
        <!-- Por tandas: son más de mil -->
        <div v-if="filtrados.length > visibles.length" class="text-center mt-3">
          <v-btn variant="tonal" size="small" @click="cuantosVer += TANDA">
            Ver más ({{ filtrados.length - visibles.length }})
          </v-btn>
        </div>
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
import MapaUsuarios from "@/components/Mapa/MapaUsuarios.vue";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";

const TANDA = 50;

const usuariosStore = useUsuariosStore();
const isLoading = ref(false);
const tab = ref("listado");
const busqueda = ref<string | null>("");
const cuantosVer = ref(TANDA);

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

const filtrados = computed(() => {
  const texto = normalizar(busqueda.value);
  if (!texto) return jugadores.value;
  return jugadores.value.filter(
    j =>
      normalizar(j.nick).includes(texto) ||
      normalizar(j.faccion?.nombreFaccion).includes(texto) ||
      normalizar(j.ciudad).includes(texto)
  );
});

const visibles = computed(() => filtrados.value.slice(0, cuantosVer.value));

// Cada búsqueda empieza por la primera tanda
watch(busqueda, () => (cuantosVer.value = TANDA));

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

.nick,
.detalle {
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
