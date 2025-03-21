<template>
  <div class="card" @click="toggleExpand">
    <div class="card-header">
      <h2 class="card-title">{{ equipo.nombreEquipo }}</h2>
      <p>Capitán: {{ equipo.nickCapitan }}</p>
      <p>Email: {{ equipo.emailCapitan }}</p>
      <p>Pago: {{ equipo.esPago }}</p>
      <v-btn
        v-show="equipo.esPago == 'NO'"
        variant="tonal"
        class="btn actualizar"
        @click.stop="actualizarPago"
      >
        ACTUALIZAR PAGO
      </v-btn>
      <p></p>
      <p>
        Fecha de inscripción:
        {{ convertirFecha(equipo.fechaInscripcion!) }}
      </p>
      <p>
        <v-btn color="red darken" variant="tonal" @click="eliminarEquipo"
          >eliminar equipo</v-btn
        >
      </p>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="inscripciones-container">
        <div
          v-for="inscripcion in equipo.inscripciones"
          :key="inscripcion.idInscripcion"
          class="inscripcion-card"
        >
          <div class="chips">
            <span class="chip chip-estado">{{ inscripcion.nick }}</span>
            <span v-show="inscripcion.listaData" class="chip chip-ejercito">
              {{ inscripcion.ejercito }}
            </span>
            <span class="chip chip-estado"
              >Lista: {{ inscripcion.estadoLista }}</span
            >
            <span v-show="inscripcion.listaData" class="chip chip-fecha">
              {{ inscripcion.fechaEntregaLista }}
            </span>
          </div>

          <div class="buttons">
            <button
              v-show="inscripcion.listaData"
              class="btn ver"
              @click.stop="verLista(inscripcion.listaData!)"
            >
              Ver Lista
            </button>
            <button
              v-show="inscripcion.listaData"
              class="btn ver"
              @click.stop="cambiarEstadoLista(inscripcion.idInscripcion!)"
            >
              Cambiar estado lista
            </button>
            <button
              class="btn modificar"
              @click.stop="modificarLista(inscripcion.idInscripcion)"
            >
              Enviar/modificar Lista
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- Modal response estado pago -->
  <ModalSuccess
    :isVisible="showSuccessModalPago"
    message="Estado del pago actualizado."
    @update:isVisible="showSuccessModalPago = $event"
  />

  <!-- Modal response estado pago -->
  <ModalSuccess
    :isVisible="showSuccessModalEliminarEquipo"
    message="Equipo eliminado."
    @update:isVisible="showSuccessModalPago = $event"
  />

  <!-- Modal response si error -->
  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido actualizar la inscripción. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <!-- Modal de Carga -->
  <v-dialog v-model="isLoading" hide-overlay persistent>
    <v-card class="progress-card">
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
      ></v-progress-circular>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineProps } from "vue";
import type { EquipoDTO } from "@/interfaces/Inscripcion";
import { convertirFecha } from "@/utils/Fecha";
import {
  eliminarEquipoAsync,
  updateEstadoPagoEquipo,
} from "@/services/InscripcionesService";
import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
import ModalError from "@/components/Commons/ModalError.vue";

const props = defineProps<{ equipo: EquipoDTO }>();

const isExpanded = ref(false);
const isLoading = ref<boolean>(false);
const showSuccessModalPago = ref<boolean>(false);
const showSuccessModalEliminarEquipo = ref<boolean>(false);

const showErrorModal = ref<boolean>(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const verLista = (listaData: string) => {
  console.log("Ver lista de: ", listaData);
};

const modificarLista = (idInscripcion: number) => {
  console.log("Modificar lista: ", idInscripcion);
};

const cambiarEstadoLista = (idInscripcion: number) => {
  console.log("Modificar lista: ", idInscripcion);
};

const actualizarPago = async () => {
  isLoading.value = true;
  try {
    await updateEstadoPagoEquipo({
      idEquipo: props.equipo.idEquipo,
      esPago: "SI",
    });
    showSuccessModalPago.value = true;
    isLoading.value = false;
  } catch (error) {
    showErrorModal.value = true;
    isLoading.value = false;
  } finally {
    isLoading.value = false;
  }
};

const eliminarEquipo = async () => {
  isLoading.value = true;
  try {
    await eliminarEquipoAsync(props.equipo.idEquipo);
    showSuccessModalEliminarEquipo.value = true;
    isLoading.value = false;
  } catch (error) {
    showErrorModal.value = true;
    isLoading.value = false;
  } finally {
    isLoading.value = false;
    window.location.reload();
  }
};
</script>

<style scoped>
.card {
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  margin-bottom: 12px;
  background: rgb(44, 44, 44);
}

.card:hover {
  transform: scale(1.02);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn.actualizar {
  background: #5cb85c;
  color: white;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.inscripciones-container {
  margin-top: 10px;
}

.inscripcion-card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.chip {
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
}

.chip-ejercito {
  background: #d9edf7;
  color: #31708f;
}

.chip-estado {
  background: #9e6d28;
  color: black;
}

.chip-fecha {
  background: #9e6d28;
  color: #3c763d;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease-in-out;
  width: 100%;
}

.btn.ver {
  background: #5bc0de;
  color: black;
}

.btn.ver:hover {
  background: #31b0d5;
}

.btn.modificar {
  background: #f0ad4e;
  color: black;
}

.btn.modificar:hover {
  background: #ec971f;
  color: black;
}

@media (min-width: 600px) {
  .inscripcion-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .buttons {
    flex-direction: row;
  }
  .btn {
    width: auto;
  }
}

/* Animación de expansión */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
