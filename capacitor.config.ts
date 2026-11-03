import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amonsul.app',
  appName: 'Amon Sûl',
  webDir: 'dist',
  // La app usa el build web de dist/, con la apiUrl que esté activa en src/settings/appsettings.ts
  // al hacer npm run build: para la app tiene que ser la de producción.
  plugins: {
    // SplashScreen: pantalla de inicio nativa mientras carga el WebView.
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#121212', // fondo del tema oscuro de Vuetify
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // StatusBar: barra de estado nativa con el color del tema oscuro.
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#121212',
    },
  },
};

export default config;
