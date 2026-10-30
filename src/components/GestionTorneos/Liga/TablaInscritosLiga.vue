<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center flex-wrap ga-2">
      <span>Jugadores ({{ activos }})</span>
      <v-spacer />
      <v-btn
        v-if="!ligaGenerada"
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="mdi-account-plus"
        @click="showAddJugador = true"
      >
        Añadir jugador
      </v-btn>
    </v-card-title>

    <v-list v-if="inscripciones.length > 0" lines="three">
      <v-list-item
        v-for="inscripcion in inscripciones"
        :key="inscripcion.idInscripcion"
        class="text-left"
        @click="verDetalle(inscripcion)"
      >
        <v-list-item-title
          class="text-wrap"
          :class="{ 'text-disabled': esRetirado(inscripcion) }"
        >
          {{ inscripcion.nick }}
        </v-list-item-title>
        <v-list-item-subtitle class="text-wrap">
          {{ inscripcion.ejercitoElegido ?? "Sin ejército elegido" }}
        </v-list-item-subtitle>
        <div class="d-flex flex-wrap ga-1 mt-1">
          <v-chip v-if="numeroGrupos" size="x-small" color="primary" variant="tonal">
            {{ inscripcion.grupo ? `Grupo ${inscripcion.grupo}` : "Sin grupo" }}
          </v-chip>
          <v-chip v-if="esRetirado(inscripcion)" size="x-small" color="error">
            Retirado
          </v-chip>
          <v-chip size="x-small" :color="colorLista(inscripcion.estadoLista)">
            Lista: {{ inscripcion.estadoLista ?? "NO ENTREGADA" }}
          </v-chip>
          <v-chip
            size="x-small"
            :color="inscripcion.esPago === 'SI' ? 'success' : 'warning'"
          >
            Pago: {{ inscripcion.esPago ?? "NO" }}
          </v-chip>
        </div>

        <template #append>
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="menuProps"
                @click.stop
              />
            </template>
            <v-list density="compact">
              <v-list-item
                prepend-icon="mdi-eye"
                title="Ver inscripción"
                @click="verDetalle(inscripcion)"
              />
              <v-list-item
                v-if="!ligaGenerada"
                prepend-icon="mdi-shield-edit"
                title="Cambiar ejército"
                @click="pedirEjercito(inscripcion)"
              />
              <!-- Copa: mover de grupo mientras no haya jornadas -->
              <template v-if="numeroGrupos && !ligaGenerada && !esRetirado(inscripcion)">
                <v-list-item
                  v-for="g in gruposPara(inscripcion)"
                  :key="g"
                  prepend-icon="mdi-account-switch"
                  :title="`Al grupo ${g}`"
                  @click="moverAGrupo(inscripcion, g)"
                />
              </template>
              <v-list-item
                v-if="ligaGenerada && !ligaCerrada && !esRetirado(inscripcion)"
                prepend-icon="mdi-account-remove"
                base-color="error"
                :title="`Retirar ${textos.del}`"
                @click="pedirRetirar(inscripcion)"
              />
            </v-list>
          </v-menu>
        </template>
      </v-list-item>
    </v-list>
    <v-card-text v-else>Aún no hay jugadores inscritos.</v-card-text>
  </v-card>

  <ModalAddJugadorTorneo
    v-if="showAddJugador"
    :isVisible="showAddJugador"
    :torneo="torneo"
    @close="showAddJugador = false"
    @confirm="emit('actualizado')"
  />

  <ModalDetalleInscripcion
    v-if="inscripcionDetalle"
    :inscripcion="inscripcionDetalle"
    @close="inscripcionDetalle = null"
    @update-inscripcion="actualizarCampo"
    @eliminar-inscripcion="emit('actualizado')"
  />

  <ModalElegirEjercito
    :isVisible="showEjercito"
    :titulo="`Ejército en ${textos.el}`"
    :texto="`El jugador lleva este ejército en todas sus partidas ${textos.del}. Se puede cambiar hasta que se generen las jornadas.`"
    :ejercitoActual="inscripcionEjercito?.ejercitoElegido"
    @update:isVisible="showEjercito = $event"
    @confirm="cambiarEjercito"
  />

  <!-- Retirar: en la liga y en los grupos se borran todas sus partidas; en la eliminatoria pasa su rival -->
  <v-dialog v-model="showRetirar" max-width="420">
    <v-card>
      <v-card-title class="text-wrap">
        ¿Retirar a {{ inscripcionRetirar?.nick }} {{ textos.del }}?
      </v-card-title>
      <v-card-text v-if="enEliminatoria">
        En su cruce pendiente pasa el rival. Lo que ya ha jugado sigue
        contando. Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-text v-else>
        Se borran todas sus partidas, también las ya jugadas, y no cuentan ni
        en la clasificación ni en el ELO. Esta acción no se puede deshacer.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="showRetirar = false">
          Cancelar
        </v-btn>
        <v-btn color="error" variant="tonal" @click="retirar">Retirar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isGuardando" persistent width="200">
    <v-card class="pa-6 d-flex justify-center">
      <v-progress-circular indeterminate color="primary" size="60" />
    </v-card>
  </v-dialog>

  <ModalSuccess
    :isVisible="showSuccess"
    :message="mensaje"
    @update:isVisible="showSuccess = $event"
  />
  <ModalError
    :isVisible="showError"
    :message="mensaje"
    @update:isVisible="showError = $event"
  />
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import {
  InscripcionTorneoCreadoDTO,
  TorneoGestionInfoDTO,
} from "@/interfaces/Torneo";
import { cambiarEjercitoElegidoAsync } from "@/services/InscripcionesService";
import { retirarJugadorLigaAsync } from "@/services/LigaService";
import {
  cambiarGrupoAsync,
  retirarJugadorCopaAsync,
} from "@/services/CopaService";
import { FORMATO_COPA, textosEvento } from "@/Constant/FormatoTorneo";
import { mensajeDelBack } from "@/utils/mensajeDelBack";
import ModalAddJugadorTorneo from "@/components/GestionTorneos/ModalAddJugadorTorneo.vue";
import ModalDetalleInscripcion from "@/components/GestionTorneos/ModalDetalleInscripcion.vue";
import ModalElegirEjercito from "@/components/Inscripcion/ModalElegirEjercito.vue";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const RETIRADO = "RETIRADO";

const props = defineProps<{
  torneo: TorneoGestionInfoDTO;
  ligaGenerada: boolean;
  ligaCerrada: boolean;
  // Solo en Copa: con grupos se ve el de cada uno y se puede mover hasta generar las jornadas
  numeroGrupos?: number | null;
  enEliminatoria?: boolean;
}>();

const esCopa = computed(() => props.torneo.torneo.formatoTorneo === FORMATO_COPA);
const textos = computed(() => textosEvento(props.torneo.torneo.formatoTorneo));

const emit = defineEmits<{ (e: "actualizado"): void }>();

// Los retirados al final; en la copa, por grupos y los que aún no tienen grupo después
const inscripciones = computed(() =>
  [...props.torneo.inscripciones].sort(
    (a, b) =>
      Number(esRetirado(a)) - Number(esRetirado(b)) ||
      (props.numeroGrupos ? (a.grupo ?? 999) - (b.grupo ?? 999) : 0) ||
      (a.nick ?? "").localeCompare(b.nick ?? "")
  )
);

function gruposPara(inscripcion: InscripcionTorneoCreadoDTO) {
  return Array.from({ length: props.numeroGrupos ?? 0 }, (_, i) => i + 1).filter(
    g => g !== inscripcion.grupo
  );
}

async function moverAGrupo(inscripcion: InscripcionTorneoCreadoDTO, grupo: number) {
  isGuardando.value = true;
  try {
    await cambiarGrupoAsync(props.torneo.torneo.idTorneo, inscripcion.idInscripcion, grupo);
    inscripcion.grupo = grupo;
  } catch (error) {
    mensaje.value = mensajeDelBack(error, "No se ha podido cambiar de grupo.");
    showError.value = true;
  } finally {
    isGuardando.value = false;
  }
}
const activos = computed(
  () => props.torneo.inscripciones.filter(i => !esRetirado(i)).length
);

const showAddJugador = ref(false);
const inscripcionDetalle = ref<InscripcionTorneoCreadoDTO | null>(null);
const showEjercito = ref(false);
const inscripcionEjercito = ref<InscripcionTorneoCreadoDTO | null>(null);
const showRetirar = ref(false);
const inscripcionRetirar = ref<InscripcionTorneoCreadoDTO | null>(null);
const isGuardando = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const mensaje = ref("");

function esRetirado(inscripcion: InscripcionTorneoCreadoDTO) {
  return inscripcion.estadoInscripcion === RETIRADO;
}

function colorLista(estado?: string | null) {
  if (estado === "OK") return "success";
  if (estado === "ENTREGADA") return "info";
  return "warning";
}

function verDetalle(inscripcion: InscripcionTorneoCreadoDTO) {
  inscripcionDetalle.value = inscripcion;
}

function actualizarCampo(payload: {
  field: keyof InscripcionTorneoCreadoDTO;
  value: unknown;
}) {
  if (inscripcionDetalle.value)
    Object.assign(inscripcionDetalle.value, { [payload.field]: payload.value });
}

function pedirEjercito(inscripcion: InscripcionTorneoCreadoDTO) {
  inscripcionEjercito.value = inscripcion;
  showEjercito.value = true;
}

async function cambiarEjercito(ejercito: string) {
  if (!inscripcionEjercito.value) return;
  isGuardando.value = true;
  try {
    await cambiarEjercitoElegidoAsync(
      inscripcionEjercito.value.idInscripcion,
      ejercito
    );
    inscripcionEjercito.value.ejercitoElegido = ejercito;
    mensaje.value = "Ejército cambiado.";
    showSuccess.value = true;
  } catch (error) {
    mensaje.value = mensajeDelBack(error, "No se ha podido cambiar el ejército.");
    showError.value = true;
  } finally {
    isGuardando.value = false;
  }
}

function pedirRetirar(inscripcion: InscripcionTorneoCreadoDTO) {
  inscripcionRetirar.value = inscripcion;
  showRetirar.value = true;
}

async function retirar() {
  showRetirar.value = false;
  if (!inscripcionRetirar.value) return;
  isGuardando.value = true;
  try {
    const retirar = esCopa.value ? retirarJugadorCopaAsync : retirarJugadorLigaAsync;
    await retirar(props.torneo.torneo.idTorneo, inscripcionRetirar.value.idInscripcion);
    mensaje.value = `${inscripcionRetirar.value.nick} se ha retirado ${textos.value.del}.`;
    showSuccess.value = true;
    emit("actualizado");
  } catch (error) {
    mensaje.value = mensajeDelBack(error, "No se ha podido retirar al jugador.");
    showError.value = true;
  } finally {
    isGuardando.value = false;
  }
}
</script>
