// Service worker: cachea la app para uso offline (network-first para tener siempre lo último online)
const CACHE = 'edad-metabolica-v2';
const ASSETS = ['./', './index.html', './edad-metabolica.html', './html2pdf.bundle.min.js', './manifest.json', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(Promise.all([
    caches.keys().then(ks => Promise.all(ks.map(k => k !== CACHE ? caches.delete(k) : null))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return resp; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
