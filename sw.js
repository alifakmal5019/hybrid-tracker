// SELF-DESTRUCT SERVICE WORKER
// This SW clears all caches and unregisters itself

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        self.clients.claim().then(function() {
            // Unregister this service worker after clearing caches
            return self.registration.unregister();
        })
    );
});

self.addEventListener('fetch', function(e) {
    // Pass through to network - no caching
    e.respondWith(fetch(e.request));
});
