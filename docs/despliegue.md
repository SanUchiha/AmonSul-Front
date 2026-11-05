# Despliegue de Amon Sûl

La app es la web dentro de Capacitor: cada versión de las tiendas lleva dentro la web tal como estaba al compilarla.
Un cambio en el front llega a la web al subirlo a `main`, pero a la app solo con una versión nueva en la tienda.

## Web (Netlify)

Al subir a `main`, Netlify publica solo. El back (`AmonSul-back`) se despliega igual con GitHub Actions, y sus migraciones
se aplican a mano antes de subirlo.

## Antes de compilar la app

1. `src/settings/appsettings.ts` debe apuntar a la API de producción (`apiUrl`).
2. Sube la versión:
   - **Android:** en `android/app/build.gradle`, `versionCode` (entero, siempre mayor que el anterior) y `versionName`.
   - **iOS:** en Xcode, target `App` → General → `Version` y `Build`.
3. Compila la web y cópiala a los proyectos nativos:

```bash
npm run build
```

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx cap sync
```

## Android (Google Play)

La clave de firma de subida está en `Develop/Certificados/AmonSul/`, fuera del repositorio. Guarda su contraseña en un
gestor de contraseñas. Con Play App Signing, Google firma lo que se publica, y si se pierde la clave de subida se puede
pedir otra.

```bash
npx cap open android
```

En Android Studio: **Build → Generate Signed App Bundle or APK → Android App Bundle**, con esa clave y la variante
`release`. El bundle queda en `android/app/release/app-release.aab`, que no se sube al repositorio.

Luego, en Play Console, se sube a la pista que toque. La ficha y las respuestas de los formularios están en
[google-play.md](google-play.md).

### Huellas en assetlinks

Los enlaces de recuperar contraseña solo abren la app si `public/.well-known/assetlinks.json` tiene la huella SHA-256 del
certificado que firma la app instalada:

- **Instalada desde Play:** la de la firma de apps, `8F:DB:62:8D:…:62:28`. Está en Play Console → Protegida con Play →
  Protección de Play Store → Firma de apps, en «Certificado de clave de firma de apps». No sirve la de la clave de subida.
- **Compilada aquí en Debug:** la de `~/.android/debug.keystore`.

## iOS (App Store)

Pendiente de la fase de publicación en App Store.
