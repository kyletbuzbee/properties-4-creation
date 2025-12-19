/**
 * Service Worker for Properties 4 Creations PWA
 * Implements stale-while-revalidate caching strategy for optimal performance
 */

const CACHE_VERSION = "v2";
const STATIC_CACHE = `p4c-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `p4c-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `p4c-images-${CACHE_VERSION}`;

// Cache size limits
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;

// Cache expiration (7 days in milliseconds)
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

// Resources to cache on install (critical assets)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/properties.html",
  "/contact.html",
  "/apply.html",
  "/impact.html",
  "/transparency.html",
  "/privacy.html",
  "/terms.html",
  "/thank-you.html",
  "/resources.html",
  "/faq.html",
  "/offline.html",
  "/manifest.json",
  "/css/style.css",
  "/js/main.js",
  "/js/ui-header.js",
  "/js/accessibility-enhanced.js",
];

/**
 * Install event - cache static assets
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        // Continue even if some assets fail to cache
        return self.skipWaiting();
      }),
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName.startsWith("p4c-") &&
                !cacheName.includes(CACHE_VERSION)
              );
            })
            .map((cacheName) => caches.delete(cacheName)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

/**
 * Fetch event - implement stale-while-revalidate strategy
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return;

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === "image") {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle static assets (CSS, JS)
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle dynamic requests (API, JSON)
  event.respondWith(handleDynamicRequest(request));
});

/**
 * Handle navigation requests with network-first, cache fallback
 */
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    return (
      caches.match("/offline.html") ||
      new Response("<h1>Offline</h1><p>Please check your connection.</p>", {
        headers: { "Content-Type": "text/html" },
      })
    );
  }
}

/**
 * Handle image requests with cache-first, network fallback
 */
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Return cached image immediately, update in background
    updateImageCache(request);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    // Return placeholder for failed images
    return new Response("", { status: 404 });
  }
}

/**
 * Handle static assets with stale-while-revalidate
 */
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);

  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(STATIC_CACHE);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

/**
 * Handle dynamic requests with stale-while-revalidate
 */
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Check if cached response is expired
  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get("sw-cache-timestamp");
    const isExpired =
      cachedTime && Date.now() - parseInt(cachedTime) > CACHE_EXPIRATION;

    if (!isExpired) {
      // Update cache in background
      updateDynamicCache(request, cache);
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Add timestamp header for expiration tracking
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: new Headers({
          ...Object.fromEntries(networkResponse.headers.entries()),
          "sw-cache-timestamp": Date.now().toString(),
        }),
      });

      cache.put(request, responseWithTimestamp.clone());
      await limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);

      return networkResponse;
    }

    return cachedResponse || networkResponse;
  } catch (error) {
    return cachedResponse || new Response("Network error", { status: 503 });
  }
}

/**
 * Update image cache in background
 */
async function updateImageCache(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silently fail - cached version is still valid
  }
}

/**
 * Update dynamic cache in background
 */
async function updateDynamicCache(request, cache) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: new Headers({
          ...Object.fromEntries(networkResponse.headers.entries()),
          "sw-cache-timestamp": Date.now().toString(),
        }),
      });

      cache.put(request, responseWithTimestamp);
    }
  } catch (error) {
    // Silently fail - cached version is still valid
  }
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  );
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    // Remove oldest entries (first in, first out)
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
  }
}

/**
 * Background sync for form submissions
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-forms") {
    event.waitUntil(syncPendingForms());
  }
});

/**
 * Sync pending form submissions
 */
async function syncPendingForms() {
  try {
    const db = await openIndexedDB();
    const pendingForms = await getPendingForms(db);

    for (const form of pendingForms) {
      try {
        const response = await fetch(form.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form.data),
        });

        if (response.ok) {
          await deletePendingForm(db, form.id);
        }
      } catch (error) {
        // Will retry on next sync
      }
    }
  } catch (error) {
    // IndexedDB not available or error
  }
}

/**
 * Open IndexedDB for form storage
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("p4c-forms", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pending-forms")) {
        db.createObjectStore("pending-forms", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
}

/**
 * Get pending forms from IndexedDB
 */
function getPendingForms(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-forms"], "readonly");
    const store = transaction.objectStore("pending-forms");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Delete pending form from IndexedDB
 */
function deletePendingForm(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-forms"], "readwrite");
    const store = transaction.objectStore("pending-forms");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Push notification handler
 */
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '"/images/icons/icon-192x192.png',
      badge: '"/images/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

/**
 * Notification click handler
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

/**
 * Message handler for cache management
 */
self.addEventListener("message", (event) => {
  if (event.data) {
    switch (event.data.type) {
      case "SKIP_WAITING":
        self.skipWaiting();
        break;

      case "CLEAR_CACHE":
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName)),
            );
          }),
        );
        break;

      case "CACHE_URLS":
        if (event.data.urls) {
          event.waitUntil(
            caches.open(DYNAMIC_CACHE).then((cache) => {
              return cache.addAll(event.data.urls);
            }),
          );
        }
        break;
    }
  }
});
