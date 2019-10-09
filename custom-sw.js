// @ts-ignore

const VERSION_NUMBER = 13; 

const CACHE_NAME = `static-v${VERSION_NUMBER}`;

  self.addEventListener('install', event => {
    console.log(`V${VERSION_NUMBER} Installing…`);
    
    // don't wait
    self.skipWaiting();
    
    // cache a cow SVG
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.add('offline.html'))
    );
  });  
  
  self.addEventListener('activate', (event) => {
  
    event.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if(key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }));
      })
    );
  });
  
  
  
  self.addEventListener('fetch', event => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    // request.mode of 'navigate' is unfortunately not supported in Chrome
    // versions older than 49, so we need to include a less precise fallback,
    // which checks for a GET request with an Accept: text/html header.
    if (event.request.mode === 'navigate' ||
        (event.request.method === 'GET' &&
         event.request.headers.get('accept').includes('text/html'))) {
      console.log('Handling fetch event for', event.request.url);
      console.log(caches);
      event.respondWith(
        fetch(event.request).catch(error => {
          // The catch is only triggered if fetch() throws an exception, which will most likely
          // happen due to the server being unreachable.
          // If fetch() returns a valid HTTP response with an response code in the 4xx or 5xx
          // range, the catch() will NOT be called. If you need custom handling for 4xx or 5xx
          // errors, see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response
          console.log('Fetch failed; returning offline page instead.', error);
          return caches.match('offline.html');
        })
      );
    }
  
    // If our if() condition is false, then this fetch handler won't intercept the request.
    // If there are any other fetch handlers registered, they will get a chance to call
    // event.respondWith(). If no fetch handlers call event.respondWith(), the request will be
    // handled by the browser as if there were no service worker involvement.
  });  
//   self.addEventListener('fetch', (event) => {
//       console.log('sw fetch')
//     const { request } = event;
  
//     // Always bypass for range requests, due to browser bugs
//     if (request.headers.has('range')) return;
//     event.respondWith(async function() {
//       // Try to get from the cache:
//       const cachedResponse = await caches.match(request);
//       if (cachedResponse) return cachedResponse;
  
//       try {
//         // Otherwise, get from the network
//         return await fetch(request);
//       } catch (err) {
//         // If this was a navigation, show the offline page:
//         if (request.mode === 'navigate') {
//           return caches.match('offline.html');
//         }
  
//         // Otherwise throw
//         throw err;
//       }
//     }());
//   });