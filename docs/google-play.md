# Amon Sûl en Google Play

Textos y respuestas para copiar en Play Console. Las contraseñas de la cuenta de revisión se escriben solo en Play
Console, nunca aquí.

## Camino hasta producción

Las cuentas personales creadas después del 13 de noviembre de 2023 necesitan una prueba cerrada antes de publicar:

1. **Prueba interna:** para comprobar el AAB firmado y sacar la huella de Play. No tiene requisitos.
2. **Prueba cerrada:** al menos **12 testers durante 14 días seguidos**. Quien salga antes no cuenta, y si vuelve, sus
   14 días empiezan de nuevo.
3. **Solicitar el acceso a producción** desde el panel de Play Console, y publicar.

## Datos de la app

| Campo                  | Valor                                            |
| ---------------------- | ------------------------------------------------ |
| Nombre                 | Amon Sûl                                         |
| ID de la aplicación    | `com.amonsul.app`                                |
| Idioma predeterminado  | Español (España)                                 |
| Tipo                   | App, gratuita                                    |
| Categoría              | Eventos                                          |
| Correo de contacto     | jose.a.sanchez.molina@gmail.com                  |
| Sitio web              | https://amonsul.netlify.app                      |
| Política de privacidad | https://amonsul.netlify.app/politica-privacidad  |
| Eliminar la cuenta     | https://amonsul.netlify.app/eliminar-cuenta.html |

## Ficha

**Descripción breve** (máximo 80 caracteres):

> Eventos de Middle-earth SBG: rondas, listas, ELO y clasificaciones en tu móvil.

**Descripción completa:**

> Amon Sûl es la plataforma para organizar y jugar eventos del wargame Middle-earth Strategy Battle Game.
>
> PARA JUGADORES
> • Consulta el calendario de eventos e inscríbete.
> • Elige ejército y entrega tu lista.
> • Sigue las rondas, los emparejamientos y los resultados.
> • Registra tus partidas amistosas.
> • Mira tu ELO, las clasificaciones, los circuitos y las estadísticas de cada ejército.
> • Recibe avisos en el móvil cuando salen las rondas o cambia tu inscripción.
> • Entra con Face ID, Touch ID o huella si lo activas.
>
> PARA ORGANIZADORES
> • Crea eventos por rondas, ligas o copas, individuales, por parejas o por equipos.
> • Gestiona inscripciones, pagos y listas.
> • Genera las rondas y la clasificación.
> • Descarga las bases y las listas para compartirlas.
>
> Amon Sûl es un proyecto de aficionados, no oficial. No está afiliado a Games Workshop, Warner Bros. ni Middle-earth Enterprises, ni cuenta con su respaldo. Sus marcas pertenecen a sus respectivos propietarios.

**Gráficos:** están en `assets/google-play/`. Hacen falta el icono de 512 × 512, el gráfico de 1024 × 500 y al menos 2
capturas de móvil.

## Formularios de Contenido de la aplicación

| Formulario                | Respuesta                                                                      |
| ------------------------- | ------------------------------------------------------------------------------ |
| Anuncios                  | No contiene anuncios                                                           |
| ID de publicidad          | No lo usa                                                                      |
| Acceso a la app           | Todo requiere iniciar sesión: añade una cuenta de prueba e instrucciones       |
| Público objetivo          | 13-15, 16-17 y 18 o más (el registro exige 14 años); no atrae a menores de 13  |
| Noticias, salud, finanzas | No                                                                             |
| Apps gubernamentales      | No                                                                             |
| Eliminación de cuentas    | Se pueden crear cuentas, se borran desde el perfil y desde el enlace de arriba |

**Clasificación de contenido:** categoría «Todas las demás apps». No hay violencia, sexo, lenguaje malsonante ni apuestas
en la app. Los usuarios sí comparten contenido entre ellos (nick, foto de perfil y listas). No comparte la ubicación ni
vende productos digitales.

## Seguridad de los datos

- **Recoge datos:** sí. **Los comparte con terceros:** no. Los proveedores que trabajan para nosotros no cuentan como
  compartir, y lo que ven otros usuarios lo decide el propio uso de la app.
- **Cifrados en tránsito:** sí.
- **Se puede pedir que se borren:** sí, con el enlace de arriba.

| Tipo de dato en Play                  | Qué es en Amon Sûl                      | ¿Obligatorio? | Finalidad                        |
| ------------------------------------- | --------------------------------------- | ------------- | -------------------------------- |
| Información personal: nombre          | Nombre y apellidos                      | Sí            | Funcionalidad, gestión de cuenta |
| Información personal: correo          | Correo electrónico                      | Sí            | Funcionalidad, gestión de cuenta |
| Información personal: IDs de usuario  | Nick e identificador interno            | Sí            | Funcionalidad, gestión de cuenta |
| Información personal: teléfono        | Teléfono                                | No            | Funcionalidad                    |
| Información personal: otra            | Fecha de nacimiento, ciudad, comunidad  | Sí            | Funcionalidad, gestión de cuenta |
| Fotos                                 | Foto de perfil y carteles               | No            | Funcionalidad                    |
| Archivos y documentos                 | Listas de ejército y bases              | No            | Funcionalidad                    |
| Mensajes: otros                       | Formulario de contacto                  | No            | Asistencia                       |
| Actividad: otro contenido del usuario | Inscripciones, partidas y resultados    | Sí            | Funcionalidad                    |
| Actividad: interacciones con la app   | Número de inicios de sesión y el último | Sí            | Analítica                        |
| Identificadores del dispositivo       | Token de notificaciones                 | No            | Funcionalidad                    |

La fecha de nacimiento y la ciudad son obligatorias, y la comunidad es opcional. La app no accede a la ubicación, la cámara
ni los contactos, y no recoge datos de pago: solo guarda si una inscripción está pagada.

## Permisos que declara la app

Internet, estado de la red, notificaciones, biometría y los que añade Firebase para recibir avisos. Ninguno requiere
formulario de declaración en Play Console.
