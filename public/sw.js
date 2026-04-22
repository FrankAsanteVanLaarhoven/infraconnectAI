const CACHE_NAME = 'infraconnect-edge-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/brand/logo-symbol.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // STRICT BYPASS LAYER: Do not intercept API, WebSockets, Localhost Dev, or Next.js internal chunks
  const url = event.request.url;
  if (
    url.includes('/api/') || 
    url.includes('/socket.io/') ||
    url.includes('_next/webpack-hmr') ||
    url.includes('localhost') ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/event-stream'))
  ) {
    return;
  }
  
  // Suppress Mapbox telemetry blocked by client errors
  if (url.includes('events.mapbox.com')) {
    return event.respondWith(new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});
