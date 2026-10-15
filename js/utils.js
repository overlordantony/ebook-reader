/** utils.js — espacio de nombres global `App` y utilidades compartidas. */
const App = window.App = {};
App.$ = (s, r = document) => r.querySelector(s);

/** Crea un elemento. El texto se agrega con append (nunca innerHTML). */
App.el = (tag, attrs = {}, ...hijos) => {
  const e = document.createElement(tag);
  for (const k in attrs) (k in e) ? (e[k] = attrs[k]) : e.setAttribute(k, attrs[k]);
  e.append(...hijos);
  return e;
};
/** Vacía un nodo sin usar innerHTML. */
App.limpiar = n => { while (n.firstChild) n.firstChild.remove(); };
App.guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
App.leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
App.debounce = (f, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };

/* ---- IndexedDB: almacén "libros" (metadatos, posición, anotaciones) y "archivos" (el .epub) ---- */
let _db;
const abrirDB = () => new Promise((ok, err) => {
  const r = indexedDB.open('lectura-epub', 1);
  r.onupgradeneeded = () => { r.result.createObjectStore('libros', { keyPath: 'id' }); r.result.createObjectStore('archivos', { keyPath: 'id' }); };
  r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error);
});
const tx = async (st, modo, fn) => {
  _db = _db || await abrirDB();
  return new Promise((ok, err) => {
    const t = _db.transaction(st, modo), rq = fn(t.objectStore(st));
    t.oncomplete = () => ok(rq.result); t.onerror = () => err(t.error);
  });
};
App.db = {
  put: (s, v) => tx(s, 'readwrite', o => o.put(v)),
  get: (s, id) => tx(s, 'readonly', o => o.get(id)),
  todos: s => tx(s, 'readonly', o => o.getAll()),
  del: (s, id) => tx(s, 'readwrite', o => o.delete(id)),
};
