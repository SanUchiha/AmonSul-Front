<template>
  <v-card class="profile-section" style="position: relative">
    <v-btn
      v-if="!isEditing && editable"
      @click="toggleEditMode"
      color="primary"
      variant="tonal"
      style="position: absolute; top: 16px; right: 16px; z-index: 2"
    >
      Editar
    </v-btn>
    <v-btn
      v-if="isEditing"
      @click="toggleEditMode"
      color="error"
      variant="tonal"
      style="position: absolute; top: 16px; right: 16px; z-index: 2"
    >
      Cancelar
    </v-btn>
    <v-avatar size="120" class="avatar">
      <v-img :src="editableUser.imagen || defaultAvatar" alt="Avatar"></v-img>
    </v-avatar>
    <v-file-input
      v-if="isEditing"
      accept="image/*"
      label="Cambiar imagen"
      @change="handleImageUpload"
      variant="solo"
      dense
    ></v-file-input>

    <h2 class="player-name text-wrap">
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.nick"
        label="Nick"
      ></v-text-field>
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.nombreUsuario"
        label="Nombre"
        dense
      ></v-text-field>
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.primerApellido"
        label="Primer apellido"
      ></v-text-field>
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.segundoApellido"
        label="Segundo apellido"
      ></v-text-field>
      <p v-if="!isEditing">
        {{ editableUser.nombreUsuario }} {{ editableUser.primerApellido }}
        {{ editableUser.segundoApellido }}
      </p>
      <p v-if="isEditing">
        <v-combobox
          v-if="isEditing"
          v-model="editableFaccionName"
          :items="faccionesCombo"
          item-title="nombreFaccion"
          item-value="idFaccion"
          label="Selecciona una comunidad"
          @update:modelValue="logFaccionSelection"
        >
        </v-combobox>
      </p>
      <p v-if="isEditing">
        <v-text-field
          v-model="editableUser.nickLGDA"
          label="Nick LGDA"
        ></v-text-field>
      </p>
      <p v-if="isEditing">
        <v-text-field
          v-model="editableUser.ciudad"
          label="Ciudad"
        ></v-text-field>
      </p>
      <p v-if="isEditing">
        <v-text-field v-model="editableUser.email" label="Email"></v-text-field>
      </p>
      <p v-if="isEditing">
        <v-menu
          v-model="datePickerMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
        >
          <template v-slot:activator="{ props }">
            <v-text-field
              v-bind="props"
              v-model="formattedFechaNacimiento"
              label="Fecha de nacimiento"
              prepend-icon="mdi-calendar"
              readonly
              @click="datePickerMenu = true"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="dateObject"
            @update:modelValue="updateFechaNacimiento"
          ></v-date-picker>
        </v-menu>
      </p>
      <p v-if="isEditing">
        <v-text-field
          v-model="editableUser.telefono"
          label="Teléfono"
        ></v-text-field>
      </p>
      <p v-if="isEditing">
        <v-btn color="primary" variant="tonal" block @click="saveChanges"
          >Guardar</v-btn
        >
      </p>
    </h2>
    <h2 class="player-name text-wrap ringbearer" v-if="!isEditing">
      {{ editableUser.nick }}
    </h2>

    <v-divider v-if="!isEditing" class="mb-3"></v-divider>
    <v-card-text v-if="!isEditing" class="mt-0 text-left">
      <p class="profile-info">
        <strong>Comunidad:</strong> {{ editableFaccionName }}
      </p>

      <p class="profile-info">
        <strong>Nick LGDA: </strong>
        <a
          :href="
            'https://www.laguerradelanillo.com/tu-perfil/' +
            editableUser.nickLGDA
          "
          target="_blank"
          >{{ editableUser.nickLGDA }}</a
        >
      </p>

      <p class="profile-info">
        <strong>Ciudad:</strong> {{ editableUser.ciudad }}
      </p>

      <p class="profile-info">
        <strong>Email:</strong> {{ editableUser.email }}
      </p>

      <p class="profile-info">
        <strong>Fecha de nacimiento:</strong>
        {{ convertirFecha(editableUser.fechaNacimiento) }}
      </p>

      <p class="profile-info">
        <span v-if="editable"
          ><strong>Teléfono:</strong> {{ editableUser.telefono }}</span
        >
      </p>
    </v-card-text>
  </v-card>

  <v-card class="profile-section mt-4" v-if="editable">
    <v-btn variant="tonal" color="primary" @click="handlerCambiarPass">
      Cambiar Contraseña
    </v-btn>
  </v-card>

  <ModalCambiarPass
    v-if="showModalCambiarPass"
    @close="closeModalCambiarPass"
  />
</template>

<script setup lang="ts">
import {
  ref,
  defineProps,
  reactive,
  onMounted,
  computed,
  withDefaults,
} from "vue";
import { UsuarioViewDTO, EditarUsuarioDTO } from "@/interfaces/Usuario";
import { convertirFecha } from "@/utils/Fecha";
import { getFacciones } from "@/services/FaccionesService";
import { editarUsuario } from "@/services/UsuariosService";
import { FaccionDTO } from "@/interfaces/Faccion";
import defaultAvatar from "@/assets/icons/perfil.png";

import ModalCambiarPass from "./ModalCambiarPass.vue";
import { useToast } from "@/composables/useToast";

const props = withDefaults(
  defineProps<{
    user: UsuarioViewDTO;
    selectedFaccionName: number;
    editable?: boolean;
  }>(),
  {
    editable: false,
  }
);

const isEditing = ref(false);
const editableUser = reactive({ ...props.user });
const editableFaccionName = ref<string>("");
const faccionesCombo = ref<FaccionDTO[]>([]);
const faccionSelected = ref<number>();
const datePickerMenu = ref<boolean>(false);
const showModalCambiarPass = ref<boolean>(false);

const dateObject = ref<Date>(); // Aquí guardamos la fecha como objeto Date
const { triggerToast } = useToast();

// Convertir `dateObject` de vuelta a `YYYY-MM-DD` cuando el usuario seleccione una fecha
const updateFechaNacimiento = (date: Date) => {
  dateObject.value = date;
  // Formatear la fecha en local (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  editableUser.fechaNacimiento = `${year}-${month}-${day}`;
  datePickerMenu.value = false;
};

// Computed para mostrar siempre la fecha correctamente en el input (formato local)
const formattedFechaNacimiento = computed({
  get: () => {
    if (!dateObject.value) return "";
    const year = dateObject.value.getFullYear();
    const month = String(dateObject.value.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.value.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  },
  set: value => {
    if (value) {
      // value es YYYY-MM-DD
      const [year, month, day] = value.split("-").map(Number);
      dateObject.value = new Date(year, month - 1, day);
    }
  },
});

const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
};

const handlerCambiarPass = () => {
  showModalCambiarPass.value = true;
};

const closeModalCambiarPass = () => {
  showModalCambiarPass.value = false;
};

const logFaccionSelection = (value: FaccionDTO) => {
  // Buscar la facción seleccionada en el array de facciones
  const foundFaccion = faccionesCombo.value.find(
    f => f.idFaccion === value.idFaccion
  );

  if (foundFaccion) {
    editableFaccionName.value = foundFaccion.nombreFaccion; // ✅ Solo guarda el nombre
    faccionSelected.value = foundFaccion.idFaccion; // ✅ Guarda el ID
  }
};

const saveChanges = async () => {
  isEditing.value = false;

  let editusu: EditarUsuarioDTO = {
    idUsuario: props.user.idUsuario,
    nombreUsuario: editableUser.nombreUsuario,
    primerApellido: editableUser.primerApellido,
    segundoApellido: editableUser.segundoApellido,
    nuevoEmail: editableUser.email,
    idFaccion: faccionSelected.value,
    fechaNacimiento: editableUser.fechaNacimiento,
    telefono: editableUser.telefono,
    nickLGDA: editableUser.nickLGDA,
    ciudad: editableUser.ciudad,
    imagen: editableUser.imagen, // Se envía la imagen en base64
    nick: editableUser.nick,
  };

  try {
    await editarUsuario(editusu);
    triggerToast("success", "Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al editar usuario: ", error);
    triggerToast("error", "Error al actualizar el perfil");
  }
};

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    editableUser.imagen = reader.result as string;
  };
};

onMounted(async () => {
  try {
    const faccionesResponse = await getFacciones();
    faccionesCombo.value = faccionesResponse.data.map((f: FaccionDTO) => ({
      idFaccion: f.idFaccion,
      nombreFaccion: f.nombreFaccion,
    }));
    // Preseleccionar la facción del usuario
    if (props.selectedFaccionName) {
      const foundFaccion = faccionesCombo.value.find(
        f => f.idFaccion === props.selectedFaccionName
      );
      if (foundFaccion) {
        editableFaccionName.value = foundFaccion.nombreFaccion;
        faccionSelected.value = foundFaccion.idFaccion;
      }
    }
  } catch (error) {
    console.error("Error al obtener las facciones:", error);
  }

  if (editableUser.fechaNacimiento) {
    dateObject.value = new Date(editableUser.fechaNacimiento);
  }
});
</script>

<style scoped>
.profile-section {
  padding: 20px;
  text-align: center;
  background: #212121;
  color: white;
  border-radius: 0px 12px 12px 12px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
}
.avatar {
  margin-bottom: 10px;
  border: 3px solid #f5e1a4;
}
.player-name {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #f5e1a4;
}
.profile-info {
  font-size: 16px;
  color: #e0e0e0;
}
</style>
