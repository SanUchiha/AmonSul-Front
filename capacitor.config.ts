import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.amonsul.app",
  appName: "Amon Sûl",
  webDir: "dist",
  // La app usa el build web de dist/, con la apiUrl que esté activa en src/settings/appsettings.ts
  // al hacer npm run build: para la app tiene que ser la de producción.
  plugins: {
    // SplashScreen: pantalla de inicio nativa mientras carga el WebView.
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: "#121212", // fondo del tema oscuro de Vuetify
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // SystemBars (Capacitor 8): con viewport-fit=cover la app ocupa toda la pantalla, también detrás de la
    // barra de estado y la de gestos, y Capacitor deja sus medidas en --safe-area-inset-* para el CSS.
    // DARK: iconos claros sobre el fondo oscuro. En Android 15+ la barra ya no admite color de fondo propio.
    SystemBars: {
      insetsHandling: "css",
      style: "DARK",
      initialViewportFitValueHint: "cover",
    },
    // StatusBar: el mismo estilo en iOS.
    StatusBar: {
      style: "DARK",
    },
    // Keyboard: en iOS, al salir el teclado se encoge el body para que el campo activo quede a la vista.
    // En Android lo hace SystemBars (no poner resizeOnFullScreen: Capacitor 8 avisa de que lo rompe).
    Keyboard: {
      resize: "body",
    },
    // FirebaseMessaging: en iOS, los avisos se ven también con la app abierta
    FirebaseMessaging: {
      presentationOptions: ["alert", "badge", "sound"],
    },
  },
};

export default config;
