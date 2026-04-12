// Minimal service worker for iOS PWA standalone navigation support.
// Without a registered service worker, iOS Safari may escape to the full
// browser chrome when performing client-side navigation inside a PWA.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

// Pass all fetch requests straight to the network.
// The mere presence of this handler causes iOS to treat all same-origin
// navigations as within-app (no Safari chrome breakout).
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request))
})
