<template>
  <!-- Jugadores en tarjetas, como en la gestión de torneos -->
  <v-card class="mb-4">
    <div class="text-left px-3 pt-3">
      <div class="d-flex align-center flex-wrap ga-2 mb-2">
        <h3 class="text-subtitle-1 font-weight-bold flex-grow-1">Jugadores ({{ activos }})</h3>
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
      </div>
      <template v-if="inscripciones.length > 0">
        <v-text-field
          v-model="search"
          density="compact"
          label="Buscar jugador"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          class="mb-2"
        />
        <!-- A quién falta reclamarle algo, de un toque -->
        <v-chip-group v-model="filtro" mandatory column selected-class="text-primary" class="mb-1">
          <v-chip value="todos" size="small" filter>Todos ({{ inscripciones.length }})</v-chip>
          <v-chip value="faltanListas" size="small" filter>Faltan listas ({{ faltanListas.length }})</v-chip>
          <v-chip value="sinPagar" size="small" filter>No pagado ({{ sinPagar.length }})</v-chip>
        </v-chip-group>
      </template>
    </div>

    <v-card-text v-if="inscripciones.length === 0">Aún no hay jugadores inscritos.</v-card-text>
    <div v-else-if="visibles.length === 0" class="text-center text-medium-emphasis pa-4">
      Nadie con estos filtros
    </div>
    <v-row v-else dense class="px-2 pb-2">
      <v-col v-for="inscripcion in visibles" :key="inscripcion.idInscripcion" cols="12" sm="6" lg="4">
        <!-- Pulsando la tarjeta, el detalle para cambiar la lista o el pago -->
        <v-card
          v-ripple
          variant="outlined"
          class="pa-3 text-left tarjeta"
          role="button"
          tabindex="0"
          @click="verDetalle(inscripcion)"
          @keydown.enter="verDetalle(inscripcion)"
        >
          <div class="d-flex align-center ga-2">
            <span
              class="text-body-1 font-weight-bold flex-grow-1 nick"
              :class="{ 'text-disabled': esRetirado(inscripcion) }"
            >
              {{ inscripcion.nick }}
            </span>
            <v-chip v-if="esRetirado(inscripcion)" size="x-small" color="error" variant="tonal">
              Retirado
            </v-chip>
            <!-- Puntos extra: suman en la clasificación -->
            <PuntosExtra v-else :inscripcion="inscripcion" />
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  density="comfortable"
                  aria-label="Más acciones"
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
                  v-if="inscripcion.email"
                  prepend-icon="mdi-email-outline"
                  title="Escribir correo"
                  :href="`mailto:${inscripcion.email}`"
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
          </div>
          <!-- El correo como texto: pulsarlo abre el detalle como el resto de la tarjeta; en el detalle se le escribe -->
          <div v-if="inscripcion.email" class="text-caption text-medium-emphasis email">{{ inscripcion.email }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ inscripcion.ejercitoElegido ?? "Sin ejército elegido" }}
            <template v-if="numeroGrupos">
              · {{ inscripcion.grupo ? `Grupo ${inscripcion.grupo}` : "Sin grupo" }}
            </template>
          </div>
          <div class="d-flex align-center ga-2">
            <div class="text-body-2 flex-grow-1">
              <span :class="`text-${estadoLista(inscripcion.estadoLista).color}`">
                {{ estadoLista(inscripcion.estadoLista).texto }}
              </span>
              <span v-if="bandoLista(inscripcion.bando)" class="text-medium-emphasis text-no-wrap">
                · {{ bandoLista(inscripcion.bando)!.texto }}
              </span>
            </div>
            <InterruptorPago
              :esPago="inscripcion.esPago"
              :idInscripcion="inscripcion.idInscripcion"
              @cambiado="esPago => (inscripcion.esPago = esPago)"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>
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
import { bandoLista, estadoLista } from "@/utils/estadoLista";
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
import PuntosExtra from "@/components/GestionTorneos/PuntosExtra.vue";
import InterruptorPago from "@/components/GestionTorneos/InterruptorPago.vue";
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
// Buscador y filtros: a quien le falta la lista (sin entregar o ilegal, que hay que cambiar) y los que no han pagado,
// sin contar a los retirados
const search = ref<string | null>("");
const filtro = ref<"todos" | "faltanListas" | "sinPagar">("todos");
const enJuego = computed(() => inscripciones.value.filter(i => !esRetirado(i)));
const faltanListas = computed(() =>
  enJuego.value.filter(i => !["ENTREGADA", "OK"].includes((i.estadoLista ?? "").toUpperCase()))
);
const sinPagar = computed(() => enJuego.value.filter(i => i.esPago !== "SI"));
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const visibles = computed(() => {
  const base =
    filtro.value === "faltanListas"
      ? faltanListas.value
      : filtro.value === "sinPagar"
        ? sinPagar.value
        : inscripciones.value;
  const texto = normalizar(search.value ?? "").trim();
  return texto ? base.filter(i => normalizar(i.nick ?? "").includes(texto)) : base;
});

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

<style scoped>
.tarjeta {
  cursor: pointer;
}
.nick,
.email {
  overflow-wrap: anywhere;
}
</style>
