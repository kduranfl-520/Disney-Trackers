/* Disney Trackers service worker — network first, offline fallback.
   Your tracked data lives in localStorage, never here, so updating this file can't touch it. */
const CACHE = 'disney-trackers-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(resp => {
        if (resp && resp.ok) { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return resp;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./') || caches.match('index.html')))
  );
});
