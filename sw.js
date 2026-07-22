const CACHE_NAME = 'hybrid-tracker-v4';

const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Install - cache assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
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

// Activate - clean old caches and claim clients immediately
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
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if (response) return response;

                return fetch(e.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const cloned = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(e.request, cloned))
                                .catch(err => console.warn('Cache put failed:', err));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        if (e.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if (response) return response;

                return fetch(e.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const cloned = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(e.request, cloned))
                                .catch(err => console.warn('Cache put failed:', err));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        if (e.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if (response) return response;

                return fetch(e.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const cloned = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(e.request, cloned))
                                .catch(err => console.warn('Cache put failed:', err));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        if (e.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if (response) return response;

                return fetch(e.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const cloned = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(e.request, cloned))
                                .catch(err => console.warn('Cache put failed:', err));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        if (e.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});
