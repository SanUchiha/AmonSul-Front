<template>
  <div class="card-equipo" @click="toggleExpand">
    <v-card elevation="2" class="ma-2 pa-3">
      <v-row class="align-center">
        <!-- Avatar + Nombre del equipo + Estado de Pago -->
        <v-col cols="12" sm="4" class="d-flex align-center justify-start">
          <v-avatar size="40">
            <img src="@/assets/icons/equipos.png" alt="Equipo"  width="40" height="40"/>
          </v-avatar>
          <div class="ms-2">
            <div class="text-subtitle-1 font-weight-bold ringbearer">{{ equipo.nombreEquipo }}</div>
            <v-chip
              class="mt-1"
              :color="equipo.esPago === 'SI' ? 'green' : 'red'"
              variant="tonal"
              x-small
            >
              <v-icon size="16" class="me-1">mdi-cash</v-icon> 
              Pago: {{ equipo.esPago }}
            </v-chip>
          </div>
        </v-col>

        <!-- Datos del Capitán con iconos -->
        <v-col cols="12" sm="5" class="text-caption text-md-left text-center">
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1">mdi-account-star</v-icon>
            {{ equipo.nickCapitan }}
          </div>
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1">mdi-email</v-icon>
            <a :href="`mailto:${equipo.emailCapitan}`" class="text-decoration-none" target="_blank">
              {{ equipo.emailCapitan }}
            </a>
          </div>
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1">mdi-calendar</v-icon>
            {{ convertirFecha(equipo.fechaInscripcion!) }}
          </div>
        </v-col>

        <!-- Botones -->
        <v-col cols="12" sm="3" class="d-flex flex-column align-end justify-center mt-2 mt-sm-0">
          <v-btn
            v-show="equipo.esPago === 'NO'"
            variant="tonal"
            color="warning"
            size="small"
            class="mb-1"
            @click.stop="actualizarPago"
            block
          >
            <v-icon class="me-1">mdi-credit-card-edit</v-icon> 
            Modificar Pago
          </v-btn>
          <v-btn
            color="red"
            variant="tonal"
            size="small"
            @click.stop="eliminarEquipo"
            block
          >
            <v-icon class="me-1">mdi-trash-can</v-icon>
            Borrar equipo
          </v-btn>
        </v-col>
      </v-row>

      <!-- Expand contenido -->
      <v-expand-transition>
        <div v-if="isExpanded" class="mt-4">
          <v-divider class="mb-2" />
          <v-data-table :items="equipo.inscripciones" class="styled-table" dense>
            <template v-slot:headers>
              <tr>
                <th class="compact-header text-center">Nombre</th>
                <th class="hide-on-mobile compact-header text-center">Ejército</th>
                <th class="compact-header text-center">Lista</th>
                <th class="hide-on-mobile compact-header text-center">Entrega</th>
                <th class="compact-header text-center">Acciones</th>
              </tr>
            </template>
            <template v-slot:item="{ item }">
              <tr>
                <td class="compact-cell text-left">
                  <v-avatar size="40" class="hide-on-mobile">
                    <img src="@/assets/icons/verdetalle.png" alt="Participante" width="40" height="40"/>
                  </v-avatar>
                  &nbsp;{{ item.nick || "Desconocido" }}
                </td>
                <td class="hide-on-mobile compact-cell">{{ item.ejercito || "No asignado" }}</td>
                <td class="compact-cell">
                  <v-chip :color="item.estadoLista === 'OK' ? 'green' : item.estadoLista === 'ENTREGADA' ? 'yellow' : 'red'" variant="tonal">
                    {{ item.estadoLista }}
                  </v-chip>
                </td>
                <td class="hide-on-mobile compact-cell">{{ item.fechaEntregaLista || "N/A" }}</td>
                <td class="compact-cell">
                  <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" variant="tonal" v-bind="props">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-if="item.listaData" @click.stop="verLista(item.listaData!)">
                        <v-list-item-title>
                          <v-icon class="me-2">mdi-eye</v-icon> Ver Lista
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click.stop="cambiarEstadoLista(item.idInscripcion!)">
                        <v-list-item-title>
                          <v-icon class="me-2">mdi-refresh</v-icon> Cambiar Estado
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click.stop="modificarLista(item.idInscripcion)">
                        <v-list-item-title>
                          <v-icon class="me-2">mdi-pencil</v-icon> Modificar Lista
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </v-expand-transition>
    </v-card>
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
@media (max-width: 600px) {
  .hide-on-mobile {
    display: none;
  }
}
.styled-table {
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px; /* Reduce el tamaño de fuente general */
}

/* Reducir padding y espacio en las celdas */
.compact-header, .compact-cell, .compact-actions {
  padding: 4px !important;
  font-size: 12px;
}

/* Compactar botones */
.compact-actions .v-btn {
  min-width: 24px !important;
  padding: 2px 6px !important;
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
