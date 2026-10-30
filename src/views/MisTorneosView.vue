<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px">
    <LoadingGandalf />
  </div>
  <v-container v-else class="mis-eventos text-left">
    <!-- Cabecera: qué hay aquí -->
    <h1 class="text-h5 font-weight-bold mb-1">Mis eventos</h1>
    <p class="text-body-2 text-medium-emphasis mb-3">
      Los eventos en los que estás inscrito. Tus partidas y resultados están en
      <router-link :to="`/detalle-jugador/${idUsuario}`">tu ficha de jugador</router-link>.
    </p>

    <v-chip-group v-model="vista" mandatory column selected-class="text-primary" class="mb-2">
      <v-chip value="proximos" filter>Próximos y en curso ({{ proximos.length }})</v-chip>
      <v-chip value="terminados" filter>Terminados ({{ terminados.length }})</v-chip>
    </v-chip-group>

    <v-card v-if="lista.length === 0" variant="outlined" class="pa-4 text-center">
      <p class="text-body-2 text-medium-emphasis mb-0">
        {{
          vista === "proximos"
            ? "No estás inscrito en ningún evento próximo."
            : "Aún no has terminado ningún evento."
        }}
      </p>
    </v-card>
    <v-row v-else dense>
      <v-col v-for="inscripcion in visibles" :key="inscripcion.clave" cols="12" sm="6" lg="4">
        <TarjetaInscripcion :inscripcion="inscripcion" @verInscripcion="abrirInscripcion" />
      </v-col>
    </v-row>
    <!-- Por tandas: los terminados pueden ser muchos -->
    <div v-if="lista.length > visibles.length" class="text-center mt-2">
      <v-btn variant="tonal" size="small" @click="cuantosVer += TANDA">
        Ver más ({{ lista.length - visibles.length }})
      </v-btn>
    </div>
  </v-container>

  <!-- Detalle de la inscripción: subir la lista, ver la del equipo o darse de baja -->
  <ModalInscripcion
    v-if="abierta && !abierta.porEquipos"
    :key="abierta.clave"
    :idInscripcion="abierta.idInscripcion"
    :idUsuario="idUsuario"
    :idTorneo="abierta.idTorneo"
    :idOrganizador="abierta.idOrganizador ?? 0"
    :ejercitoElegido="abierta.ejercitoElegido ?? null"
    @eliminar-inscripcion="pedirBaja(abierta)"
    @close="abierta = null"
  />
  <v-dialog
    v-if="abierta?.porEquipos"
    :model-value="true"
    max-width="800"
    @update:model-value="abierta = null"
  >
    <ModalInscripcionEquipo
      :key="abierta.clave"
      :idInscripcion="abierta.idInscripcion"
      :idUsuario="idUsuario"
      :idTorneo="abierta.idTorneo"
      :idOrganizador="abierta.idOrganizador"
      @eliminar-inscripcion-equipo="idEquipo => pedirBaja(abierta, idEquipo)"
      @close="abierta = null"
    />
  </v-dialog>

  <!-- Darse de baja no tiene vuelta atrás: mejor preguntarlo -->
  <v-dialog :model-value="!!baja" max-width="420" @update:model-value="baja = null">
    <v-card v-if="baja">
      <v-card-title class="text-wrap">¿Darte de baja?</v-card-title>
      <v-card-text>
        {{
          baja.idEquipo
            ? `Se dará de baja a tu equipo de ${baja.inscripcion.torneo.nombreTorneo}.`
            : `Dejarás de estar inscrito en ${baja.inscripcion.torneo.nombreTorneo}.`
        }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="baja = null">Volver</v-btn>
        <v-btn color="error" variant="flat" :loading="dandoDeBaja" @click="confirmarBaja">
          Darme de baja
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import {
  InscripcionUsuarioEquipoDTO,
  InscripcionUsuarioIndividualDTO,
} from "@/interfaces/Inscripcion";
import {
  cancelarInscripcion,
  eliminarEquipoAsync,
  getInscripcionesEquipoByUser,
  getInscripcionesIndividualByUser,
} from "@/services/InscripcionesService";
import {
  haTerminado,
  MiInscripcion,
  ordenProximos,
  ordenTerminados,
} from "@/utils/misEventos";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import TarjetaInscripcion from "@/components/Inscripcion/TarjetaInscripcion.vue";
import ModalInscripcion from "@/components/Inscripcion/ModalInscripcion.vue";
import ModalInscripcionEquipo from "@/components/Inscripcion/ModalInscripcionEquipo.vue";

const router = useRouter();
const { getidUsuario } = useAuth();
const { triggerToast } = useToast();
const idUsuario = Number(getidUsuario.value);

const TANDA = 10;
const isLoading = ref(true);
const inscripciones = ref<MiInscripcion[]>([]);
const vista = ref<"proximos" | "terminados">("proximos");
const cuantosVer = ref(TANDA);

const proximos = computed(() =>
  inscripciones.value.filter(i => !haTerminado(i)).sort(ordenProximos)
);
const terminados = computed(() =>
  inscripciones.value.filter(i => haTerminado(i)).sort(ordenTerminados)
);
const lista = computed(() => (vista.value === "proximos" ? proximos.value : terminados.value));
const visibles = computed(() => lista.value.slice(0, cuantosVer.value));
watch(vista, () => {
  cuantosVer.value = TANDA;
});

// Las individuales y las de equipo, con la misma forma para pintarlas igual
const desdeIndividual = (i: InscripcionUsuarioIndividualDTO): MiInscripcion => ({
  clave: `i${i.idInscripcion}`,
  idInscripcion: i.idInscripcion,
  idTorneo: i.idTorneo,
  idOrganizador: i.idOrganizador,
  porEquipos: false,
  torneo: i.torneo,
  estadoLista: i.estadoLista,
  esPago: i.esPago,
  ejercitoElegido: i.ejercitoElegido,
});
const desdeEquipo = (i: InscripcionUsuarioEquipoDTO): MiInscripcion => ({
  clave: `e${i.idInscripcion}`,
  idInscripcion: i.idInscripcion,
  idTorneo: i.idTorneo,
  idOrganizador: null,
  porEquipos: true,
  torneo: i.torneo,
});

const cargarInscripciones = async () => {
  try {
    const [individuales, equipos] = await Promise.all([
      getInscripcionesIndividualByUser(String(idUsuario)),
      getInscripcionesEquipoByUser(idUsuario),
    ]);
    inscripciones.value = [
      ...(individuales.data as InscripcionUsuarioIndividualDTO[]).map(desdeIndividual),
      ...(equipos.data as InscripcionUsuarioEquipoDTO[]).map(desdeEquipo),
    ].filter(i => i.torneo);
  } catch (error) {
    console.error(error);
    router.push({ name: "error" });
  }
};

const abierta = ref<MiInscripcion | null>(null);
const abrirInscripcion = (inscripcion: MiInscripcion) => {
  abierta.value = inscripcion;
};

const baja = ref<{ inscripcion: MiInscripcion; idEquipo?: number } | null>(null);
const dandoDeBaja = ref(false);
const pedirBaja = (inscripcion: MiInscripcion | null, idEquipo?: number) => {
  abierta.value = null;
  if (inscripcion) baja.value = { inscripcion, idEquipo };
};
const confirmarBaja = async () => {
  if (!baja.value) return;
  dandoDeBaja.value = true;
  try {
    if (baja.value.idEquipo) await eliminarEquipoAsync(baja.value.idEquipo);
    else await cancelarInscripcion(baja.value.inscripcion.idInscripcion);
    triggerToast("success", "Te has dado de baja");
    baja.value = null;
    await cargarInscripciones();
  } catch (error) {
    console.error(error);
    triggerToast("error", "No se ha podido dar de baja");
  } finally {
    dandoDeBaja.value = false;
  }
};

onMounted(async () => {
  if (idUsuario) await cargarInscripciones();
  isLoading.value = false;
});
</script>

<style scoped>
.mis-eventos {
  max-width: 1100px;
}
</style>
