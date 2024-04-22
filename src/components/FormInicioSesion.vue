<template>
    <div class="login-form">
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Correo electrónico:</label>
          <input type="email" id="email" v-model="objLogin.correo" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="objLogin.pass" required>
        </div>
        <button type="submit">Iniciar sesión</button>
        <button type="button" @click="goToRegistration">Registro</button>
      </form>
    </div>
  </template>

  
  
  <script setup lang="ts">
    import { Ref, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import { Login } from '@/interfaces/Login';

    const objLogin = ref<Login>({
      correo: "",
      pass: ''
    })
  
    const router = useRouter();

    const credenciales: Login = {
        correo:"123@123.com",
        pass:"123"
    }
  
    const login = () => {
      if(objLogin.value.correo===credenciales.correo && objLogin.value.pass === credenciales.pass){
        puedesPasar();
      }
      else{
        alert("Has introducido mal las credenciales")
      }
    };

    const puedesPasar = () => {
        alert("Puedes pasar") 
    };

  
    const goToRegistration = () => {
        router.push('/registro ');
    };
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
      color:#0056b3
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
  