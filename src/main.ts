import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { createVuetify } from "vuetify";
import { createPinia } from "pinia";
import "vuetify/styles";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.min.css";
import "@/styles/index.scss"

const vuetify = createVuetify({
  theme: {
    defaultTheme: "dark",
  },
  components,
  directives,
});

createApp(App).use(router).use(vuetify).use(createPinia()).mount("#app");
