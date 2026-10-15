# Lector EBook
Lector de **EPUB** y **PDF** en HTML + CSS + JavaScript vanilla, sin frameworks. El EPUB no usa librerías; el PDF usa [PDF.js](https://mozilla.github.io/pdf.js/) en local.

## Atajos
| Tecla | Acción |
|---|---|
| `←` / `→` | Página anterior / siguiente |
| `Ctrl+F` | Buscar en el libro |
| `Ctrl+E` | Abrir/cerrar ajustes |
| `Esc` | Cerrar menú y ajustes |

En móvil: desliza a izquierda/derecha para cambiar de página.

## Funciones
- **Sidebar:** portada, título, autor, progreso, índice (tomos → capítulos), notas, búsqueda y estante de libros. En móvil se abre como drawer.
- **Anotaciones:** selecciona texto y elige color (amarillo, verde, rosa, azul), con nota opcional. Se pueden borrar una a una o por capítulo.
- **Ajustes:** tamaño, fuente, interlineado, ancho de columna y tema (claro, oscuro, sepia).

## Datos
- Libros, posición y anotaciones: IndexedDB. Ajustes y último libro abierto: localStorage.
- «Exportar datos» genera un JSON; «Importar» fusiona anotaciones y posición de los libros que ya estén en el estante.

## EPUB
- El ZIP se lee en memoria con `DecompressionStream`; no hace falta JSZip.
- Los capítulos se leen como XHTML estricto (con respaldo a HTML) y se sanean con lista blanca de etiquetas y atributos: sin scripts, sin eventos, sin recursos remotos.
- Las clases e ids del libro se prefijan con `x-` y su CSS se limita al área de lectura, así que no chocan con las clases de la app (`.nota`, `.libro`, `.btn`…). Se descartan del CSS del libro la fuente, los colores, los saltos de página y las reglas de `html`/`body`, para que mandes tú con los ajustes.

## PDF
- Cada página del PDF funciona como un «capítulo» de una pantalla: progreso, estante, búsqueda, anotaciones y posición guardada igual que en EPUB.
- El índice usa el esquema (marcadores) del PDF; si no tiene, agrupa las páginas de 20 en 20.
- Tema claro/oscuro/sepia y ancho de columna aplican al PDF; tamaño de fuente, fuente e interlineado no (el PDF trae su propio diseño).
- Los PDF escaneados (solo imagen) no tienen texto: no se pueden subrayar ni buscar.

## Estructura
```
index.html
css/   main.css · sidebar.css · reader.css
js/    utils.js · epub-parser.js · pdf-reader.js · settings.js
       annotations.js · reader.js · navigation.js
       pdf.min.mjs · pdf.worker.min.mjs
icons/ favicon.png
```
Orden de carga (importa): `utils` → `epub-parser` → `pdf-reader` → `settings` → `annotations` → `reader` → `navigation`.