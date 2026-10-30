<template>
  <!-- Edición de los datos del perfil: una columna, pensada para el móvil -->
  <v-form ref="formulario" @submit.prevent="guardar">
    <v-card variant="outlined" class="pa-3 mb-3">
      <div class="d-flex align-center ga-3 mb-3">
        <v-avatar size="64">
          <v-img :src="datos.imagen || avatarPorDefecto" alt="Avatar" cover />
        </v-avatar>
        <v-btn variant="tonal" size="small" prepend-icon="mdi-camera" @click="selectorFoto?.click()">
          Cambiar foto
        </v-btn>
        <input ref="selectorFoto" type="file" accept="image/*" hidden @change="cambiarFoto" />
      </div>

      <h2 class="text-subtitle-1 font-weight-bold mb-2">Datos personales</h2>
      <v-text-field
        v-model="datos.nombreUsuario"
        label="Nombre"
        :rules="[obligatorio]"
        maxlength="50"
        density="comfortable"
      />
      <v-text-field
        v-model="datos.primerApellido"
        label="Primer apellido"
        :rules="[obligatorio]"
        maxlength="50"
        density="comfortable"
      />
      <v-text-field
        v-model="datos.segundoApellido"
        label="Segundo apellido"
        maxlength="50"
        density="comfortable"
      />
      <!-- El selector de fecha nativo es el más cómodo en el móvil -->
      <v-text-field
        v-model="datos.fechaNacimiento"
        label="Fecha de nacimiento"
        type="date"
        density="comfortable"
      />
      <v-text-field
        v-model="datos.telefono"
        label="Teléfono"
        type="tel"
        inputmode="numeric"
        :rules="[telefonoValido]"
        maxlength="9"
        density="comfortable"
      />
      <v-text-field v-model="datos.ciudad" label="Ciudad" maxlength="100" density="comfortable" />

      <h2 class="text-subtitle-1 font-weight-bold mt-2 mb-2">Como jugador</h2>
      <v-text-field
        v-model="datos.nick"
        label="Nick"
        :rules="[obligatorio]"
        maxlength="50"
        density="comfortable"
      />
      <v-autocomplete
        v-model="datos.idFaccion"
        :items="facciones"
        item-title="nombreFaccion"
        item-value="idFaccion"
        label="Comunidad"
        density="comfortable"
      />
      <v-text-field
        v-model="datos.nickLGDA"
        label="Nick en La Guerra del Anillo"
        maxlength="50"
        density="comfortable"
        hide-details
      />
    </v-card>

    <!-- Botones a mano del pulgar: Guardar ocupa el ancho en móvil -->
    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-btn type="submit" color="primary" :loading="guardando" class="flex-grow-1">Guardar</v-btn>
      <v-btn variant="tonal" :disabled="guardando" class="flex-grow-1" @click="emit('cancelar')">
        Cancelar
      </v-btn>
    </div>
  </v-form>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, reactive, ref } from "vue";
import { EditarUsuarioDTO, UsuarioViewDTO } from "@/interfaces/Usuario";
import { FaccionDTO } from "@/interfaces/Faccion";
import { editarUsuario } from "@/services/UsuariosService";
import { useToast } from "@/composables/useToast";
import { fechaConocida } from "@/utils/Fecha";
import avatarPorDefecto from "@/assets/icons/perfil.png";

const props = defineProps<{
  usuario: UsuarioViewDTO;
  facciones: FaccionDTO[];
}>();

const emit = defineEmits<{
  (e: "guardado", cambios: Partial<UsuarioViewDTO>): void;
  (e: "cancelar"): void;
}>();

const { triggerToast } = useToast();
const formulario = ref<{ validate: () => Promise<{ valid: boolean }> }>();
const selectorFoto = ref<HTMLInputElement>();
const guardando = ref(false);

// Una copia: lo que se escribe no toca el perfil hasta guardar
const datos = reactive({
  nombreUsuario: props.usuario.nombreUsuario ?? "",
  primerApellido: props.usuario.primerApellido ?? "",
  segundoApellido: props.usuario.segundoApellido ?? "",
  fechaNacimiento: fechaConocida(props.usuario.fechaNacimiento),
  telefono: props.usuario.telefono ?? "",
  ciudad: props.usuario.ciudad ?? "",
  nick: props.usuario.nick ?? "",
  idFaccion: props.usuario.idFaccion && props.usuario.idFaccion > 0 ? props.usuario.idFaccion : undefined,
  nickLGDA: props.usuario.nickLGDA ?? "",
  imagen: props.usuario.imagen ?? "",
});

const obligatorio = (valor: string) => !!valor?.trim() || "Obligatorio";
const telefonoValido = (valor: string) =>
  !valor || /^\d{9}$/.test(valor) || "Tienen que ser 9 cifras";

// La foto se reduce antes de guardarla: una de la cámara pesa megas y solo se pinta pequeña
const LADO_FOTO = 256;
const reducirFoto = (archivo: File) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      const escala = Math.min(1, LADO_FOTO / Math.max(imagen.width, imagen.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(imagen.width * escala);
      lienzo.height = Math.round(imagen.height * escala);
      lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
      URL.revokeObjectURL(url);
      resolve(lienzo.toDataURL("image/jpeg", 0.85));
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    imagen.src = url;
  });

const cambiarFoto = async (evento: Event) => {
  const entrada = evento.target as HTMLInputElement;
  const archivo = entrada.files?.[0];
  entrada.value = "";
  if (!archivo) return;
  try {
    datos.imagen = await reducirFoto(archivo);
  } catch {
    triggerToast("error", "No se pudo leer la imagen");
  }
};

const guardar = async () => {
  if (!(await formulario.value?.validate())?.valid) return;

  const cambios: Partial<UsuarioViewDTO> = {
    nombreUsuario: datos.nombreUsuario.trim(),
    primerApellido: datos.primerApellido.trim(),
    segundoApellido: datos.segundoApellido.trim(),
    telefono: datos.telefono.trim(),
    ciudad: datos.ciudad.trim(),
    nick: datos.nick.trim(),
    nickLGDA: datos.nickLGDA.trim(),
    // Vacío no se manda: el back dejaría la que había
    ...(datos.fechaNacimiento ? { fechaNacimiento: datos.fechaNacimiento } : {}),
    ...(datos.idFaccion ? { idFaccion: datos.idFaccion } : {}),
    // La foto solo si ha cambiado: es lo que más pesa
    ...(datos.imagen !== (props.usuario.imagen ?? "") ? { imagen: datos.imagen } : {}),
  };
  const peticion: EditarUsuarioDTO = { idUsuario: props.usuario.idUsuario, ...cambios };

  guardando.value = true;
  try {
    await editarUsuario(peticion);
    triggerToast("success", "Perfil actualizado");
    emit("guardado", cambios);
  } catch (error) {
    console.error("Error al editar el perfil:", error);
    triggerToast("error", "No se pudo guardar el perfil");
  } finally {
    guardando.value = false;
  }
};
</script>
