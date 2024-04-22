<template>
    <div class="register-form">
      <h2>Registro de usuario</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="fullName">Nombre completo:</label>
          <input type="text" id="fullName" v-model="fullName" required>
        </div>
        <div class="form-group">
          <label for="email">Correo electrónico:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
  
    const fullName = ref('');
    const email = ref('');
    const password = ref('');
    const router = useRouter();
  
    const register = () => {
      // Aquí puedes agregar la lógica para enviar los datos del formulario al servidor y registrar al usuario
      console.log('Nombre completo:', fullName.value);
      console.log('Correo electrónico:', email.value);
      console.log('Contraseña:', password.value);
      // Aquí deberías realizar una petición HTTP para enviar los datos al servidor y manejar la respuesta
    };
  
    const goToLogin = () => {
      // Aquí puedes redirigir al usuario a la página de inicio de sesión
      // Por ejemplo, utilizando Vue Router: router.push('/inicio-sesion');
      console.log('Ir a la página de inicio de sesión');
    };
  </script>
  
  <style scoped>
    .register-form {
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
  
    input[type="text"],
    input[type="email"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 3px;
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
  