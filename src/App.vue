<template>
  <NavBar/>
  <router-view />
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue';
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: violet;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: blueviolet;
}

nav a.router-link-exact-active {
  color: goldenrod;
}
</style>
