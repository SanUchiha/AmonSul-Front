<template>
  <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 150px">
    <LoadingGandalf />
  </div>
  <v-container v-else-if="usuario" class="perfil text-left">
    <!-- Quién es; el ELO y las partidas están en su ficha de jugador -->
    <v-card class="pa-3 mb-3" elevation="2">
      <div class="d-flex align-center ga-3">
        <v-avatar size="72">
          <v-img :src="usuario.imagen || avatarPorDefecto" alt="Avatar" cover />
        </v-avatar>
        <div class="flex-grow-1 min-w-0">
          <h1 class="text-h6 font-weight-bold text-wrap">{{ usuario.nick }}</h1>
          <div v-if="nombreFaccion" class="text-body-2 text-medium-emphasis text-wrap">
            {{ nombreFaccion }}
          </div>
          <div v-if="miembroDesde" class="text-caption text-medium-emphasis">
            Miembro desde {{ miembroDesde }}
          </div>
        </div>
      </div>
      <div class="d-flex flex-wrap ga-2 mt-3">
        <v-btn
          v-if="!editando"
          color="primary"
          variant="tonal"
          size="small"
          prepend-icon="mdi-pencil"
          @click="editando = true"
        >
          Editar perfil
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          prepend-icon="mdi-chart-line"
          :to="`/detalle-jugador/${usuario.idUsuario}`"
        >
          Ver mi ficha de jugador
        </v-btn>
      </div>
    </v-card>

    <FormularioPerfil
      v-if="editando"
      :usuario="usuario"
      :facciones="facciones"
      @guardado="alGuardar"
      @cancelar="editando = false"
    />

    <template v-else>
      <section v-for="seccion in secciones" :key="seccion.titulo">
        <h2 class="text-subtitle-1 font-weight-bold mb-1">{{ seccion.titulo }}</h2>
        <v-card variant="outlined" class="mb-3">
          <v-list density="compact" bg-color="transparent" class="py-1">
            <v-list-item v-for="dato in seccion.datos" :key="dato.etiqueta" :prepend-icon="dato.icono">
              <div class="text-caption text-medium-emphasis">{{ dato.etiqueta }}</div>
              <a
                v-if="dato.valor && dato.enlace"
                :href="dato.enlace"
                target="_blank"
                rel="noopener"
                class="text-body-2 text-primary dato"
              >
                {{ dato.valor }}
              </a>
              <div v-else class="text-body-2 dato" :class="{ 'text-medium-emphasis': !dato.valor }">
                {{ dato.valor || "Sin indicar" }}
              </div>
            </v-list-item>
          </v-list>
        </v-card>
      </section>

      <!-- Cuenta: el email es con el que entra, así que no se cambia desde aquí -->
      <h2 class="text-subtitle-1 font-weight-bold mb-1">Cuenta</h2>
      <v-card variant="outlined" class="mb-3">
        <v-list density="compact" bg-color="transparent" class="py-1">
          <v-list-item prepend-icon="mdi-email-outline">
            <div class="text-caption text-medium-emphasis">Email</div>
            <div class="text-body-2 dato">{{ usuario.email }}</div>
            <div class="text-caption text-medium-emphasis">
              Es con el que entras. Si necesitas cambiarlo, escríbenos desde
              <router-link to="/contacto">Contacto</router-link>.
            </div>
          </v-list-item>
        </v-list>
        <div class="px-4 pb-3">
          <v-btn variant="tonal" size="small" prepend-icon="mdi-lock-reset" @click="cambiarPass = true">
            Cambiar contraseña
          </v-btn>
        </div>
      </v-card>

      <h2 class="text-subtitle-1 font-weight-bold mb-1">Notificaciones</h2>
      <v-card variant="outlined" class="pa-3 mb-3">
        <v-switch
          :model-value="permiteNotificaciones"
          color="primary"
          inset
          hide-details
          density="compact"
          label="Avisos por correo"
          :loading="guardandoAvisos"
          :disabled="guardandoAvisos"
          @update:model-value="cambiarNotificaciones"
        />
        <p class="text-caption text-medium-emphasis mb-0 mt-1">
          Nuevos eventos, rondas, inscripciones, pagos, listas y partidas amistosas. Si los
          desactivas, solo te llegará el correo para recuperar la contraseña.
        </p>
      </v-card>
    </template>
  </v-container>

  <ModalCambiarPass v-if="cambiarPass" @close="cambiarPass = false" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import { useUsuariosStore } from "@/store/usuarios";
import { UsuarioViewDTO } from "@/interfaces/Usuario";
import { FaccionDTO } from "@/interfaces/Faccion";
import { getFacciones } from "@/services/FaccionesService";
import { editarUsuario } from "@/services/UsuariosService";
import { fechaConocida } from "@/utils/Fecha";
import LoadingGandalf from "@/components/Commons/LoadingGandalf.vue";
import FormularioPerfil from "@/components/Perfil/FormularioPerfil.vue";
import ModalCambiarPass from "@/components/Perfil/ModalCambiarPass.vue";
import avatarPorDefecto from "@/assets/icons/perfil.png";

interface Dato {
  etiqueta: string;
  icono: string;
  valor?: string;
  enlace?: string;
}

const usuariosStore = useUsuariosStore();
const { getUser } = useAuth();
const { triggerToast } = useToast();

const isLoading = ref(true);
const editando = ref(false);
const cambiarPass = ref(false);
const guardandoAvisos = ref(false);
const facciones = ref<FaccionDTO[]>([]);

// El del store: la barra de arriba pinta el mismo, así un avatar nuevo se ve en los dos sitios
const usuario = computed<UsuarioViewDTO | undefined>(() =>
  usuariosStore.usuario?.idUsuario ? usuariosStore.usuario : undefined
);

const nombreFaccion = computed(
  () => facciones.value.find(f => f.idFaccion === usuario.value?.idFaccion)?.nombreFaccion ?? ""
);

// "AAAA-MM-DD" a "15/03/1990" sin pasar por Date, que podría cambiar el día según la zona horaria
const fechaCorta = (fecha: string) => fecha.split("-").reverse().join("/");
const miembroDesde = computed(() => {
  const fecha = fechaConocida(usuario.value?.fechaRegistro);
  if (!fecha) return "";
  const [anio, mes] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
});

const secciones = computed<{ titulo: string; datos: Dato[] }[]>(() => {
  const u = usuario.value;
  if (!u) return [];
  const nacimiento = fechaConocida(u.fechaNacimiento);
  return [
    {
      titulo: "Datos personales",
      datos: [
        {
          etiqueta: "Nombre",
          icono: "mdi-account-outline",
          valor: [u.nombreUsuario, u.primerApellido, u.segundoApellido].filter(Boolean).join(" "),
        },
        {
          etiqueta: "Fecha de nacimiento",
          icono: "mdi-cake-variant-outline",
          valor: nacimiento ? fechaCorta(nacimiento) : "",
        },
        { etiqueta: "Teléfono", icono: "mdi-phone-outline", valor: u.telefono },
        { etiqueta: "Ciudad", icono: "mdi-map-marker-outline", valor: u.ciudad },
      ],
    },
    {
      titulo: "Como jugador",
      datos: [
        { etiqueta: "Nick", icono: "mdi-sword", valor: u.nick },
        { etiqueta: "Comunidad", icono: "mdi-shield-account-outline", valor: nombreFaccion.value },
        {
          etiqueta: "Nick en La Guerra del Anillo",
          icono: "mdi-link-variant",
          valor: u.nickLGDA,
          enlace: u.nickLGDA
            ? `https://www.laguerradelanillo.com/tu-perfil/${encodeURIComponent(u.nickLGDA)}`
            : undefined,
        },
      ],
    },
  ];
});

// Hasta que el back lo envíe, se dan por activados: es lo que había
const permiteNotificaciones = computed(() => usuario.value?.permiteNotificaciones ?? true);

const cambiarNotificaciones = async (valor: boolean | null) => {
  if (!usuario.value) return;
  const permite = !!valor;
  guardandoAvisos.value = true;
  try {
    await editarUsuario({ idUsuario: usuario.value.idUsuario, permiteNotificaciones: permite });
    usuariosStore.usuario = { ...usuariosStore.usuario, permiteNotificaciones: permite };
    triggerToast(
      "success",
      permite ? "Te avisaremos por correo" : "Ya no te enviaremos avisos por correo"
    );
  } catch (error) {
    console.error("Error al cambiar las notificaciones:", error);
    triggerToast("error", "No se pudo guardar el cambio");
  } finally {
    guardandoAvisos.value = false;
  }
};

const alGuardar = (cambios: Partial<UsuarioViewDTO>) => {
  usuariosStore.usuario = { ...usuariosStore.usuario, ...cambios };
  editando.value = false;
};

onMounted(async () => {
  try {
    const [, respuestaFacciones] = await Promise.all([
      usuariosStore.requestUsuario(getUser.value),
      getFacciones(),
    ]);
    facciones.value = respuestaFacciones.data;
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.perfil {
  max-width: 720px;
}

.min-w-0 {
  min-width: 0;
}

/* Emails y nicks largos se parten en vez de salirse en móvil */
.dato {
  overflow-wrap: anywhere;
}
</style>
