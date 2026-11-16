/* Iglesia Gracia Internacional — Service Worker
   Cachea los recursos estáticos y sirve una versión offline.
   Cambia CACHE_VERSION al publicar una actualización. */
var CACHE_VERSION = "igracia-v6";
var OFFLINE_URL = "index.html";

var PRECACHE = [
  "./",
  "index.html",
  "soy-nuevo.html",
  "galeria.html",
  "donaciones.html",
  "comunidad.html",
  "contacto.html",
  "404.html",
  "manifest.webmanifest",
  "assets/css/fonts.css",
  "assets/css/styles.css",
  "assets/fonts/poppins-400.woff2",
  "assets/fonts/poppins-600.woff2",
  "assets/fonts/playfair-display-600.woff2",
  "assets/js/config.js",
  "assets/js/chatbot.js",
  "assets/js/youtube.js",
  "assets/js/main.js",
  "assets/img/logo-header.png",
  "assets/img/logo-splash.png",
  "assets/img/logo-footer.png",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/img/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(function (cache) {
        return cache.addAll(PRECACHE);
      })
      .then(function () {
        return self.skipWaiting();
      })
      .catch(function () {})
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key !== CACHE_VERSION;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Datos de YouTube: siempre intentar la red para mostrar el estado real. */
  if (url.pathname.indexOf("/assets/data/youtube.") > -1) {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match(request);
      })
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;

      return fetch(request).then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});
