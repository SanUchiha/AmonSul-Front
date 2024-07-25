<template>
  <v-table :loading="isLoading">
    <thead>
      <tr>
        <th>Torneo</th>
        <th class="text-center">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="torneo in listaTorneos" :key="torneo.idInscripcion">
        <td>{{ torneo.nombreTorneo }}</td>
        <td class="text-center">
          <v-btn icon @click="verDetalleInscripcion(torneo.idInscripcion)">
            <v-icon color="primary">mdi-eye</v-icon>
          </v-btn>
          <v-btn icon @click="verLista(torneo.idInscripcion)">
            <v-icon color="primary">mdi-file-send</v-icon>
          </v-btn>
          <v-btn icon @click="eliminarInscripcion(torneo.idInscripcion)">
            <v-icon color="red">mdi-cancel</v-icon>
          </v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Eliminado con éxito."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido eliminar. Contacta con el administrador."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalSuccess
    :isVisible="showSuccessModalLista"
    message="Lista enviada con éxito."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalError
    :isVisible="showErrorModalLista"
    message="No se ha podido enviar la lista eliminar. Contacta con el administrador."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalLista
    :isVisible="showVerListaModal"
    :hasLista="hasLista"
    :listaText="listaText"
    :idInscripcion="currentInscripcionId ?? 0"
    @update:isVisible="showVerListaModal = $event"
    @enviarLista="handleEnviarLista"
    @modificarLista="handleModificarLista"
  />

  {{ showErrorModalLista }}
  {{ listaText }}
  {{ hasLista }}
  {{ showVerListaModal }}
  {{ showSuccessModalLista }}
  <!-- <v-dialog v-model="showVerListaModal" max-width="500">
    <v-card>
      <v-card-title class="headline">Lista</v-card-title>
      <v-card-text>
        <div v-if="!hasLista">
          <v-textarea
            v-model="listaText"
            label="Ingrese la lista"
            rows="10"
            clear-icon="mdi-close-circle"
            clearable
          ></v-textarea>
        </div>
        <div v-else>
          <v-textarea
            v-model="listaText"
            label="Tu lista"
            rows="10"
            clear-icon="mdi-close-circle"
            clearable
          ></v-textarea>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div v-if="!hasLista">
          <v-btn color="primary" @click="enviarLista">Enviar</v-btn>
        </div>
        <div v-else>
          <v-btn color="primary" @click="modificarLista">Modificar</v-btn>
        </div>
        <v-btn color="secondary" @click="showVerListaModal = false"
          >Cancelar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog> -->
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import { InscripcionUsuarioDTO } from "@/interfaces/Inscripcion";
import {
  CrearListaTorneoRequestDTO,
  ModificarListaTorneoRequestDTO,
} from "@/interfaces/Lista";
import router from "@/router";
import {
  cancelarInscripcion,
  getInscripcionesUser,
} from "@/services/InscripcionesService";
import {
  subirListaTorneo,
  modificarListaTorneo,
  getlista,
} from "@/services/ListasService";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import ModalLista from "./ModalLista.vue";

const props = defineProps<{
  isLoading: boolean;
  listaTorneos: InscripcionUsuarioDTO[];
}>();

const currentInscripcionId = ref<number | null>(null);
const currentTorneoId = ref<number | null>(null);
const listaText = ref<string>("");
const idLista = ref<number>();
const hasLista = ref<boolean>(false);
const listaTorneos = ref<InscripcionUsuarioDTO[]>([]);

const showSuccessModal = ref<boolean>(false);
const showErrorModal = ref<boolean>(false);
const showVerListaModal = ref<boolean>(false);
const showSuccessModalLista = ref<boolean>(false);
const showErrorModalLista = ref<boolean>(false);

const verDetalleInscripcion = (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  currentTorneoId.value =
    listaTorneos.value.find(
      (i) => i.idInscripcion == currentInscripcionId.value
    )?.idTorneo ?? null;
  router.push(`/detalle-torneo/${currentTorneoId.value}`);
};

const enviarLista = async () => {
  if (currentInscripcionId.value !== null) {
    const requestLista: CrearListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
    };

    try {
      await subirListaTorneo(requestLista);
      showSuccessModalLista.value = true;
    } catch {
      showErrorModalLista.value = true;
    }
    showSuccessModalLista.value = false;
    showVerListaModal.value = false;
  }
};

const modificarLista = async () => {
  if (currentInscripcionId.value !== null && idLista.value != null) {
    const requestLista: ModificarListaTorneoRequestDTO = {
      idInscripcion: currentInscripcionId.value,
      listaData: listaText.value,
      idLista: idLista.value,
    };

    try {
      await modificarListaTorneo(requestLista);
      showSuccessModalLista.value = true;
    } catch {
      showErrorModalLista.value = true;
    }
    showSuccessModalLista.value = false;
    showVerListaModal.value = false;
  }
};

const verLista = async (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;

  try {
    const response = await getlista(currentInscripcionId.value);
    hasLista.value = true;

    listaText.value = response.listaData;
    idLista.value = response.idLista;
  } catch {
    //
  }

  showVerListaModal.value = true;
};

const eliminarInscripcion = async (idInscripcion: number) => {
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessModal.value = true;
      listaTorneos.value = await getInscripcionesUser(
        listaTorneos.value[0].idUsuario.toString()
      );
    } else {
      showErrorModal.value = true;
    }
  } catch {
    showErrorModal.value = true;
  }
};

const handleEnviarLista = async (listaData: string) => {
  listaText.value = listaData;
  await enviarLista();
};

const handleModificarLista = async (listaData: string) => {
  listaText.value = listaData;
  await modificarLista();
};

onMounted(async () => {
  listaTorneos.value = props.listaTorneos;
});
</script>

<style scoped>
thead {
  background-color: #5b2269;
  color: white;
  text-align: center;
}

tbody tr {
  transition: background-color 0.3s;
}

tbody tr:hover {
  background-color: #3c4041;
}

.text-center {
  text-align: center;
}
</style>
