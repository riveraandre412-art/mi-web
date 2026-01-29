// sw.js
const CACHE_NAME = 'amor-pwa-v1';
const STATIC_ASSETS = [
  './',
  'index.html',           // cambia si tu archivo se llama diferente
  'index2.html',
  'index3.html',
  'FUTBOL.HTML',
  'GYM.HTML',
  'recuerdo1.html',
  'recuerdo2.html',
  'dis_ind_2.css',
  'rec1.css',
  'rec2.css',
  'fut.css',
  'dis_gym.css',
  'pozole.css',
  'dis.ind3.css',
  'perfil.png',
  'gym.png',
  'Futbol.png',
  'fut2.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => console.error('Error al precachear:', err))
  );
  // Saltar waiting → activar inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Tomar control inmediatamente
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones no GET o de otros orígenes
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache first para assets estáticos
        if (cachedResponse) {
          return cachedResponse;
        }

        // Network first + fallback a cache si falla
        return fetch(event.request)
          .then((networkResponse) => {
            // No cachear si no es válido (ej. 404, errores)
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clonar y cachear respuesta dinámica
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Fallback offline (puedes crear una página offline.html si quieres)
            return caches.match('./');
          });
      })
  );
});