<template>
  <div class="register-form">
    <h2>Registro de usuario</h2>
    <form @submit.prevent="crearUsuario">
      <div class="form-group">
        <label for="name">Nombre completo:</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="primerApellido">Primer Apellido:</label>
        <input
          type="text"
          id="primerApellido"
          v-model="primerApellido"
          required
        />
      </div>
      <div class="form-group">
        <label for="segundoApellido">Segundo Apellido:</label>
        <input type="text" id="segundoApellido" v-model="segundoApellido" />
      </div>
      <div class="form-group">
        <label for="email">Correo electrónico:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label for="nick">Nick:</label>
        <input type="text" id="nick" v-model="nick" required />
      </div>
      <div class="form-group">
        <label for="ciudad">Ciudad:</label>
        <input type="text" id="ciudad" v-model="ciudad" required />
      </div>
      <div class="form-group">
        <label for="faccion">Facción:</label>
        <input type="text" id="faccion" v-model="faccion" required />
      </div>
      <div class="form-group">
        <label for="fechaNacimiento">Fecha de Nacimiento:</label>
        <input
          type="date"
          id="fechaNacimiento"
          v-model="fechaNacimiento"
          required
        />
      </div>
      <button type="submit">Registrarse</button>
    </form>
    <ModalRegistroResponse
      :isVisible="isModalVisible"
      :message="modalMessage"
      :isSuccess="isModalSuccess"
      @close="isModalVisible = false"
      @modal-closed="handleModalClosed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { NewUserDTO } from "@/interfaces/Usuario";
import { newUser } from "@/services/UsuariosService";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from "axios";
import ModalRegistroResponse from "../RegistroUsuarios/ModalRegistroResponse.vue";

const name = ref("");
const primerApellido = ref("");
const segundoApellido = ref("");
const email = ref("");
const password = ref("");
const nick = ref("");
const ciudad = ref("");
const faccion = ref("");
const fechaNacimiento = ref("");
const isModalVisible = ref(false);
const modalMessage = ref("");
const isModalSuccess = ref(false);
const errorMessage = ref("");
const router = useRouter();
const shouldRedirect = ref(false);

const formatFecha = (fechaString: string) => {
  const fecha = new Date(fechaString);
  const year = fecha.getFullYear();
  const month = ("0" + (fecha.getMonth() + 1)).slice(-2);
  const day = ("0" + fecha.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const crearUsuario = async () => {
  const newUserDTO: NewUserDTO = {
    NombreUsuario: name.value,
    PrimerApellido: primerApellido.value,
    SegundoApellido: segundoApellido.value,
    Email: email.value,
    Contraseña: password.value,
    Rol: "JUGADOR",
    Nick: nick.value,
    Ciudad: ciudad.value,
    Faccion: faccion.value,
    FechaNacimiento: formatFecha(fechaNacimiento.value),
  };

  try {
    const response = await newUser(newUserDTO);

    if (response.status === 200) {
      modalMessage.value = "Usuario registrado con éxito.";
      // Conseguir la cookie
      alert(response.data);
      isModalSuccess.value = true;
      isModalVisible.value = true;
      shouldRedirect.value = true;
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      errorMessage.value = error.response.data.message;
      modalMessage.value = errorMessage.value;
    } else {
      errorMessage.value = "Ocurrió un error al registrar el usuario.";
      modalMessage.value = errorMessage.value;
    }
    isModalSuccess.value = false;
    isModalVisible.value = true;
  }
};

const handleModalClosed = () => {
  if (shouldRedirect.value) {
    router.push("/inicio");
  }
};
</script>

<style scoped>
.register-form {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  color: black;
}

button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 3px;
  background-color: #007bff;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px; /* Añade un espacio entre los botones */
}

button:hover {
  background-color: #0056b3;
}
</style>
