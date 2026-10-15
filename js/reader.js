/** reader.js — render del capítulo, paginación por columnas y persistencia de posición. */
(() => {
const cont = App.$('#contenido'), pag = App.$('#pagina');
const estilo = document.head.appendChild(App.el('style'));
const S = { libro: null, cap: 0, pag: 0, npag: 1, frac: 0, w: 0, gap: 48, pct: 0, tok: 0 };
const R = App.Reader = { S };

const guardarPos = App.debounce(() => {
  if (!App.rec) return;
  App.rec.pos = { cap: S.cap, frac: S.frac }; App.rec.pct = S.pct; App.db.put('libros', App.rec);
}, 400);

/** Recalcula las páginas del capítulo (al cargar, rotar, redimensionar o cambiar ajustes). */
const recargarPdf = App.debounce(() => R.recargar(), 150);
R.paginar = ya => {
  if (!S.libro) return;
  if (S.libro.pdf && ya !== true) return recargarPdf(); // PDF: se re-renderiza a la nueva escala
  const w = pag.clientWidth, h = pag.clientHeight; if (!w) return;
  S.w = w;
  Object.assign(cont.style, { width: w + 'px', height: h + 'px', columnWidth: w + 'px', columnGap: S.gap + 'px', columnFill: 'auto' });
  S.npag = Math.max(1, Math.round((cont.scrollWidth + S.gap) / (w + S.gap)));
  S.pag = Math.min(S.npag - 1, Math.floor(S.frac * S.npag + 1e-6));
  S.libro.paginas[S.cap] = S.npag;
  R.mover(false);
};
/** Desplaza a la pantalla actual (con transición suave si `anim`). */
R.mover = (anim = true) => {
  cont.style.transition = anim ? '' : 'none';
  cont.style.transform = `translateX(${-S.pag * (S.w + S.gap)}px)`;
  S.frac = S.pag / S.npag; R.estado(); guardarPos();
};
R.estado = () => {
  const n = S.libro.capitulos.length, p = (S.cap + (S.pag + 1) / S.npag) / n;
  S.pct = Math.round(100 * p);
  App.$('#est').textContent = S.libro.pdf ? `Página ${S.cap + 1}/${n} · ${S.pct}%` : `Cap. ${S.cap + 1}/${n} · Pág. ${S.pag + 1}/${S.npag} · ${S.pct}%`;
  App.$('#prog-fill').style.width = S.pct + '%'; App.$('#prog-txt').textContent = S.pct + '%';
  App.$('#barra').value = Math.round(1000 * (S.cap + S.pag / S.npag) / n);
};
/** Página (columna) en la que está un elemento del capítulo. */
R.pagDe = el => {
  const r = el.getClientRects()[0] || el.getBoundingClientRect();
  return Math.max(0, Math.min(S.npag - 1, Math.floor((r.left - cont.getBoundingClientRect().left + 1) / (S.w + S.gap))));
};
R.mostrar = el => { if (el) { S.pag = R.pagDe(el); R.mover(); } };

/** Abre el capítulo `cap` en la fracción `frac` (0..1); `despues` se ejecuta tras paginar. */
R.ir = async (cap, frac = 0, despues) => {
  const L = S.libro; if (!L) return;
  cap = Math.max(0, Math.min(L.capitulos.length - 1, cap));
  const t = ++S.tok, { frag, css } = await App.Epub.cargar(L, cap);
  if (t !== S.tok) return; // llegó una navegación más reciente
  S.cap = cap; S.frac = frac; estilo.textContent = css;
  App.limpiar(cont); cont.append(frag);
  App.Ann.aplicar(cap); App.Nav.marcarBusqueda();
  const rep = App.debounce(R.paginar, 100);
  cont.querySelectorAll('img').forEach(i => i.addEventListener('load', rep));
  App.$('#cab').textContent = L.capitulos[cap].titulo;
  R.paginar(true); App.Nav.resaltarIndice(); App.Ann.panel();
  if (despues) despues();
};
R.recargar = () => R.ir(S.cap, S.frac);
R.sig = () => { if (!S.libro) return; if (S.pag < S.npag - 1) { S.pag++; R.mover(); } else if (S.cap < S.libro.capitulos.length - 1) R.ir(S.cap + 1); };
R.ant = () => { if (!S.libro) return; if (S.pag > 0) { S.pag--; R.mover(); } else if (S.cap > 0) R.ir(S.cap - 1, 1); };

/** Abre un EPUB (File/Blob). Si `rec` existe, restaura posición y anotaciones. */
R.abrir = async (archivo, rec) => {
  try {
    const esPdf = /\.pdf$/i.test(archivo.name) || archivo.type === 'application/pdf';
    const L = esPdf ? await App.Pdf.abrir(archivo) : await App.Epub.abrir(archivo);
    const id = rec ? rec.id : `${archivo.name}|${archivo.size}|${archivo.lastModified}`;
    if (!rec) {
      rec = await App.db.get('libros', id);
      if (!rec) {
        rec = { id, titulo: L.titulo, autor: L.autor, portada: L.portada, pos: { cap: 0, frac: 0 }, pct: 0, ann: [] };
        await App.db.put('archivos', { id, archivo }); await App.db.put('libros', rec);
      }
    }
    App.rec = rec; S.libro = L; App.Ann.lista = rec.ann;
    App.guardar('ultimo', id);
    App.$('#titulo').textContent = L.titulo; App.$('#autor').textContent = L.autor;
    const im = App.$('#portada');
    if (im.src.startsWith('blob:')) URL.revokeObjectURL(im.src);
    if (L.portada) { im.src = URL.createObjectURL(L.portada); im.hidden = false; } else im.hidden = true;
    App.Nav.cache = {}; App.Nav.q = ''; App.Nav.indice(L);
    App.$('#vacio').hidden = true;
    await R.ir(rec.pos.cap, rec.pos.frac);
  } catch (e) { alert('No se pudo abrir el archivo: ' + e.message); }
};
/** Reabre el último libro leído. */
R.restaurar = async () => {
  const id = App.leer('ultimo', null); if (!id) return;
  const [rec, a] = await Promise.all([App.db.get('libros', id), App.db.get('archivos', id)]);
  if (rec && a) R.abrir(a.archivo, rec);
};
// Reaccionar a rotación, redimensionado y cambios del sidebar
new ResizeObserver(App.debounce(R.paginar, 120)).observe(pag);
})();
