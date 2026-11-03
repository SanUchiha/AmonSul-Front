import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { createVuetify } from "vuetify";
import { createPinia } from "pinia";
import "vuetify/styles";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.min.css";
import "@/styles/index.scss";
import "@/styles/cardPartida.scss";
import { useAuth } from "@/composables/useAuth";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "dark",
  },
  components,
  directives,
});

// El router comprueba la sesión en la primera navegación: antes hay que leerla del dispositivo
useAuth()
  .restaurarSesion()
  .catch(error => console.error("No se pudo leer la sesión guardada", error))
  .finally(() =>
    createApp(App).use(router).use(vuetify).use(createPinia()).mount("#app")
  );
