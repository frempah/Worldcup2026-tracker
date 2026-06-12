/**
 * World Cup 2026 Tracker — Service Worker
 * ★ BUMP CACHE_VER every time you deploy changes
 */
var CACHE_VER = 'wc2026-v10';
var PRECACHE  = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VER)
      .then(function(c) { return c.addAll(PRECACHE); })
      .then(function()  { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys.filter(function(k) { return k !== CACHE_VER; })
              .map(function(k)    { return caches.delete(k); })
        );
      })
      .then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET')                    return;
  if (e.request.url.includes('/api/'))                return;
  if (e.request.url.includes('googleapis'))          return;
  if (e.request.url.includes('jsdelivr'))            return;
  if (e.request.url.includes('unpkg'))               return;
  if (e.request.url.includes('paystack'))            return;
  if (e.request.url.includes('googlesyndication'))   return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var clone = res.clone();
          caches.open(CACHE_VER).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      });
    }).catch(function() {
      return caches.match('/index.html');
    })
  );
});
