<template>
  <div class="card" @click="toggleExpand">
    <div class="card-header">
      <h2 class="card-title">{{ equipo.nombreEquipo }}</h2>
      <p>Capitán: {{ equipo.nickCapitan }}</p>
      <p>Email: {{ equipo.emailCapitan }}</p>
      <p>Pago: {{ equipo.esPago }}</p>
      <p>
        Fecha de inscripción:
        {{ convertirFecha(equipo.fechaInscripcion!) }}
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
            <span class="chip chip-ejercito">
              {{ inscripcion.ejercito }}
            </span>
            <span class="chip chip-estado">
              {{ inscripcion.estadoLista }}
            </span>
            <span class="chip chip-fecha">
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineProps } from "vue";
import type { EquipoDTO } from "@/interfaces/Inscripcion";
import { convertirFecha } from "@/utils/Fecha";

const props = defineProps<{ equipo: EquipoDTO }>();

// Controla si la card está expandida o no
const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// Métodos para manejar acciones
const verLista = (listaData: string) => {
  console.log("Ver lista de: ", listaData);
  // Aquí puedes emitir un evento o abrir un modal con la información
};

const modificarLista = (idInscripcion: number) => {
  console.log("Modificar lista: ", idInscripcion);
  // Aquí puedes emitir un evento para modificar la lista
};

const cambiarEstadoLista = (idInscripcion: number) => {
  console.log("Modificar lista: ", idInscripcion);
  // Aquí puedes emitir un evento para modificar la lista
};
</script>

<style scoped>
.card {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  margin-bottom: 12px;
}

.card:hover {
  transform: scale(1.02);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.chips {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.chip {
  padding: 6px 12px;
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
  background: #f0ad4e;
  color: #8a6d3b;
}

.chip-fecha {
  background: #dff0d8;
  color: #3c763d;
}

.buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease-in-out;
}

.btn.ver {
  background: #5bc0de;
  color: white;
}

.btn.ver:hover {
  background: #31b0d5;
}

.btn.modificar {
  background: #f0ad4e;
  color: white;
}

.btn.modificar:hover {
  background: #ec971f;
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
