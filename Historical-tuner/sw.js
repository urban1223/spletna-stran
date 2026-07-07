const CACHE_NAME = 'historical-tuner-v2';

// Lokalne datoteke za vnaprejšnje predpomnjenje (za takojšnje offline delovanje).
const CORE_ASSETS = [
  './',
  './index.html',
  './aron.html',
  './earlyfrench.html',
  './just.html',
  './kirnberger.html',
  './meantone4.html',
  './meantone6.html',
  './pytagorean.html',
  './rameau.html',
  './rousseau.html',
  './valotti.html',
  './violin.html',
  './werkmeister.html',
  './style.css',
  './tuner.js',
  './manifest.json',
  './ozadje.jpg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Lokalne datoteke: stale-while-revalidate (postrezi iz predpomnilnika, tiho posodobi).
  if (sameOrigin) {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req)
            .then((res) => {
              if (res && res.ok) cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached || (req.mode === 'navigate' ? cache.match('./index.html') : undefined));
          return cached || network;
        })
      )
    );
    return;
  }

  // Zunanji viri (CDN): cache-first (nespremenljive, verzionirane knjižnice).
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        })
      )
    )
  );
});
