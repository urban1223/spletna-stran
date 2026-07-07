const CACHE_NAME = 'baroque-archive-v6';

// Seznam osnovnih datotek za takojšnje vnaprejšnje predpomnjenje
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './stil.css',
  './podatki.js',
  './manifest.json',
  './icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Installation - napolni predpomnilnik in aktiviraj nov SW takoj
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Čiščenje starih predpomnilnikov in prevzem kontrole nad vsemi zavihki
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Prestrezanje zahtevkov (Network First z osveževanjem predpomnilnika)
self.addEventListener('fetch', (e) => {
  // Obravnavaj samo lokalne datoteke
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then((response) => {
        // Če je odgovor veljaven, ga shrani/posodobi v predpomnilniku
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Če ni povezave (offline), vrni datoteko iz predpomnilnika
        return caches.match(e.request);
      })
  );
});