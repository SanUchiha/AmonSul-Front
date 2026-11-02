<template>
  <!-- Pública: se enlaza desde el registro, la inscripción y el pie de página -->
  <v-container class="politica">
    <h1 class="text-h5 font-weight-bold mb-1">Política de privacidad</h1>
    <p class="text-caption text-medium-emphasis mb-6">Última actualización: {{ ULTIMA_ACTUALIZACION }}</p>

    <h2>1. Quién es responsable de tus datos</h2>
    <ul>
      <li>Responsable: {{ RESPONSABLE }}, que gestiona Amon Sûl a título personal.</li>
      <li>Contacto: <a :href="`mailto:${CONTACTO}`">{{ CONTACTO }}</a></li>
    </ul>

    <h2>2. Qué datos tratamos</h2>
    <ul>
      <li>
        <strong>Al registrarte:</strong> nombre y apellidos, correo electrónico, contraseña, nick, ciudad, comunidad
        de juego, fecha de nacimiento y, si quieres, teléfono, nick de La Guerra del Anillo y foto de perfil. La
        contraseña se guarda cifrada con BCrypt: nadie puede leerla, tampoco nosotros.
      </li>
      <li>
        <strong>Al usar la web:</strong> tus inscripciones a eventos (fecha, si has pagado, el ejército elegido y si
        compartes tu correo con el organizador), las listas de ejército que subes, tus partidas y resultados, tu ELO y
        tu posición en las clasificaciones.
      </li>
      <li>
        <strong>Al organizar un evento:</strong> los datos que publicas del evento (nombre, lugar, fechas, precio,
        bases y cartel).
      </li>
      <li><strong>Si nos escribes desde Contacto:</strong> lo que pongas en el formulario, para responderte.</li>
      <li>
        <strong>Datos técnicos:</strong> como cualquier web, el servidor registra datos de las conexiones, como la
        dirección IP, por seguridad. De tu cuenta guardamos también cuántas veces has iniciado sesión y cuándo fue la
        última.
      </li>
    </ul>
    <p>
      No tratamos datos de pago: los eventos se pagan fuera de Amon Sûl y la web solo guarda si has pagado o no.
    </p>

    <h2>3. Para qué y con qué base legal</h2>
    <ul>
      <li>
        <strong>Crear y gestionar tu cuenta.</strong> Base: el servicio que pides al registrarte (art. 6.1.b RGPD).
      </li>
      <li>
        <strong>Inscribirte en eventos y que el organizador los gestione</strong> (listas, pagos, rondas y
        resultados). Base: el servicio (art. 6.1.b).
      </li>
      <li>
        <strong>Mostrar a los demás usuarios tu nick, resultados, ELO y clasificaciones.</strong> Base: el servicio;
        es la finalidad de la web (art. 6.1.b).
      </li>
      <li>
        <strong>Que el organizador de un evento vea tu correo para contactarte.</strong> Base: tu consentimiento, que
        das al inscribirte y puedes retirar cuando quieras en Mi inscripción (art. 6.1.a).
      </li>
      <li>
        <strong>Avisos por correo de tus eventos</strong> (inscripción, listas, rondas) <strong>y novedades de la
        web.</strong> Base: el servicio (art. 6.1.b) y el interés legítimo en informarte del servicio que usas (art.
        6.1.f). Puedes desactivarlos en tu perfil; los correos de tu cuenta, como el de recuperar la contraseña, te
        llegan siempre.
      </li>
      <li>
        <strong>Contar cuánto se usa la web</strong> (cuántas veces inicias sesión y cuándo fue la última): solo para
        estadísticas de uso. Base: el interés legítimo en mantener y mejorar el servicio (art. 6.1.f).
      </li>
      <li>
        <strong>Proteger la web frente a abusos</strong> (límite de intentos al iniciar sesión, registros del
        servidor). Base: el interés legítimo en la seguridad del servicio (art. 6.1.f).
      </li>
    </ul>
    <p>
      No tomamos decisiones automatizadas con efectos jurídicos sobre ti. El ELO es una puntuación deportiva calculada
      a partir de tus resultados.
    </p>

    <h2>4. Quién puede ver tus datos</h2>
    <ul>
      <li>
        <strong>Cualquier usuario registrado:</strong> tu nick, tu foto de perfil, tu ciudad, tu comunidad de juego,
        tus resultados, partidas, ELO e inscripciones a eventos y, cuando el organizador las hace visibles, las listas
        de ejército que entregas en un evento.
      </li>
      <li>
        <strong>El organizador de un evento al que te apuntas:</strong> además, tu inscripción, si has pagado y tus
        listas. Tu correo, solo si lo compartes.
      </li>
      <li>
        <strong>Nadie más</strong> ve tu nombre, apellidos, correo, teléfono ni fecha de nacimiento. El responsable
        puede acceder a todos los datos para administrar la web y resolver incidencias.
      </li>
      <li>
        <strong>Proveedores que nos prestan el servicio</strong> (encargados del tratamiento), solo para eso:
        <ul>
          <li>Servidor de la aplicación y base de datos: SmarterASP.NET (site4now), en Países Bajos (UE).</li>
          <li>Alojamiento de la web: Netlify, Inc. (EE. UU.).</li>
          <li>Imágenes de listas y carteles: Cloudinary (EE. UU.).</li>
          <li>Envío de correos: Google (Gmail).</li>
        </ul>
      </li>
      <li>
        <strong>Servicios a los que se conecta tu navegador:</strong> los mapas usan OpenStreetMap (direcciones y
        mapas de los eventos) y datos públicos alojados en GitHub (el mapa por provincias). Tu navegador se conecta
        directamente a ellos y les envía tu dirección IP. Si pulsas la dirección de un evento, se abre Google Maps.
      </li>
    </ul>
    <p>No vendemos ni cedemos tus datos a nadie.</p>

    <h2>5. Transferencias fuera del Espacio Económico Europeo</h2>
    <p>
      Netlify y Cloudinary están en EE. UU. Las dos están adheridas al Marco de Privacidad de Datos UE-EE. UU. y sus
      contratos incluyen además las cláusulas contractuales tipo de la Comisión Europea. Google puede tratar datos
      fuera del EEE con esas mismas garantías. OpenStreetMap está en Reino Unido, que cuenta con una decisión de
      adecuación de la Comisión Europea.
    </p>

    <h2>6. Cuánto tiempo guardamos tus datos</h2>
    <ul>
      <li>Mientras tengas la cuenta.</li>
      <li>
        Si la borras, desde tu perfil o escribiéndonos, eliminamos tus datos personales. Tus resultados y partidas
        siguen en las clasificaciones y en los eventos, sin nada que te identifique: aparecerás como «Desconocido»
        seguido de un número. Si estás inscrito en un evento que no ha terminado, o lo organizas, podrás borrarla
        cuando termine.
      </li>
      <li>El permiso para que el organizador vea tu correo dura lo que tu inscripción, o hasta que lo retires.</li>
      <li>Los enlaces para recuperar la contraseña caducan en una hora.</li>
    </ul>

    <h2>7. Menores</h2>
    <p>
      Para registrarte necesitas tener al menos 14 años (art. 7 LOPDGDD). El registro lo comprueba con tu fecha de
      nacimiento.
    </p>

    <h2>8. Tus derechos</h2>
    <p>
      Puedes pedir acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus datos,
      y retirar cuando quieras un consentimiento que hayas dado, escribiendo a
      <a :href="`mailto:${CONTACTO}`">{{ CONTACTO }}</a>. Muchos datos puedes cambiarlos tú en tu perfil, y desde ahí
      también puedes borrar tu cuenta.
    </p>
    <p>
      Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos
      (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).
    </p>

    <h2>9. Lo que se guarda en tu navegador</h2>
    <p>
      Solo lo necesario para mantener tu sesión: el token de acceso, tu correo y tu identificador de usuario. Se borran
      al cerrar sesión. No usamos cookies de análisis ni de publicidad.
    </p>

    <h2>10. Cambios en esta política</h2>
    <p>Si la cambiamos, lo avisaremos en la web y, si el cambio es importante, por correo.</p>
  </v-container>
</template>

<script setup lang="ts">
const ULTIMA_ACTUALIZACION = "2 de noviembre de 2026";
const RESPONSABLE = "José Antonio Sánchez Molina";
const CONTACTO = "jose.a.sanchez.molina@gmail.com";
</script>

<style scoped>
/* Estrecha y centrada: se lee igual en el móvil que en el ordenador */
.politica {
  max-width: 720px;
  line-height: 1.6;
}

.politica h2 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 24px 0 8px;
}

.politica p,
.politica ul {
  margin-bottom: 12px;
}

.politica ul {
  padding-left: 20px;
}

.politica li {
  margin-bottom: 6px;
}

.politica a {
  color: rgb(var(--v-theme-primary));
  overflow-wrap: anywhere;
}
</style>
