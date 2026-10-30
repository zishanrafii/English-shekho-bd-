/* ═══════════════════════════════════════════════════════
   English Shekho — Service Worker
   Strategy: Network First (always try network, fallback to cache)
   Cache Version: bump এই number টা বাড়াও যখনই নতুন deploy করবে
   ═══════════════════════════════════════════════════════ */

const CACHE_NAME    = "english-shekho-v15";
const OFFLINE_PAGE  = "/index.html";

/* ── যেসব file সবসময় cache করে রাখব (App Shell) ── */
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/quiz-beginner.html",
  "/quiz-intermediate.html",
  "/quiz-advanced.html",
  "/grammar.html",
  "/chat.html",
  "/inbox.html",
  "/friends.html",
  "/leaderboard.html",
  "/profile.html",
  "/roadmap.html",
  "/live-class.html",
  "/challenges.html",
  "/vocab-dashboard.html",
  "/writing-lab.html",
  "/reading.html",
  "/listening.html",
  "/speaking.html",
  "/vocab-a1.html",
  "/vocab-a2.html",
  "/vocab-b1.html",
  "/vocab-b2.html",
  "/js/vocab-c2.js",
  "/js/vocab-c1.js",
  "/vocab-c2.html",
  "/vocab-c1.html",
  "/progress.html",
  "/about.html",
  "/styles/tokens.css",
  "/styles/ux-polish.css",
  "/onboarding.html",
  "/placement.html",
  "/data/placement-bank.json",
  "/data/plan-catalog.json",
  "/vocab-review.html",
  "/grammar-review.html",
  "/speaking-practice.html",
  "/writing-review.html",
  "/simulator.html",
  "/data/vocab-flags.json",
  "/data/dictionary.json",
  "/upgrade.html",
  "/coming-soon.html",
  "/js/firebase-config.js",
  "/js/vocab-a1.js",
  "/js/vocab-a2.js",
  "/manifest.json",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/branding/english-shekho-mark.png",
  "/assets/branding/english-shekho-logo.png"
];

/* ════════════════════════════════════════════════════
   INSTALL — App Shell precache
   ════════════════════════════════════════════════════ */
self.addEventListener("install", event => {
  console.log("[SW] Installing v14...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // প্রতিটা file আলাদা আলাদা cache করো — একটা fail করলে বাকিগুলো থামবে না
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err =>
            console.warn(`[SW] Precache failed for ${url}:`, err)
          )
        )
      );
    }).then(() => {
      console.log("[SW] Precache done.");
      return self.skipWaiting(); // নতুন SW সাথে সাথে activate হোক
    })
  );
});

/* ════════════════════════════════════════════════════
   ACTIVATE — পুরনো cache clean করো
   ════════════════════════════════════════════════════ */
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim()) // সব open tab এ নতুন SW নাও
  );
});

/* ════════════════════════════════════════════════════
   FETCH — Network First strategy
   ════════════════════════════════════════════════════ */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  /* ── Firebase, Agora, external API — cache করব না ── */
  if (
    url.hostname.includes("firebaseio.com")     ||
    url.hostname.includes("googleapis.com")     ||
    url.hostname.includes("firebaseapp.com")    ||
    url.hostname.includes("agora.io")           ||
    url.hostname.includes("sd-rtn.com")         ||
    url.hostname.includes("anthropic.com")      ||
    url.pathname.startsWith("/api/")            ||
    request.method !== "GET"
  ) {
    return; // browser কে default handle করতে দাও
  }

  /* ── Navigation request (page load) ── */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Network থেকে পেলে cache update করো
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          return response;
        })
        .catch(() => {
          // Offline: cache থেকে দাও, না পেলে index.html
          return caches.match(request).then(r => r || caches.match(OFFLINE_PAGE));
        })
    );
    return;
  }

  /* ── Static assets (JS, CSS, images, fonts) ── */
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() => {
        // Network নেই — cache থেকে দাও
        return caches.match(request);
      })
  );
});

/* ════════════════════════════════════════════════════
   MESSAGE — main thread থেকে SW কে control করা
   ════════════════════════════════════════════════════ */
self.addEventListener("message", event => {
  /* নতুন version deploy হলে force update করো */
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }

  /* Cache manually clear করো (settings page থেকে কাজে আসবে) */
  if (event.data === "clearCache") {
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => {
      event.source?.postMessage("cacheCleared");
    });
  }
});
