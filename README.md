# Lector EBook

Lector de **EPUB** y **PDF** en HTML + CSS + JavaScript vanilla, sin frameworks. El EPUB no usa librerías; el PDF usa [PDF.js](https://mozilla.github.io/pdf.js/) en local.

## Cómo abrir
1. Descarga `pdf.min.mjs` y `pdf.worker.min.mjs` (misma versión de PDF.js) y colócalos en `js/`, junto a `pdf-reader.js`. Solo se cargan al abrir el primer PDF.
2. Sirve la carpeta con **Live Server** de VS Code o con `python -m http.server` y abre `http://localhost:…`.
   - Con doble clic (`file://`) el EPUB funciona, pero el PDF **no**: los módulos y el worker de PDF.js no cargan desde `file://`.
3. Pulsa «Abrir libro» o arrastra un `.epub` o `.pdf` a la ventana. Al recargar vuelves exactamente donde quedaste.

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
- No hay enlaces internos clicables dentro de las páginas.

## Estructura
```
index.html
css/   main.css · sidebar.css · reader.css
js/    utils.js · epub-parser.js · pdf-reader.js · settings.js
       annotations.js · reader.js · navigation.js
       pdf.min.mjs · pdf.worker.min.mjs      ← los descargas tú
icons/ favicon.png
```
Orden de carga (importa): `utils` → `epub-parser` → `pdf-reader` → `settings` → `annotations` → `reader` → `navigation`.

## Reutilizarlo en otro proyecto
Está pensado para vivir solo, pero si lo unes a otros proyectos, esto es lo que puede chocar:
- **Global JS:** todo cuelga de `window.App` (también existe la constante global `App`). Si otro proyecto usa ese nombre, renómbralo en todos los archivos.
- **Almacenamiento:** localStorage usa las claves `aj` y `ultimo`; IndexedDB usa la base `lectura-epub` (almacenes `libros` y `archivos`). Prefíjalas si compartes origen con otra app.
- **CSS global:** `main.css` define `*`, `body` (flex, `overflow:hidden`), `[hidden]`, `button`, `.btn` y `.fila`; `sidebar.css` y `reader.css` usan ids como `#sidebar`, `#lector`, `#pagina`, `#contenido` y clases como `.nota`, `.libro`, `.cap`, `.flecha`. Si lo montas dentro de otra página, encapsula todo bajo un contenedor propio.
- **DOM esperado:** los scripts buscan por id los elementos de `index.html` (`#contenido`, `#pagina`, `#barra`, `#colores`, `#ajustes`…). Copia esa estructura completa.

## Cómo extender
Temas nuevos (variables en `main.css`), notas editables, enlaces internos en PDF, sincronización remota del JSON de exportación, soporte de EPUB de diseño fijo o de ZIP64.
