<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="mb-3">
      <v-icon class="mr-2">mdi-magnify</v-icon>
      Consultar rating de un ejército
    </v-card-title>

    <v-form @submit.prevent="buscar">
      <v-row dense>
        <!-- Ejército -->
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="form.ejercito"
            label="Ejército *"
            :items="armyNames"
            prepend-inner-icon="mdi-shield"
            clearable
            :rules="[(v) => !!v || 'Campo obligatorio']"
          />
        </v-col>

        <!-- Bando rival -->
        <v-col cols="12" md="6">
          <v-select
            v-model="form.bandoRival"
            label="Bando rival"
            :items="bandosRivales"
            item-title="label"
            item-value="value"
            clearable
            prepend-inner-icon="mdi-sword"
            :disabled="form.ejercitosRivales.length > 0"
            hint="Se ignora si hay ejércitos rivales concretos"
            persistent-hint
          />
        </v-col>

        <!-- Fecha desde -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.fechaDesde"
            label="Fecha desde"
            type="date"
            prepend-inner-icon="mdi-calendar-start"
            clearable
          />
        </v-col>

        <!-- Fecha hasta -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.fechaHasta"
            label="Fecha hasta"
            type="date"
            prepend-inner-icon="mdi-calendar-end"
            clearable
          />
        </v-col>

        <!-- Puntos partida mín -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.puntosPartidaMin"
            label="Puntos mín."
            type="number"
            min="0"
            prepend-inner-icon="mdi-arrow-collapse-down"
            clearable
          />
        </v-col>

        <!-- Puntos partida máx -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.puntosPartidaMax"
            label="Puntos máx."
            type="number"
            min="0"
            prepend-inner-icon="mdi-arrow-collapse-up"
            clearable
          />
        </v-col>

        <!-- Ejércitos rivales (multi-input) -->
        <v-col cols="12" md="6">
          <v-autocomplete
            v-model="form.ejercitosRivales"
            label="Ejércitos rivales concretos"
            :items="armyNames"
            multiple
            chips
            closable-chips
            prepend-inner-icon="mdi-shield-half-full"
            hint="Selecciona uno o más ejércitos rivales"
            persistent-hint
            :disabled="!!form.bandoRival"
          />
        </v-col>

        <!-- Botón buscar -->
        <v-col cols="12" class="text-center mt-2">
          <v-btn
            type="submit"
            color="primary"
            :loading="isLoading"
            prepend-icon="mdi-magnify"
            :disabled="!form.ejercito"
          >
            Consultar
          </v-btn>
          <v-btn
            class="ml-2"
            variant="tonal"
            prepend-icon="mdi-refresh"
            @click="resetForm"
          >
            Limpiar
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- Resultado -->
    <v-divider class="my-4" v-if="resultado" />

    <div v-if="resultado" ref="resultadoRef">
      <v-row class="align-center mb-2">
        <v-col>
          <span class="text-h6 font-weight-bold">{{ resultado.ejercito }}</span>
          <v-chip
            :color="resultado.bando === 'good' ? 'blue-darken-2' : 'red-darken-4'"
            size="small"
            class="ml-2"
          >
            {{ resultado.bando === "good" ? "Bien" : "Oscuridad" }}
          </v-chip>
        </v-col>
        <v-col cols="auto" v-if="resultado.esFiltrado && resultado.descripcionFiltro">
          <v-chip size="small" color="orange-darken-2" prepend-icon="mdi-filter">
            {{ resultado.descripcionFiltro }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- Barra de resultado -->
      <div class="resultado-barra mb-3">
        <div
          class="victorias"
          :style="{ flex: resultado.victorias || 0 }"
          v-if="resultado.victorias > 0"
        >
          {{ resultado.victorias }}V
        </div>
        <div
          class="empates"
          :style="{ flex: resultado.empates || 0 }"
          v-if="resultado.empates > 0"
        >
          {{ resultado.empates }}E
        </div>
        <div
          class="derrotas"
          :style="{ flex: resultado.derrotas || 0 }"
          v-if="resultado.derrotas > 0"
        >
          {{ resultado.derrotas }}D
        </div>
      </div>

      <!-- Stats en chips/cards -->
      <v-row dense class="text-center">
        <v-col cols="6" md="3">
          <v-card variant="tonal" color="primary" class="pa-2">
            <div class="text-h5 font-weight-bold">{{ resultado.winRate.toFixed(1) }}%</div>
            <div class="text-caption">Win Rate</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="tonal" color="grey" class="pa-2">
            <div class="text-h5 font-weight-bold">{{ resultado.totalPartidas }}</div>
            <div class="text-caption">Total partidas</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="tonal" color="green-darken-2" class="pa-2">
            <div class="text-h5 font-weight-bold">{{ resultado.mediaPuntosFavor }}</div>
            <div class="text-caption">Media puntos a favor</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="tonal" color="red-darken-2" class="pa-2">
            <div class="text-h5 font-weight-bold">{{ resultado.mediaPuntosContra }}</div>
            <div class="text-caption">Media puntos en contra</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sin partidas -->
      <v-alert
        v-if="resultado.totalPartidas === 0"
        type="warning"
        class="mt-3"
      >
        No se encontraron partidas para este ejército con los filtros aplicados.
      </v-alert>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { getRatingEjercito } from "@/services/EstadisticasService";
import { appsettings } from "@/settings/appsettings";
import type {
  RatingEjercitoRequestDTO,
  RatingEjercitoResponseDTO,
} from "@/interfaces/Estadisticas";

const armyNames = appsettings.armies.map((a) => a.name).sort((a, b) => a.localeCompare(b));

const isLoading = ref(false);
const resultado = ref<RatingEjercitoResponseDTO | null>(null);
const resultadoRef = ref<HTMLElement | null>(null);

const bandosRivales = [
  { label: "Bien", value: "good" },
  { label: "Oscuridad", value: "evil" },
];

const form = ref<RatingEjercitoRequestDTO & { ejercitosRivales: string[] }>({
  ejercito: "",
  fechaDesde: null,
  fechaHasta: null,
  ejercitosRivales: [],
  bandoRival: null,
  puntosPartidaMin: null,
  puntosPartidaMax: null,
});

async function buscar() {
  if (!form.value.ejercito) return;
  isLoading.value = true;
  resultado.value = null;
  try {
    const request: RatingEjercitoRequestDTO = {
      ejercito: form.value.ejercito,
      fechaDesde: form.value.fechaDesde || null,
      fechaHasta: form.value.fechaHasta || null,
      ejercitosRivales:
        form.value.ejercitosRivales.length > 0
          ? form.value.ejercitosRivales
          : undefined,
      bandoRival:
        form.value.ejercitosRivales.length === 0
          ? form.value.bandoRival || null
          : null,
      puntosPartidaMin: form.value.puntosPartidaMin || null,
      puntosPartidaMax: form.value.puntosPartidaMax || null,
    };
    resultado.value = await getRatingEjercito(request);
    await nextTick();
    resultadoRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    console.error("Error al consultar rating", e);
  } finally {
    isLoading.value = false;
  }
}

function resetForm() {
  form.value = {
    ejercito: "",
    fechaDesde: null,
    fechaHasta: null,
    ejercitosRivales: [],
    bandoRival: null,
    puntosPartidaMin: null,
    puntosPartidaMax: null,
  };
  resultado.value = null;
}
</script>

<style scoped>
.resultado-barra {
  display: flex;
  height: 30px;
  border-radius: 6px;
  box-shadow: 0 0 2px #ccc;
  width: 100%;
}

.resultado-barra > div {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.victorias {
  border-radius: 6px 0 0 6px;
  background-color: #145c17;
}

.empates {
  background-color: #dbba00;
}

.derrotas {
  border-radius: 0 6px 6px 0;
  background-color: #751710;
}
</style>
