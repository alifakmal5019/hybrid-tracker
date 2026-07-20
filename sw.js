const CACHE_NAME = 'hybrid-tracker-v2';

// Use relative paths (no leading slash) so it works on any domain/subpath
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Install - cache assets with error handling
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Cache each asset individually so one failure doesn't break all
                return Promise.all(
                    ASSETS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn('Failed to cache:', url, err);
                            return null;
                        })
                    )
                );
            })
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
    // Skip non-GET requests and external URLs
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if (response) return response;

                return fetch(e.request)
                    .then(networkResponse => {
                        // Cache successful responses
                        if (networkResponse && networkResponse.status === 200) {
                            const cloned = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(e.request, cloned))
                                .catch(err => console.warn('Cache put failed:', err));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Offline fallback for navigation requests
                        if (e.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});