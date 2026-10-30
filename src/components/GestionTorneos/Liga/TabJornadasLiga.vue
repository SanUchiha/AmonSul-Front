<template>
  <div class="pa-2 text-left">
    <!-- Filtros: los chips se envuelven en móvil -->
    <!-- Copa: por grupo -->
    <v-chip-group
      v-if="numeroGrupos"
      v-model="grupoFiltro"
      column
      mandatory
      selected-class="text-primary"
    >
      <v-chip :value="0" size="small" filter>Todos los grupos</v-chip>
      <v-chip v-for="g in numeroGrupos" :key="g" :value="g" size="small" filter>
        Grupo {{ g }}
      </v-chip>
    </v-chip-group>
    <!-- 0 son todas: con null el chip no se ve marcado -->
    <v-chip-group
      v-model="jornada"
      column
      mandatory
      selected-class="text-primary"
    >
      <v-chip :value="0" size="small" filter>Todas</v-chip>
      <v-chip v-for="n in jornadas" :key="n" :value="n" size="small" filter>
        J{{ n }}
      </v-chip>
    </v-chip-group>
    <v-chip-group
      v-model="estado"
      column
      mandatory
      selected-class="text-primary"
    >
      <v-chip value="todas" size="small" filter>Todas</v-chip>
      <v-chip value="pendientes" size="small" filter>
        Pendientes ({{ pendientes }})
      </v-chip>
      <v-chip value="jugadas" size="small" filter>
        Jugadas ({{ partidas.length - pendientes }})
      </v-chip>
    </v-chip-group>
    <v-autocomplete
      v-model="jugador"
      :items="jugadores"
      item-title="nick"
      item-value="idUsuario"
      label="Partidas de un jugador"
      density="compact"
      clearable
      hide-details
      class="mb-3"
    />

    <div
      v-if="porJornadas.length === 0"
      class="text-center text-medium-emphasis my-6"
    >
      No hay partidas con estos filtros.
    </div>

    <div v-for="bloque in porJornadas" :key="bloque.jornada" class="mb-4">
      <h3 class="text-subtitle-1 font-weight-bold mb-2">
        Jornada {{ bloque.jornada }}
      </h3>
      <CardPartidaGestion
        v-for="partida in bloque.partidas"
        :key="partida.idPartidaTorneo"
        :partida="partida"
        :editable="editable"
        :etiqueta="numeroGrupos ? `Grupo ${partida.grupo}` : undefined"
        @partidaActualizada="emit('partidaActualizada', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { partidaJugada } from "@/utils/clasificacionLiga";
import CardPartidaGestion from "@/components/GestionTorneos/CardPartidaGestion.vue";

const props = defineProps<{
  partidas: PartidaTorneoDTO[];
  jornadas: number;
  // El organizador puede meter o cambiar cualquier resultado en cualquier momento
  editable: boolean;
  // Solo en Copa: las partidas llevan su grupo y se pueden filtrar por él
  numeroGrupos?: number | null;
}>();

const emit = defineEmits<{
  (e: "partidaActualizada", partida: PartidaTorneoDTO): void;
}>();

const jornada = ref(0);
const estado = ref<"todas" | "pendientes" | "jugadas">("todas");
const jugador = ref<number | null>(null);
const grupoFiltro = ref(0);

const pendientes = computed(
  () => props.partidas.filter(p => !partidaJugada(p)).length
);

const jugadores = computed(() => {
  const porId = new Map<number, string>();
  props.partidas.forEach(p => {
    porId.set(p.idUsuario1, p.nick1);
    porId.set(p.idUsuario2, p.nick2);
  });
  return [...porId.entries()]
    .map(([idUsuario, nick]) => ({ idUsuario, nick }))
    .sort((a, b) => a.nick.localeCompare(b.nick));
});

const porJornadas = computed(() => {
  const filtradas = props.partidas.filter(
    p =>
      (grupoFiltro.value === 0 || p.grupo === grupoFiltro.value) &&
      (jornada.value === 0 || p.numeroRonda === jornada.value) &&
      (estado.value === "todas" ||
        (estado.value === "jugadas") === partidaJugada(p)) &&
      (jugador.value === null ||
        p.idUsuario1 === jugador.value ||
        p.idUsuario2 === jugador.value)
  );
  const porJornada = new Map<number, PartidaTorneoDTO[]>();
  filtradas.forEach(p => {
    porJornada.set(p.numeroRonda, [
      ...(porJornada.get(p.numeroRonda) ?? []),
      p,
    ]);
  });
  return [...porJornada.entries()]
    .sort(([a], [b]) => a - b)
    .map(([numero, partidas]) => ({ jornada: numero, partidas }));
});

</script>
