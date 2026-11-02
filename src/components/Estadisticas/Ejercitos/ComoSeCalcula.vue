<template>
  <!-- Cómo salen las estadísticas, contado para jugadores: sin fórmulas -->
  <div class="text-body-2">
    <ul class="explicacion">
      <li>
        <strong>Qué partidas cuentan.</strong> Las de torneos validadas por los dos jugadores, también las de torneos
        por equipos, donde cada partida es uno contra uno. Las de Parejas no, porque son dos contra dos. Las amistosas,
        solo si marcas «Con amistosas».
      </li>
      <li>
        <strong>Un ejército contra sí mismo no cuenta.</strong> Si los dos llevan el mismo, la partida no dice nada de
        ese ejército.
      </li>
      <li><strong>% de victorias.</strong> Un empate cuenta como media victoria.</li>
      <li>
        <strong>«Rinde».</strong> El % de victorias engaña: un ejército parece mejor si lo llevan los mejores
        jugadores. «Rinde» compara cada resultado con lo que esperaba el ELO de los dos jugadores ese día: +5 es que
        gana 5 puntos de porcentaje más de lo esperado y −5, que gana 5 menos.
      </li>
      <li>
        <strong>Torneos ganados y podios.</strong> Cuenta quedar 1º, o entre los tres primeros, en la clasificación
        final de los torneos individuales. En los de equipos no, porque el 1º individual no gana el torneo. El ejército
        de cada jugador es el que más llevó en sus partidas de ese torneo. Así se ve si un ejército gana partidas pero
        no le da para ganar torneos.
      </li>
      <li>
        <strong>Los puntos.</strong> Los de la partida o, si no los tiene, los del torneo, en cuatro tramos: hasta 550,
        600-650, 700-750 y 800 o más.
      </li>
      <li>
        <strong>Con pocas partidas, mejor no fiarse.</strong> Una o dos lo deciden todo. Por eso el ranking enseña los
        ejércitos con 10 partidas o más y marca con * los de menos de 20, y en la ficha de un ejército los rivales y los
        jugadores necesitan 5.
      </li>
      <li><strong>Se actualiza cada 10 minutos.</strong> Una partida recién validada tarda un poco en aparecer.</li>
    </ul>
  </div>
</template>

<style scoped>
.explicacion {
  padding-left: 18px;
}

.explicacion li + li {
  margin-top: 6px;
}
</style>
