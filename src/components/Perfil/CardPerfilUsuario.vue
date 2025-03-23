<template>
  <v-card class="profile-section">
    <v-avatar size="120" class="avatar">
      <v-img :src="editableUser.imagen || defaultAvatar" alt="Avatar"></v-img>
    </v-avatar>
    <v-file-input
      v-if="isEditing"
      accept="image/*"
      label="Subir nueva imagen"
      @change="handleImageUpload"
      variant="solo"
      dense
    ></v-file-input>

    <h2 class="player-name text-wrap">
      <v-btn v-if="isEditing" @click="toggleEditMode" variant="text"
        >Cancelar</v-btn
      >
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.nick"
        label="Nick"
        dense
        variant="solo"
      ></v-text-field>
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.nombreUsuario"
        label="Nombre"
        dense
        variant="solo"
      ></v-text-field>
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.primerApellido"
        label="Primer apellido"
        dense
        variant="solo"
      ></v-text-field>
      <v-text-field
        v-if="isEditing"
        v-model="editableUser.segundoApellido"
        label="Segundo apellido"
        dense
        variant="solo"
      ></v-text-field>
      <p v-if="!isEditing">
        {{ editableUser.nombreUsuario }} {{ editableUser.primerApellido }}
        {{ editableUser.segundoApellido }}
        <v-btn icon @click="toggleEditMode" v-if="editable"
          ><v-icon size="x-small">mdi-pen</v-icon></v-btn
        >
      </p>
    </h2>
    <h2 class="player-name text-wrap ringbearer" v-if="!isEditing">
      {{ editableUser.nick }}
    </h2>

    <v-divider class="mb-3"></v-divider>
    <v-card-text class="mt-0 text-left">
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
      <p v-else class="profile-info">
        <strong>Comunidad:</strong> {{ editableFaccionName }}
      </p>

      <v-text-field
        v-if="isEditing"
        v-model="editableUser.nickLGDA"
        label="Nick LGDA"
        dense
        variant="solo"
      ></v-text-field>
      <p v-else class="profile-info">
        <strong>Nick LGDA:</strong>
        <a
          :href="
            'https://www.laguerradelanillo.com/tu-perfil/' +
            editableUser.nickLGDA
          "
          target="_blank"
          >{{ editableUser.nickLGDA }}</a
        >
      </p>

      <v-text-field
        v-if="isEditing"
        v-model="editableUser.ciudad"
        label="Ciudad"
        dense
        variant="solo"
      ></v-text-field>
      <p v-else class="profile-info">
        <strong>Ciudad:</strong> {{ editableUser.ciudad }}
      </p>

      <v-text-field
        v-if="isEditing"
        v-model="editableUser.email"
        label="Email"
        dense
        variant="solo"
      ></v-text-field>
      <p v-else class="profile-info">
        <strong>Email:</strong> {{ editableUser.email }}
      </p>

      <!-- Campo de Fecha con Date Picker en Modo Edición -->
      <v-menu
        v-if="isEditing"
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
      <!-- Texto con fecha formateada en modo vista (no edición) -->
      <p v-else class="profile-info">
        <strong>Fecha de nacimiento:</strong>
        {{ convertirFecha(editableUser.fechaNacimiento) }}
      </p>

      <v-text-field
        v-if="isEditing"
        v-model="editableUser.telefono"
        label="Teléfono"
        dense
        variant="solo"
      ></v-text-field>
      <p v-else class="profile-info">
        <span v-if="editable"
          ><strong>Teléfono:</strong> {{ editableUser.telefono }}</span
        >
      </p>

      <v-btn
        v-if="isEditing"
        color="primary"
        variant="tonal"
        block
        @click="saveChanges"
        >Guardar</v-btn
      >
    </v-card-text>
  </v-card>
  <v-spacer class="my-4"></v-spacer>

  <v-card class="profile-section">
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

// Convertir `dateObject` de vuelta a `YYYY-MM-DD` cuando el usuario seleccione una fecha
const updateFechaNacimiento = (date: Date) => {
  dateObject.value = date;
  editableUser.fechaNacimiento = date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  datePickerMenu.value = false;
};

// Computed para mostrar siempre la fecha correctamente en el input
const formattedFechaNacimiento = computed({
  get: () =>
    dateObject.value ? dateObject.value.toISOString().split("T")[0] : "",
  set: (value) => {
    if (value) {
      dateObject.value = new Date(value);
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
  console.log("value (ID):", value.idFaccion);

  // Buscar la facción seleccionada en el array de facciones
  const foundFaccion = faccionesCombo.value.find(
    (f) => f.idFaccion === value.idFaccion
  );

  if (foundFaccion) {
    editableFaccionName.value = foundFaccion.nombreFaccion; // ✅ Solo guarda el nombre
    faccionSelected.value = foundFaccion.idFaccion; // ✅ Guarda el ID
  }

  console.log("Facción seleccionada (ID):", faccionSelected.value);
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

  console.log("editusu:", editusu);

  // TODO Enviar al backend
  try {
    await editarUsuario(editusu);
  } catch (error) {
    console.error("Error al editar usuario: "), error;
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
        (f) => f.idFaccion === props.selectedFaccionName
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
