const CACHE_NAME = 'hybrid-tracker-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install - cache assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if (response) return response;
                return fetch(e.request)
                    .then(networkResponse => {
                        // Don't cache API calls or non-GET requests
                        if (e.request.method !== 'GET' || 
                            e.request.url.includes('api')) {
                            return networkResponse;
                        }

                        const cloned = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(e.request, cloned));
                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback
                        if (e.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});
