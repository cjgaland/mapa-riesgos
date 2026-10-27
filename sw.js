// ============================================================
//  sw.js — Service Worker · Mapa de Riesgos
//  Estrategia network-first con fallback a caché para uso offline.
//  Al cambiar cualquier archivo, incrementa CACHE_NAME.
//  Guarda también los motores de las apps hermanas que la app usa en vivo
//  (../amfe/logic.js, ../flujograma/logic.js y dibujo.js): están en el mismo
//  dominio, así que funcionan sin conexión igual que los archivos propios.
// ============================================================

const CACHE_NAME = "mapariesgos-v12";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./logic.js",
  "./contenido.js",
  "./xlsx.js",
  "./docx.js",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./favicon-32.png",
  "./favicon-16.png",
  "./icon-512.svg"
];
// Motores de las apps hermanas: se intentan guardar uno a uno (si alguno falla, no impide instalar la app)
// [eco]
const MOTORES = ["../amfe/logic.js", "../flujograma/logic.js", "../flujograma/dibujo.js"];
// [/eco]
/* [ind]
const MOTORES = ["./motores/amfe/logic.js", "./motores/flujograma/logic.js", "./motores/flujograma/dibujo.js"];
[/ind] */

self.addEventListener("install", event => {
  // Sin skipWaiting aquí: la versión nueva espera hasta que el usuario pulse
  // «Actualizar» en el aviso de la app (mensaje SKIP_WAITING).
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).then(() => Promise.all(MOTORES.map(u => cache.add(u).catch(() => null))))));
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      // Solo las cachés de esta app: las demás apps del ecosistema comparten el
      // mismo origen (cjgaland.github.io) y sus copias sin conexión no se tocan.
      .then(keys => Promise.all(keys.filter(k => k.startsWith("mapariesgos-") && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
