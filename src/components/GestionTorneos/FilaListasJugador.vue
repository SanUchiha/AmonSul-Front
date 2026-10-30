<template>
  <!-- Un jugador de la pestaña Listas: su nick y, en la misma línea, sus ejércitos; pulsar uno abre la lista -->
  <div class="d-flex align-center flex-wrap fila px-3 py-2">
    <a
      class="nick sin-desbordar"
      role="link"
      tabindex="0"
      @click="emit('perfil', jugador.idUsuario)"
      @keyup.enter="emit('perfil', jugador.idUsuario)"
    >
      {{ jugador.nick }}
    </a>

    <!-- ms-auto: a la derecha también cuando no cabe y baja de línea -->
    <span v-if="jugador.listas.length === 0" class="text-caption text-medium-emphasis ms-auto">Sin lista</span>
    <div v-else class="d-flex flex-wrap justify-end ejercitos ms-auto">
      <!-- Varias listas del mismo ejército: el nombre una vez y un número por lista -->
      <div v-for="grupo in grupos" :key="grupo.ejercito" class="d-flex align-center ga-2">
        <v-progress-circular
          v-if="grupo.listas.some(l => l.idLista === cargandoLista)"
          indeterminate
          size="12"
          width="2"
        />
        <button
          v-if="grupo.listas.length === 1"
          type="button"
          class="ejercito text-body-2"
          :disabled="cargandoLista === grupo.listas[0].idLista"
          :aria-label="`Ver la lista de ${jugador.nick}: ${grupo.ejercito}`"
          @click="emit('ver', jugador, grupo.listas[0])"
        >
          {{ grupo.ejercito }}
        </button>
        <template v-else>
          <span class="text-body-2 text-medium-emphasis">{{ grupo.ejercito }}</span>
          <button
            v-for="(lista, n) in grupo.listas"
            :key="lista.idLista"
            type="button"
            class="ejercito numero text-body-2"
            :disabled="cargandoLista === lista.idLista"
            :aria-label="`Ver la lista ${n + 1} de ${jugador.nick}: ${grupo.ejercito}`"
            @click="emit('ver', jugador, lista)"
          >
            {{ n + 1 }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { JugadorListas, ListaDeJugador } from "@/interfaces/Lista";

const props = defineProps<{
  jugador: JugadorListas;
  // La lista que se está abriendo, para el spinner de su botón
  cargandoLista?: number | null;
}>();

const emit = defineEmits<{
  (event: "ver", jugador: JugadorListas, lista: ListaDeJugador): void;
  (event: "perfil", idUsuario: number): void;
}>();

// Sus listas agrupadas por ejército, en el orden en que las entregó
const grupos = computed(() => {
  const porEjercito = new Map<string, ListaDeJugador[]>();
  for (const lista of props.jugador.listas)
    porEjercito.set(lista.ejercito, [...(porEjercito.get(lista.ejercito) ?? []), lista]);
  return [...porEjercito.entries()].map(([ejercito, listas]) => ({ ejercito, listas }));
});

</script>

<style scoped>
.fila {
  column-gap: 12px;
  row-gap: 2px;
}

.ejercitos {
  column-gap: 16px;
  row-gap: 2px;
}

.sin-desbordar {
  min-width: 0;
  overflow-wrap: anywhere;
}

.ejercito {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  text-align: left;
  cursor: pointer;
}

.numero {
  min-width: 16px;
  text-decoration: underline;
}

.ejercito:hover,
.ejercito:focus-visible {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
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
</style>
