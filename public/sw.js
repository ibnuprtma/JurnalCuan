// ==============================================================================
// JURNAL CUAN — PWA SERVICE WORKER (v1.0)
// ==============================================================================

const CACHE_NAME = "jurnal-cuan-v1.0";

// Aset statis inti yang dicache saat service worker di-install
const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/manifest.json",
  "/favicon.png",
  "/icon-192.png",
  "/icon-512.png",
];

// ------------------------------------------------------------------------------
// 1. INSTALL EVENT
// ------------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Aktifkan service worker baru tanpa menunggu tab ditutup
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn("[SW] Pre-cache warning:", err);
      })
  );
});

// ------------------------------------------------------------------------------
// 2. ACTIVATE EVENT (Cleanup cache lama)
// ------------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        // Ambil kendali halaman aktif seketika
        return self.clients.claim();
      })
  );
});

// ------------------------------------------------------------------------------
// 3. FETCH EVENT (Strategi Caching Cerdas)
// ------------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya proses request GET dari origin yang sama
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // JANGAN CACHE API & Auth0 (harus selalu live realtime & aman)
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.includes("_next/webpack-hmr") ||
    url.pathname.includes("__nextjs")
  ) {
    return;
  }

  // A. STRATEGI: Cache First untuk Aset Statis (CSS, JS, Fonts, Icons, Images)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // B. STRATEGI: Network First untuk Navigasi Halaman (HTML)
  // Menjamin data & UI terbaru dimuat jika online, fallback ke cache jika offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Jika offline, coba ambil dari cache halaman yang sama
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback ke dashboard jika tersedia di cache
          const cachedDashboard = await caches.match("/dashboard");
          if (cachedDashboard) {
            return cachedDashboard;
          }
          const cachedHome = await caches.match("/");
          if (cachedHome) {
            return cachedHome;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="id">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Offline — Jurnal Cuan</title>
                <style>
                  body {
                    margin: 0;
                    padding: 2rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #080b11;
                    color: #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                    text-align: center;
                  }
                  .card {
                    background: #0f172a;
                    border: 1px solid #1e293b;
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    max-width: 400px;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
                  }
                  h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #10b981; }
                  p { font-size: 0.875rem; color: #94a3b8; line-height: 1.5; }
                  button {
                    margin-top: 1.5rem;
                    background: #10b981;
                    color: #020617;
                    font-weight: 700;
                    padding: 0.6rem 1.25rem;
                    border: none;
                    border-radius: 0.75rem;
                    cursor: pointer;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>📶 Mode Offline</h1>
                  <p>Koneksi internet Anda sedang terputus. Buka kembali halaman saat terhubung ke internet untuk memperbarui data transaksi dan pasar.</p>
                  <button onclick="window.location.reload()">Coba Muat Ulang</button>
                </div>
              </body>
            </html>`,
            {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        })
    );
  }
});
