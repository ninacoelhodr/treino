const CACHE_NAME = 'treino-app-v1.0.2';
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './styles/components.css', 
  './styles/responsive.css',
  './styles/pwa-install.css',
  './js/utils.js',
  './js/storage.js',
  './js/timer.js',
  './js/navigation.js',
  './js/exercise.js',
  './js/pwa-install.js',
  './js/app.js',
  './data/treinoJana.json',
  './data/treinoLeandro.json',
  './manifest.json',
  './icons/halteres.png',
  './icons/mulher.png',
  './icons/academia.png'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Cache addAll failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim control of all clients
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(response) {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(function() {
          // Network failed, return a fallback response for HTML requests
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Background sync for workout data
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync-workout') {
    event.waitUntil(syncWorkoutData());
  }
});

// Push notifications (for future features)
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Hora do treino!',
    icon: './icons/halteres.png',
    badge: './icons/halteres.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Iniciar Treino',
        icon: './icons/halteres.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: './icons/halteres.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Treino App', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for version checks and other communication
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'CHECK_VERSION') {
    // Send back version info
    event.ports[0].postMessage({
      version: CACHE_NAME,
      timestamp: Date.now()
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync workout data function
async function syncWorkoutData() {
  try {
    // This could sync data with a server in the future
    console.log('Background sync triggered for workout data');
    
    // For now, just clean up old data
    const allCaches = await caches.keys();
    const oldCaches = allCaches.filter(cacheName => 
      cacheName.startsWith('treino-app-') && cacheName !== CACHE_NAME
    );
    
    await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
    
    return Promise.resolve();
  } catch (error) {
    console.error('Background sync failed:', error);
    return Promise.reject(error);
  }
}