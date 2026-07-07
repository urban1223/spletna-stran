const CACHE_NAME = 'historical-tuner-v1';
const ASSETS = [
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
  './ozadje.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});