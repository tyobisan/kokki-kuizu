const CACHE = 'kuni-flag-v8';

const STATIC = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Kaisei+Decol:wght@400;700&family=Zen+Maru+Gothic:wght@400;700&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネット優先→失敗したらキャッシュ（常に最新を取得）
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
