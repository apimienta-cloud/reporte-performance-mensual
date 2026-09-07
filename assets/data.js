/* ============================================================================
   data.js — plantilla en blanco (DEFAULTS) y ejemplo cargado (EXAMPLE)
   Todo el texto es editable desde el panel; esto solo define los valores
   iniciales. Los números se guardan como texto para poder pegarlos con
   separadores ("1.527.704"); el parseo vive en app.js.
   ========================================================================== */

/* Glosario por defecto (idéntico al del reporte de referencia). */
const GLOSARIO_DEFAULT = [
  { t: "Ingresos totales", d: "Todo lo facturado en la tienda online en el período, medido por Google Analytics (incluye ventas que no vinieron de publicidad, como las orgánicas)." },
  { t: "Ingresos Google + Meta Ads", d: "Solo la parte de esos ingresos que se puede atribuir directamente a los anuncios pagos de Google y Meta." },
  { t: "Compras", d: "Cantidad total de compras registradas en Analytics (incluye las que vienen de publicidad y las orgánicas)." },
  { t: "Compras Google + Meta Ads", d: "Suma de las compras que cada plataforma le atribuye a sus propios anuncios. No coincide con el total de Analytics: la diferencia son compras orgánicas u otros canales que las plataformas de ads no capturan." },
  { t: "Valor compras", d: "Monto en pesos (o dólares) de las compras que generó cada plataforma publicitaria." },
  { t: "Compras atribuidas", d: "Cantidad de compras que la plataforma le “adjudica” a sus anuncios." },
  { t: "Ticket promedio", d: "Cuánto gasta en promedio cada persona por compra (dato reportado directamente por Analytics)." },
  { t: "Costo por compra (CPA)", d: "Cuánto se gastó en publicidad para conseguir cada compra. Cuanto más bajo, mejor." },
  { t: "ROAS", d: "Retorno de la inversión publicitaria: por cada $1 invertido en anuncios, cuántos $ se generaron en ventas." },
  { t: "Ingresos Google+Meta / Inversión Total", d: "Cuántos pesos generaron los anuncios (Google + Meta) por cada peso invertido en publicidad, considerando la inversión total de ambas plataformas." },
  { t: "PMax (Performance Max)", d: "Tipo de campaña automática de Google que muestra anuncios en todos sus canales (búsqueda, YouTube, Gmail, etc.) a la vez." },
  { t: "DSA Search", d: "Anuncios de búsqueda dinámicos: Google arma el aviso automáticamente según lo que la persona busca y lo que hay en el sitio." },
  { t: "Branded", d: "Campaña de búsqueda que aparece cuando alguien busca el nombre de la marca directamente." },
  { t: "TC (Tipo de cambio)", d: "Valor del dólar usado para sumar en una misma moneda la inversión y las ventas de Google (en US$) con las de Meta (en $)." }
];

/* Plantilla en blanco: textos de andamiaje + glosario, sin números. */
const DEFAULTS = {
  meta: {
    cliente: "",
    logoAgencia: null,
    logoCliente: null,
    comparativo: "Comparativo: mes anterior y mismo mes del año anterior",
    tituloReporte: "PERFORMANCE ECOMMERCE · REPORTE MENSUAL",
    periodo: "",
    subtitulo: "Meta $UYU + Google USD · TC —",
    metaTitulo: "META ADS", metaMoneda: "EN $UYU", metaCanales: "Facebook & Instagram",
    googleTitulo: "GOOGLE ADS", googleMoneda: "EN US$", googleCanales: "Search & PMax",
    desgloseTitulo: "GOOGLE ADS · DESGLOSE POR CAMPAÑA",
    colActual: "MES ACT.", colMes: "MES ANT.", colMesHead: "MES A MES",
    colAnio: "AÑO ANT.", colAnioHead: "AÑO A AÑO"
  },
  kpis: {
    ingresosTotales:       { label: "Ingresos totales",                       actual: "", mesAnt: "", anioAnt: "", fmt: "money_uyu", dir: "up",      display: "" },
    ingresosGoogleMeta:    { label: "Ingresos Google + Meta Ads",             actual: "", mesAnt: "", anioAnt: "", fmt: "money_uyu", dir: "up",      display: "" },
    compras:               { label: "Compras",                                actual: "", mesAnt: "", anioAnt: "", fmt: "int",       dir: "up",      display: "" },
    comprasGoogleMeta:     { label: "Compras Google + Meta Ads",              actual: "", mesAnt: "", anioAnt: "", fmt: "int",       dir: "up",      display: "" },
    ticketPromedio:        { label: "Ticket promedio",                        actual: "", mesAnt: "", anioAnt: "", fmt: "money_uyu", dir: "up",      display: "" },
    inversionTotal:        { label: "Inversión total",                        actual: "", mesAnt: "", anioAnt: "", fmt: "money_uyu", dir: "neutral", display: "" },
    ingresosSobreInversion:{ label: "Ingresos Google+Meta / Inversión total", actual: "", mesAnt: "", anioAnt: "", fmt: "roas_x1",   dir: "up",      display: "" }
  },
  metaAds: { filas: [
    { label: "Inversión",          actual: "", mesAnt: "", anioAnt: "", fmt: "money_uyu",   dir: "neutral", display: "" },
    { label: "Valor compras",      actual: "", mesAnt: "", anioAnt: "", fmt: "money_uyu",   dir: "up",      display: "" },
    { label: "Compras atribuidas", actual: "", mesAnt: "", anioAnt: "", fmt: "int",         dir: "up",      display: "" },
    { label: "Costo por compra",   actual: "", mesAnt: "", anioAnt: "", fmt: "money_uyu_2", dir: "down",    display: "" },
    { label: "ROAS",               actual: "", mesAnt: "", anioAnt: "", fmt: "int",         dir: "up",      display: "" }
  ] },
  googleAds: { filas: [
    { label: "Inversión",          actual: "", mesAnt: "", anioAnt: "", fmt: "money_usd",   dir: "neutral", display: "" },
    { label: "Valor compras",      actual: "", mesAnt: "", anioAnt: "", fmt: "money_usd",   dir: "up",      display: "" },
    { label: "Compras atribuidas", actual: "", mesAnt: "", anioAnt: "", fmt: "int",         dir: "up",      display: "" },
    { label: "Costo por compra",   actual: "", mesAnt: "", anioAnt: "", fmt: "money_usd_2", dir: "down",    display: "" },
    { label: "ROAS",               actual: "", mesAnt: "", anioAnt: "", fmt: "num2",        dir: "up",      display: "" }
  ] },
  desglose: { grupos: [
    { titulo: "COMPRAS", fmt: "num_trim", dir: "up", filas: [
      { label: "Branded",    actual: "", mesAnt: "", anioAnt: "", display: "" },
      { label: "PMax",       actual: "", mesAnt: "", anioAnt: "", display: "" },
      { label: "DSA Search", actual: "", mesAnt: "", anioAnt: "", display: "" }
    ] },
    { titulo: "ROAS", fmt: "num2", dir: "up", filas: [
      { label: "Branded",    actual: "", mesAnt: "", anioAnt: "", display: "" },
      { label: "PMax",       actual: "", mesAnt: "", anioAnt: "", display: "" },
      { label: "DSA Search", actual: "", mesAnt: "", anioAnt: "", display: "" }
    ] }
  ] },
  lectura: {
    items: [ { lead: "Panorama general:", texto: "" } ],
    legend: { pos: "Resultado favorable", neg: "Resultado desfavorable", neutral: "Referencia / sin veredicto" }
  },
  benchmark: {
    titulo: "BENCHMARK DEL RUBRO",
    intro: "",
    filas: [],
    cierre: "",
    fuente: ""
  },
  glosario: { titulo: "GLOSARIO", items: GLOSARIO_DEFAULT.map(function (x) { return { t: x.t, d: x.d }; }) },
  footer: "Fuente: GA4, Meta Ads y Google Ads"
};

/* Ejemplo: Espacio Mascota · Julio 2026 (mismos datos que el PDF de referencia). */
const EXAMPLE = {
  meta: {
    cliente: "Espacio Mascota",
    logoAgencia: null,
    logoCliente: null,
    comparativo: "Comparativo: junio 2026 y julio 2025",
    tituloReporte: "PERFORMANCE ECOMMERCE · REPORTE MENSUAL",
    periodo: "Julio 2026",
    subtitulo: "Meta $UYU + Google USD · TC 40,20",
    metaTitulo: "META ADS", metaMoneda: "EN $UYU", metaCanales: "Facebook & Instagram",
    googleTitulo: "GOOGLE ADS", googleMoneda: "EN US$", googleCanales: "Search & PMax",
    desgloseTitulo: "GOOGLE ADS · DESGLOSE POR CAMPAÑA",
    colActual: "JUL. 2026", colMes: "JUN. 2026", colMesHead: "MES A MES",
    colAnio: "JUL. 2025", colAnioHead: "AÑO A AÑO"
  },
  kpis: {
    ingresosTotales:       { label: "Ingresos totales",                       actual: "3866244", mesAnt: "4027338", anioAnt: "2722707", fmt: "money_uyu", dir: "up",      display: "" },
    ingresosGoogleMeta:    { label: "Ingresos Google + Meta Ads",             actual: "3761399", mesAnt: "3270781", anioAnt: "3134499", fmt: "money_uyu", dir: "up",      display: "" },
    compras:               { label: "Compras",                                actual: "1300",    mesAnt: "1313",    anioAnt: "977",     fmt: "int",       dir: "up",      display: "" },
    comprasGoogleMeta:     { label: "Compras Google + Meta Ads",              actual: "1143",    mesAnt: "1012",    anioAnt: "1011",    fmt: "int",       dir: "up",      display: "" },
    ticketPromedio:        { label: "Ticket promedio",                        actual: "3602",    mesAnt: "3638",    anioAnt: "3398",    fmt: "money_uyu", dir: "up",      display: "" },
    inversionTotal:        { label: "Inversión total",                        actual: "82486",   mesAnt: "72356",   anioAnt: "72356",   fmt: "money_uyu", dir: "neutral", display: "" },
    ingresosSobreInversion:{ label: "Ingresos Google+Meta / Inversión total", actual: "45.6",    mesAnt: "45.15",   anioAnt: "43.43",   fmt: "roas_x1",   dir: "up",      display: "" }
  },
  metaAds: { filas: [
    { label: "Inversión",          actual: "32397",   mesAnt: "24868",   anioAnt: "11977",  fmt: "money_uyu",   dir: "neutral", display: "" },
    { label: "Valor compras",      actual: "1488491", mesAnt: "1527704", anioAnt: "885708", fmt: "money_uyu",   dir: "up",      display: "" },
    { label: "Compras atribuidas", actual: "456",     mesAnt: "458",     anioAnt: "293",    fmt: "int",         dir: "up",      display: "" },
    { label: "Costo por compra",   actual: "71.05",   mesAnt: "54.30",   anioAnt: "40.88",  fmt: "money_uyu_2", dir: "down",    display: "" },
    { label: "ROAS",               actual: "46",      mesAnt: "61",      anioAnt: "74",     fmt: "int",         dir: "up",      display: "" }
  ] },
  googleAds: { filas: [
    { label: "Inversión",          actual: "1246",  mesAnt: "1185",  anioAnt: "1508",  fmt: "money_usd",   dir: "neutral", display: "" },
    { label: "Valor compras",      actual: "56540", mesAnt: "43623", anioAnt: "56122", fmt: "money_usd",   dir: "up",      display: "" },
    { label: "Compras atribuidas", actual: "687",   mesAnt: "556",   anioAnt: "723",     fmt: "int",         dir: "up",      display: "" },
    { label: "Costo por compra",   actual: "1.81",  mesAnt: "2.13",  anioAnt: "2.09",    fmt: "money_usd_2", dir: "down",    display: "" },
    { label: "ROAS",               actual: "46.11", mesAnt: "42.68", anioAnt: "37.73",   fmt: "num2",        dir: "up",      display: "" }
  ] },
  desglose: { grupos: [
    { titulo: "COMPRAS", fmt: "num_trim", dir: "up", filas: [
      { label: "Branded EM",  actual: "197", mesAnt: "119", anioAnt: "264",    display: "" },
      { label: "PMax",        actual: "449", mesAnt: "370", anioAnt: "422.73", display: "" },
      { label: "DSA Search",  actual: "41",  mesAnt: "68",  anioAnt: "36.5",   display: "" }
    ] },
    { titulo: "ROAS", fmt: "num2", dir: "up", filas: [
      { label: "Branded EM",  actual: "90.06", mesAnt: "45.38", anioAnt: "1098.45", display: "" },
      { label: "PMax",        actual: "43.95", mesAnt: "39.21", anioAnt: "23.40",   display: "" },
      { label: "DSA Search",  actual: "13.24", mesAnt: "21.53", anioAnt: "24.35",   display: "" }
    ] }
  ] },
  lectura: {
    items: [
      { lead: "Corrección de ROAS en Meta (junio 2026):", texto: "En el reporte anterior se informó un ROAS de Meta de 24x para junio. Ese número incluía la inversión en campañas de branding dentro del cálculo. El ROAS real de junio, sin ese ajuste, fue 61x, y es el valor que se usa de aquí en adelante como base de comparación mes a mes." },
      { lead: "Panorama general:", texto: "Julio mantuvo un buen nivel de actividad en el e-commerce. Si bien la facturación total y las compras tuvieron una leve baja frente a junio, se mantienen claramente por encima del mismo mes del año anterior. A su vez, los ingresos y compras atribuidos a medios pagos crecieron frente al mes anterior, aumentando su aporte al resultado del canal online." },
      { lead: "Meta Ads:", texto: "La plataforma mantuvo prácticamente el mismo volumen de compras que en junio y continúa mostrando un crecimiento importante frente al año anterior. La mayor inversión del mes generó una baja en la eficiencia agregada frente a junio. De todas formas, al igual que mencionamos el mes pasado, en Meta conviven campañas de performance y campañas de marca con objetivos diferentes, por lo que el resultado no debe evaluarse únicamente a partir del ROAS general." },
      { lead: "Google Ads:", texto: "Julio mostró una evolución positiva: aumentaron las compras y el valor atribuido, mientras bajó el costo por compra y mejoró el ROAS. La recuperación de Branded EM fue uno de los principales destaques luego de los ajustes realizados sobre las búsquedas vinculadas a “Mundo Mascota”, mientras que PMax continuó creciendo y concentrando el mayor volumen de compras. DSA Search, en cambio, mostró una menor eficiencia durante el mes." }
    ],
    legend: { pos: "Resultado favorable", neg: "Resultado desfavorable", neutral: "Referencia / sin veredicto" }
  },
  benchmark: {
    titulo: "BENCHMARK DEL RUBRO · PET FOOD / MASCOTAS",
    intro: "No existen reportes públicos de ROAS específicos para Uruguay o Latinoamérica en el rubro de mascotas. Como referencia internacional, la categoría Pets & Animals promedió durante 2025 los siguientes valores (fuente: Triple Whale / Focus Digital, sobre más de 35.000 cuentas):",
    filas: [
      { label: "Meta Ads",            valor: "1,58x", nota: "promedio del rubro" },
      { label: "Google Ads",          valor: "2,84x", nota: "promedio del rubro" },
      { label: "Blended (combinado)", valor: "2,50x", nota: "promedio del rubro" }
    ],
    cierre: "El ROAS de Espacio Mascota en julio (46x en Meta y 46,11x en Google) está muy por encima de este promedio internacional. Esto no es directamente comparable uno a uno —los benchmarks miden mercados más grandes y competitivos, con otra escala de inversión— pero de todas formas confirma que la cuenta opera con una eficiencia sensiblemente superior a la del rubro en general.",
    fuente: "Fuente: Triple Whale & Focus Digital, datos anuales 2025 (rule1.ai). No hay benchmark oficial publicado para el mercado uruguayo."
  },
  glosario: { titulo: "GLOSARIO", items: GLOSARIO_DEFAULT.map(function (x) { return { t: x.t, d: x.d }; }) },
  footer: "Fuente: GA4, Meta Ads y Google Ads · TC USD/UYU 40,20 (promedio mensual, cotización interbancaria DGI/BCU)"
};
