<template>
  <div class="register-form">
    <h2>Registro de usuario</h2>
    <form @submit.prevent="register">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { NewUserDTO } from "@/interfaces/Usuario.ts";
import { newUser } from "@/services/UsuariosService.ts";

const name = ref("");
const primerApellido = ref("");
const segundoApellido = ref("");
const email = ref("");
const password = ref("");
const nick = ref("");
const ciudad = ref("");
const faccion = ref("");
const fechaNacimiento = ref("");
const router = useRouter();

const register = async () => {
  const newUserDTO: NewUserDTO = {
    Nombre_Usuario: name.value,
    Primer_Apellido: primerApellido.value,
    Segundo_Apellido: segundoApellido.value,
    Email: email.value,
    Contraseña: password.value,
    Rol: "JUGADOR",
    Nick: nick.value,
    Ciudad: ciudad.value,
    Faccion: faccion.value,
    Fecha_Nacimiento: new Date(fechaNacimiento.value),
  };

  try {
    const response = await newUser(newUserDTO);
    console.log("Usuario registrado:", response);
    router.push("/inicio");
  } catch (error) {
    console.log("Error al registrar el usuario:", error);
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
