const CACHE_NAME = 'botond-site-v2';
const ASSETS = [
  './index.html',
  './style.css',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(res => res || fetch(req).then(resp => {
        if (resp.ok && req.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return resp;
      }).catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('./index.html').then(r => r || Response.error());
        }
        return Response.error();
      }))
    );
  }
});
