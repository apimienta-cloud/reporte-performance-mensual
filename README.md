# Generador de reporte de performance mensual

Web app de una sola página: cargás los datos del mes en un formulario y te
arma el reporte de *Performance Ecommerce* (Meta + Google Ads) listo para
exportar a PDF con el diseño del reporte de referencia.

No tiene backend ni build. **Se abre con doble clic en `index.html`.**

## Uso

1. Abrí `index.html` en el navegador (Chrome recomendado para el PDF).
2. Al abrir por primera vez viene cargado el ejemplo *Espacio Mascota · Julio 2026*.
   Editá los campos del panel izquierdo; la vista previa se actualiza sola.
3. Botón **Guardar PDF** → en el diálogo de impresión elegí *Guardar como PDF*,
   tamaño **A4**, márgenes **Predeterminados**, y activá **Gráficos de fondo**.
4. Lo que cargás queda guardado en el navegador (localStorage). Para llevar el
   mes a otra máquina o guardarlo en el repo, usá **Exportar JSON** /
   **Importar JSON**.

## Cómo se calculan las variaciones

Para cada métrica cargás **tres valores**: mes actual, mes anterior y mismo mes
del año anterior. La app calcula el `%`, la flecha (▲ ▼ ●) y el color:

- **Dirección "Subir es bueno"** (ingresos, compras, ROAS…): ▲ verde, ▼ rojo.
- **Dirección "Bajar es bueno"** (costo por compra / CPA): ▲ rojo, ▼ verde.
- **Dirección "Sin veredicto"** (inversión): siempre gris.
- Diferencia menor al 0,5 % → `● 0%` en gris.

El campo **"Mostrar como"** permite forzar el texto de un número (p. ej. escribir
`45,6x` o `US$1.508,27`) sin afectar el cálculo del `%`.

Los números se pueden pegar con separadores (`1.527.704`, `71,05`, `US$1.246`).

## Estructura

```
index.html            markup + carga de assets
assets/
  data.js             DEFAULTS (plantilla en blanco) + EXAMPLE (Espacio Mascota)
  app.js              estado, cálculo de deltas, render de la vista y del panel
  app.css             layout de pantalla (panel + preview)
  report.css          el documento en sí y las reglas @media print / @page
ejemplos/
  espacio-mascota-julio-2026.json   datos del ejemplo, para Importar JSON
```

## Notas

- El reporte está pensado para **2 páginas A4**: página 1 = cabecera + KPIs +
  tablas; página 2 = lectura del mes + benchmark + glosario.
- El glosario y el benchmark vienen precargados y son editables.
- Multi-cliente: cliente, logos (se suben como imagen), monedas, TC y los
  encabezados de columna son todos campos de texto.
