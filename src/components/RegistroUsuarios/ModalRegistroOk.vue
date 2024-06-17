<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <h2>Registro exitoso</h2>
      <p>El usuario ha sido registrado correctamente.</p>
      <button @click="closeModal">Aceptar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  width: 300px;
}

button {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 3px;
  background-color: #007bff;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #0056b3;
}
</style>
