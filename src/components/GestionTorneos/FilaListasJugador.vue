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
      <button
        v-for="lista in jugador.listas"
        :key="lista.idLista"
        type="button"
        class="ejercito d-flex align-center ga-2"
        :disabled="cargandoLista === lista.idLista"
        :aria-label="`Ver la lista de ${jugador.nick}: ${lista.ejercito}`"
        @click="emit('ver', jugador, lista)"
      >
        <v-progress-circular v-if="cargandoLista === lista.idLista" indeterminate size="12" width="2" />
        <span class="text-body-2">{{ lista.ejercito }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { JugadorListas, ListaDeJugador } from "@/interfaces/Lista";

defineProps<{
  jugador: JugadorListas;
  // La lista que se está abriendo, para el spinner de su botón
  cargandoLista?: number | null;
}>();

const emit = defineEmits<{
  (event: "ver", jugador: JugadorListas, lista: ListaDeJugador): void;
  (event: "perfil", idUsuario: number): void;
}>();

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
