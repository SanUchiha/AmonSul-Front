<template>
  <div class="login-form">
    <h2>Iniciar sesión</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Correo electrónico:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="button" @click="handleLogin">Iniciar sesión</button>
      <button type="button" @click="goToRegistration">Registro</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { RequestLoginDTO } from "@/interfaces/Login";
import { doLogin } from "@/services/LoginService";
import { useAuth } from "@/composables/useAuth";

const email = ref("");
const password = ref("");
const { login } = useAuth();
const router = useRouter();

const handleLogin = async () => {
  var credentials: RequestLoginDTO = {
    email: email.value,
    password: password.value,
  };
  await login(credentials);
  router.push("torneos");
};

// const login = async () => {
//   try {
//     var login = doLogin(objLogin);
//     if (login.isSuccess) {
//       localStorage.setItem("token", login.token);
//       router.push("/inicio");
//     } else {
//       alert("Login incorrecto");
//     }
//   } catch (error) {
//     console.log("Error al hacer login: " + error);
//   }
// };

// const goToLogin = () => {
//   let tempLogin: RequestLoginDTO = {
//     correo: "",
//     pass: "",
//   };

//   if (
//     tempLogin.correo === objLogin.value.correo &&
//     tempLogin.pass === objLogin.value.pass
//   ) {
//     router.push("/inicio");
//   } else {
//     alert("Login incorrecto");
//   }
//   //router.push("/registro-usuario ");
// };

const goToRegistration = () => router.push("/registro-usuario");
</script>

<style scoped>
.login-form {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  color: #0056b3;
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
