<template>
  <div v-if="!hasAcciones">
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
              <v-icon color="orange">mdi-eye</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
  <div v-if="hasAcciones">
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
              <v-icon color="orange">mdi-eye</v-icon>
            </v-btn>
            <!-- <v-btn icon @click="handleVerLista(torneo.idInscripcion)">
              <v-icon color="primary">mdi-file-send</v-icon>
            </v-btn> -->
            <!-- <v-btn icon @click="eliminarInscripcion(torneo.idInscripcion)">
              <v-icon color="red">mdi-cancel</v-icon>
            </v-btn> -->
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>

  <ModalSuccess
    :isVisible="showSuccessModal"
    message="Eliminado con éxito."
    @update:isVisible="showSuccessModal = $event"
  />

  <ModalError
    :isVisible="showErrorModal"
    message="No se ha podido eliminar. Contacta con el administrador."
    @update:isVisible="showErrorModal = $event"
  />

  <ModalSuccess
    :isVisible="showSuccessModalLista"
    message="Lista enviada con éxito."
    @update:isVisible="showSuccessModalLista = $event"
  />

  <ModalError
    :isVisible="showErrorModalLista"
    message="No se ha podido enviar la lista eliminar. Contacta con el administrador."
    @update:isVisible="showErrorModalLista = $event"
  />

  <ModalLista
    v-if="currentInscripcionId !== null"
    :isVisible="showVerListaModal"
    :hasLista="hasLista"
    :idInscripcion="currentInscripcionId"
    @update:isVisible="showVerListaModal = $event"
    @enviarLista="handleEnviarLista"
    @modificarLista="handleModificarLista"
  />

  <ModalInscripcion
    v-if="showModalInscripcion"
    :idInscripcion="currentInscripcionId"
    @close="closeModal"
  />
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
} from "@/services/ListasService";
import ModalSuccess from "../Commons/ModalSuccess.vue";
import ModalError from "../Commons/ModalError.vue";
import ModalLista from "./ModalLista.vue";
import { useAuth } from "@/composables/useAuth";
import ModalInscripcion from "./ModalInscripcion.vue";

const props = defineProps<{
  isLoading: boolean;
  listaTorneos: InscripcionUsuarioDTO[];
  idUsuario: number;
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

const showModalInscripcion = ref<boolean>(false);

const hasAcciones = ref<boolean>(false);
const { getidUsuario } = useAuth();
const idUsuarioLogger = ref<string | null>(getidUsuario.value);

const verDetalleInscripcion = (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  currentTorneoId.value =
    listaTorneos.value.find(
      (i) => i.idInscripcion == currentInscripcionId.value
    )?.idTorneo ?? null;

  showModalInscripcion.value = true;
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
    } finally {
      showVerListaModal.value = false;
    }
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
    } finally {
      showVerListaModal.value = false;
    }
  }
};

const handleVerLista = async (idInscripcion: number) => {
  currentInscripcionId.value = idInscripcion;
  await verLista();
};

const verLista = async () => {
  showVerListaModal.value = true;
};

const eliminarInscripcion = async (idInscripcion: number) => {
  try {
    const response = await cancelarInscripcion(idInscripcion);

    if (response.request?.status === 200) {
      showSuccessModal.value = true;
      const responseInscriptionesUser = await getInscripcionesUser(
        listaTorneos.value[0].idUsuario.toString()
      );
      listaTorneos.value = responseInscriptionesUser.data;
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
  if (idUsuarioLogger.value != null) {
    if (props.idUsuario === parseInt(idUsuarioLogger.value)) {
      hasAcciones.value = true;
    }
  }
});

// Cierra el modal
const closeModal = () => {
  showModalInscripcion.value = false;
};
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
