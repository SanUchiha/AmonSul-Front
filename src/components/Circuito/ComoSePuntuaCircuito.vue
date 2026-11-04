<template>
  <!-- Cómo se puntúa en los circuitos, contado para jugadores: sin fórmulas. Los números salen de utils/puntosCircuito -->
  <div class="text-body-2">
    <ul class="puntos-circuito">
      <li>
        <strong>Todo el que juega, puntúa.</strong> Quedes donde quedes, te
        llevas al menos 1 punto.
      </li>
      <li>
        <strong>Cuanto más grande es el evento, más vale ganarlo.</strong> Ganar
        uno de 8 jugadores da 35 puntos; uno de 16, 45; uno de 32, 55, y uno de
        64 o más, 65. A partir de 64 ya no sube, para que un Nacional no decida
        el circuito él solo.
      </li>
      <li>
        <strong>Lo que cuenta es quedar arriba.</strong> Los puntos bajan rápido
        según bajas en la tabla: a mitad de tabla te llevas más o menos la
        cuarta parte que el ganador.
      </li>
      <li>
        <strong>El podio tiene premio:</strong> 5 puntos más al primero, 3 al
        segundo y 1 al tercero.
      </li>
      <li>
        <strong>En Parejas</strong>, los dos miembros se llevan los puntos del
        puesto de su pareja.
      </li>
      <li>
        <strong>Solo cuentan tus 4 mejores resultados.</strong> Juega todo lo
        que quieras: lo que sale mal no resta.
      </li>
      <li>
        <strong>Si hay empate</strong>, va delante quien ha ganado más eventos;
        después, quien tiene mejor puesto, y después, quien ha jugado más.
      </li>
    </ul>
    <p class="text-medium-emphasis mt-2 mb-0">
      Por ejemplo, en un torneo de 16 jugadores: 1º&nbsp;45 · 2º&nbsp;38 ·
      3º&nbsp;32 · 4º&nbsp;26 · 8º&nbsp;13 · 12º&nbsp;4 · 16º&nbsp;1.
    </p>
  </div>
</template>

<style scoped>
.puntos-circuito {
  padding-left: 18px;
}

.puntos-circuito li + li {
  margin-top: 6px;
}
</style>
