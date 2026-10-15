# Lectura EPUB

Lector de EPUB y PDF en HTML + CSS + JS vanilla. El EPUB no usa librerías; el PDF carga PDF.js desde cdnjs (solo al abrir el primer PDF, se necesita internet esa vez; versión fijada en `js/pdf-reader.js`).

## Cómo abrir
1. Coloca un `icons/favicon.png` (o ajusta el `<link rel="icon">` de `index.html`).
2. Abre `index.html` en el navegador, o mejor sírvelo: `python -m http.server` y entra a `http://localhost:8000`.
3. Pulsa «Abrir EPUB» o arrastra un `.epub` a la ventana. Al recargar vuelves exactamente donde quedaste.

## Atajos
| Tecla | Acción |
|---|---|
| `←` / `→` | Página anterior / siguiente |
| `Ctrl+F` | Buscar en el libro |
| `Ctrl+E` | Abrir/cerrar ajustes |
| `Esc` | Cerrar menú y ajustes |
En móvil: desliza a izquierda/derecha para cambiar de página.

## Datos
Libros, posición y anotaciones: IndexedDB. Ajustes: localStorage. «Exportar datos» genera un JSON; «Importar» fusiona anotaciones y posición de libros que ya estén en el estante.

## Estructura
`epub-parser.js` ZIP/OPF/TOC/saneado · `reader.js` render y paginación · `navigation.js` sidebar, búsqueda, teclado · `annotations.js` subrayados · `settings.js` ajustes · `utils.js` helpers y IndexedDB.

## Cómo extender
Temas nuevos (variables en `main.css`), notas editables, subrayados en capítulos con fragmentos (`#id`) del TOC, sincronización remota del JSON, soporte de EPUB con diseño fijo o ZIP64.

## PDF
- Cada página del PDF funciona como un «capítulo» de una pantalla: progreso, estante, búsqueda, anotaciones y posición guardada igual que en EPUB.
- El índice usa el esquema (marcadores) del PDF; si no tiene, agrupa las páginas de 20 en 20.
- Tema claro/oscuro/sepia y ancho de columna aplican al PDF; tamaño de fuente, fuente e interlineado no (el PDF trae su propio diseño).
- Los PDF escaneados (solo imagen) no tienen texto: no se pueden subrayar ni buscar.
- No hay enlaces internos clicables dentro de las páginas.
