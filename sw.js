self.addEventListener('install', event => {
  console.log('SW installed at: ', new Date().toLocaleTimeString());
  event.waitUntil(
    caches.open('IB_Cache').then((cache) => {
      return cache.addAll(['index.html',
        'css/styles.css',
        'js/index.js',
        'offline.html'
      ])
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW activated at: ', new Date().toLocaleTimeString());
});

self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
      .then((response) => {
        if (!navigator.onLine) {
          if (response) {
            return response;
          } else {
            return caches.match(new Request('offline.html'));
          }
        } else {
          return updateCache(event.request);
        }
      })
    )
  }
});

self.addEventListener('push', (event) => {
  if (event.data) {
    createNotification(event.data.text());
  }
})

const createNotification = (text) => {
  self.registration.showNotification('InstaBlam: ', {
    body: text,
    icon: 'images/icons/camera-apple-touch.png'
  })
}

async function updateCache(request) {
  return fetch(request)
    .then((response) => {
      if (response) {
        return caches.open('IB_Cache')
          .then((cache) => {
            return cache.put(request, response.clone())
              .then(() => {
                return response;
              })
          });
      }
    })
}