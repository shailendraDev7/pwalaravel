import { precacheAndRoute } from 'workbox-precaching';
     import { registerRoute } from 'workbox-routing';
     import { NetworkFirst, CacheFirst } from 'workbox-strategies';
     import { CacheableResponsePlugin } from 'workbox-cacheable-response';
     import { ExpirationPlugin } from 'workbox-expiration';

     precacheAndRoute(self.__WB_MANIFEST);

     // Cache Supabase API responses
     registerRoute(
       ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/rest/v1/products'),
       new CacheFirst({
         cacheName: 'products',
         plugins: [
           new CacheableResponsePlugin({ statuses: [0, 200] }),
           new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60 }), // 7 days
         ],
       })
     );

     registerRoute(
       ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/rest/v1/carts'),
       new NetworkFirst({
         cacheName: 'carts',
         plugins: [
           new CacheableResponsePlugin({ statuses: [0, 200] }),
         ],
       })
     );

     registerRoute(
       ({ url }) => url.origin.includes('supabase.co') && url.pathname.includes('/rest/v1/orders'),
       new NetworkFirst({
         cacheName: 'orders',
         plugins: [
           new CacheableResponsePlugin({ statuses: [0, 200] }),
         ],
       })
     );

     // Cache images
     registerRoute(
       ({ url }) => url.pathname.startsWith('/images/'),
       new CacheFirst({
         cacheName: 'images',
         plugins: [
           new CacheableResponsePlugin({ statuses: [0, 200] }),
           new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 days
         ],
       })
     );

     self.addEventListener('install', () => self.skipWaiting());
     self.addEventListener('activate', () => self.clients.claim());