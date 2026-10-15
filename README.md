# Lector EBook

## Cómo abrir
1. Abre `index.html` en el navegador, o liveserver de vsCode.
2. Pulsa «Abrir Libro» o arrastra un `.epub` o `.pdf` a la ventana. Al recargar vuelves exactamente donde quedaste.

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

## PDF
- Cada página del PDF funciona como un «capítulo» de una pantalla: progreso, estante, búsqueda, anotaciones y posición guardada igual que en EPUB.
- El índice usa el esquema (marcadores) del PDF; si no tiene, agrupa las páginas de 20 en 20.
- Tema claro/oscuro/sepia y ancho de columna aplican al PDF; tamaño de fuente, fuente e interlineado no (el PDF trae su propio diseño).
- Los PDF escaneados (solo imagen) no tienen texto: no se pueden subrayar ni buscar.