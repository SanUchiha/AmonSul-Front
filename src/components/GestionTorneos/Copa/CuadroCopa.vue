<template>
  <div class="pa-2 text-left">
    <v-alert
      v-if="cuadro.campeon.idUsuario"
      type="success"
      variant="tonal"
      icon="mdi-trophy"
      class="mb-3"
    >
      Campeón: <strong>{{ cuadro.campeon.nick }}</strong>
    </v-alert>

    <!-- En móvil las rondas van una debajo de otra; con muchas, se puede ver solo una -->
    <v-chip-group
      v-if="secciones.length > 1"
      v-model="filtro"
      column
      mandatory
      selected-class="text-primary"
    >
      <v-chip value="todas" size="small" filter>Todas</v-chip>
      <v-chip
        v-for="seccion in secciones"
        :key="seccion.clave"
        :value="seccion.clave"
        size="small"
        filter
      >
        {{ seccion.nombre }}
      </v-chip>
    </v-chip-group>

    <div
      v-for="seccion in seccionesVisibles"
      :key="seccion.clave"
      class="mb-4"
    >
      <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ seccion.nombre }}</h3>
      <template v-for="cruce in seccion.cruces" :key="cruce.numero">
        <CardPartidaGestion
          v-if="cruce.partida"
          :partida="cruce.partida"
          :editable="editable"
          :etiqueta="seccion.cruces.length > 1 ? `Cruce ${cruce.numero}` : undefined"
          :pasa="ladoQuePasa(cruce)"
          @partidaActualizada="emit('partidaActualizada', $event)"
        >
          <template #chips>
            <v-chip v-if="cruce.pasa.idUsuario" size="x-small" color="success">
              {{ seccion.textoPasa }} {{ cruce.pasa.nick }}
            </v-chip>
            <v-chip v-else-if="empateSinDecidir(cruce)" size="x-small" color="warning">
              Empate: elige quién pasa
            </v-chip>
          </template>
          <!-- Empates que decide el organizador -->
          <div
            v-if="puedeElegir(cruce)"
            class="d-flex flex-wrap align-center ga-1 mt-2"
          >
            <span class="text-caption me-1">¿Quién pasa?</span>
            <v-btn
              v-for="lado in LADOS"
              :key="lado"
              size="small"
              :variant="ladoQuePasa(cruce) === lado ? 'flat' : 'outlined'"
              color="success"
              @click="elegir(cruce, lado)"
            >
              {{ lado === 1 ? cruce.partida.nick1 : cruce.partida.nick2 }}
            </v-btn>
          </div>
        </CardPartidaGestion>

        <!-- Sin partida: pasa sin jugar o aún falta saber quién llega -->
        <v-card
          v-else-if="!esVacio(cruce)"
          variant="outlined"
          class="mb-2 hueco"
        >
          <v-card-text class="pa-3">
            <div
              v-if="seccion.cruces.length > 1"
              class="text-caption text-medium-emphasis mb-1"
            >
              Cruce {{ cruce.numero }}
            </div>
            <div v-if="cruce.pasa.idUsuario" class="d-flex align-center ga-2">
              <span class="font-weight-bold">{{ cruce.pasa.nick }}</span>
              <v-chip size="x-small" color="success">Pasa sin jugar</v-chip>
            </div>
            <div v-else class="d-flex align-center ga-2">
              <span class="lado" :class="{ 'text-medium-emphasis': !cruce.a.nick }">
                {{ nombreLado(cruce.a) }}
              </span>
              <span class="text-medium-emphasis">vs</span>
              <span
                class="lado text-right"
                :class="{ 'text-medium-emphasis': !cruce.b.nick }"
              >
                {{ nombreLado(cruce.b) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </div>
  </div>

  <v-dialog v-model="isGuardando" persistent width="200">
    <v-card class="pa-6 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" size="60" />
    </v-card>
  </v-dialog>
  <ModalError
    v-if="showError"
    :isVisible="showError"
    :message="mensajeError"
    @update:isVisible="showError = $event"
  />
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { CruceCuadro, CuadroCopa, LadoCuadro } from "@/utils/cuadroCopa";
import { partidaJugada } from "@/utils/clasificacionLiga";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import { elegirQuienPasaAsync } from "@/services/CopaService";
import CardPartidaGestion from "@/components/GestionTorneos/CardPartidaGestion.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const props = defineProps<{
  idTorneo: number;
  cuadro: CuadroCopa;
  // El organizador mete resultados y, si la copa se lo deja a él, decide los empates
  editable: boolean;
  desempateOrganizador: boolean;
  cerrada: boolean;
}>();

const emit = defineEmits<{
  (e: "partidaActualizada", partida: PartidaTorneoDTO): void;
  // Ha cambiado quién pasa: hay que recargar el cuadro
  (e: "actualizado"): void;
}>();

// Las rondas y, al final, el tercer puesto
const secciones = computed(() => {
  const ultima = props.cuadro.rondas.length;
  const rondas = props.cuadro.rondas.map(r => ({
    clave: `ronda-${r.numero}`,
    nombre: r.nombre,
    textoPasa: r.numero === ultima ? "Campeón:" : "Pasa",
    cruces: r.cruces,
  }));
  return props.cuadro.tercerPuesto
    ? [
        ...rondas,
        {
          clave: "tercero",
          nombre: "Tercer puesto",
          textoPasa: "Tercero:",
          cruces: [props.cuadro.tercerPuesto],
        },
      ]
    : rondas;
});

const filtro = ref("todas");
const seccionesVisibles = computed(() =>
  filtro.value === "todas"
    ? secciones.value
    : secciones.value.filter(s => s.clave === filtro.value)
);

const nombreLado = (lado: LadoCuadro) =>
  lado.nick ?? (lado.pendiente ? "Por decidir" : "—");

// Los dos huecos vacíos: no hay nada que enseñar
const esVacio = (cruce: CruceCuadro) =>
  !cruce.a.idUsuario && !cruce.b.idUsuario && !cruce.a.pendiente && !cruce.b.pendiente;

function ladoQuePasa(cruce: CruceCuadro): 1 | 2 | null {
  const p = cruce.partida;
  if (!p || p.idUsuarioPasa == null) return null;
  return p.idUsuarioPasa === p.idUsuario1 ? 1 : p.idUsuarioPasa === p.idUsuario2 ? 2 : null;
}

const empateValidado = (cruce: CruceCuadro) =>
  !!cruce.partida &&
  partidaJugada(cruce.partida) &&
  cruce.partida.resultadoUsuario1 != null &&
  cruce.partida.resultadoUsuario1 === cruce.partida.resultadoUsuario2;

const empateSinDecidir = (cruce: CruceCuadro) =>
  empateValidado(cruce) && ladoQuePasa(cruce) === null;

const puedeElegir = (cruce: CruceCuadro) =>
  props.editable && props.desempateOrganizador && !props.cerrada && empateValidado(cruce);

const LADOS = [1, 2] as const;
const isGuardando = ref(false);
const showError = ref(false);
const mensajeError = ref("");

async function elegir(cruce: CruceCuadro, lado: 1 | 2) {
  const p = cruce.partida;
  if (!p || ladoQuePasa(cruce) === lado) return;
  isGuardando.value = true;
  try {
    await elegirQuienPasaAsync(
      props.idTorneo,
      p.idPartidaTorneo,
      lado === 1 ? p.idUsuario1 : p.idUsuario2
    );
    emit("actualizado");
  } catch (error) {
    mensajeError.value = mensajeDelBack(error, "No se ha podido elegir quién pasa.");
    showError.value = true;
  } finally {
    isGuardando.value = false;
  }
}
</script>

<style scoped>
.hueco {
  border-style: dashed;
}
.lado {
  flex: 1 1 0;
  min-width: 0;
}
</style>
