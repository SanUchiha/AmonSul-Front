<template>
    <v-dialog v-model="show" max-width="800px">
      <v-card>
        <v-card-title class="modal-title">
          <h3>{{ props.nick }}</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="close" class="close-button">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
  
        <v-card-text>
          <v-list dense>
            <!-- Estado Lista -->
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="list-item-title">
                  LISTA
                </v-list-item-title>
                <v-select
                  v-model="estadoListaLocal"
                  :items="estadoListaOptions"
                  label="Estado"
                  dense
                  hide-details
                  @change="
                    logChange('estadoLista', estadoListaLocal!)
                  "
                ></v-select>
              </v-list-item-content>
            </v-list-item>            
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- Modal response estado lista -->
    <ModalSuccess
      :isVisible="showSuccessModalLista"
      message="Estado de la lista actualizado."
      @update:isVisible="showSuccessModalLista = $event"
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
  import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";
  import {
    updateEstadoLista,
  } from "@/services/InscripcionesService";
  import { defineProps, ref, watch, defineEmits } from "vue";
  import ModalSuccess from "@/components/Commons/ModalSuccess.vue";
  import ModalError from "@/components/Commons/ModalError.vue";
  
  // Definir las propiedades y eventos
  const props = defineProps<{
    idInscripcion: number;
    estadoLista: string;
    nick: string
  }>();
  
  const estadoListaLocal = ref(props.estadoLista);

  // ModalDetalleInscripcion.vue
  const emit = defineEmits<{
    (e: "close"): void;
    (
      e: "update-inscripcion",
      payload: { field: keyof InscripcionTorneoCreadoDTO; value: unknown }
    ): void;
  }>();
  
  const show = ref<boolean>(true);
  const isLoading = ref<boolean>(false);
  
  const estadoListaOptions = [
    "NO ENTREGADA",
    "ENTREGADA",
    "ILEGAL",
    "OK",
  ] as const;
  
  const showSuccessModalLista = ref<boolean>(false);
  const showSuccessModalSubirLista = ref<boolean>(false);
  const showErrorModal = ref<boolean>(false);
  
  // Registrar el cambio y actualizar en la base de datos
  const logChange = async (
    field: "estadoLista",
    value: string
  ) => {
    isLoading.value = true;
    try {
      //lista
      if (field === "estadoLista") {
        let estado: string;
        if (value == "NO ENTREGADA") estado = "NO ENTREGADA";
        else if (value == "ENTREGADA") estado = "ENTREGADA";
        else if (value == "ILEGAL") estado = "ILEGAL";
        else estado = "OK";
        await updateEstadoLista({
          idInscripcion: props.idInscripcion,
          estadoLista: estado,
        });
        showSuccessModalLista.value = true;
        isLoading.value = false;
        emit("update-inscripcion", { field, value: estado });
  
        
      } 
    } catch (error) {
      console.error(`Error actualizando ${field}:`, error);
      showErrorModal.value = true;
      isLoading.value = false;
    } finally {
      isLoading.value = false;
    }
  };
  
  watch(
    () => estadoListaLocal.value,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        logChange("estadoLista", newValue!);
      }
    }
  );
  
  const close = () => {
    show.value = false;
    emit("close");
  };
    
  </script>
  
  <style scoped>
  .modal-title {
    display: flex;
    align-items: center;
    align-items: center;
    font-size: 20px;
  }
  
  .modal-title h3 {
    margin: 0; /* Elimina márgenes para un mejor centrado */
  }
  
  .list-item-title {
    display: flex;
    align-items: center;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .close-button {
    margin-left: auto;
  }
  
  .v-list-item {
    margin-bottom: 16px;
  }
  
  .lotr-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    width: 100%;
  }
  </style>
  