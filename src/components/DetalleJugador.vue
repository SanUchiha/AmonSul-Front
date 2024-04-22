<template>
    hola
</template>

<script setup lang="ts">

import { IUsuario } from '@/interfaces/Usuario';
import { DefineProps } from 'vue';
const props = defineProps<{
  usuario: IUsuario;
}>();

</script>

<style scoped>

</style>