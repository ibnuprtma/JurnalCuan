import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

// Routes yang bisa diakses tanpa login (termasuk halaman utama '/')
const PUBLIC_ROUTES = new Set([
  "/",
  "/manifest.json",
  "/site.webmanifest",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/auth/login",
  "/auth/logout",
  "/auth/callback",
  "/auth/profile",
]);

// Prefix yang bisa diakses tanpa login
const PUBLIC_PREFIXES = [
  "/auth/",       // Auth0 internal routes (/auth/login, /auth/callback, etc.)
  "/share/",      // Live Share Portfolio publik
  "/api/share/",  // API query data portfolio publik
  "/api/sync/",   // MT5 EA Webhook (autentikasi via API Key)
  "/api/news",    // Kalender berita publik
  "/api/market",  // API Kurs Live Frankfurter & Market data
  "/api/auth/",   // Auth0 internal API routes
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.endsWith(".json") || pathname.endsWith(".png") || pathname.endsWith(".ico") || pathname.endsWith(".svg") || pathname.endsWith(".webp") || pathname.endsWith(".jpg")) {
    return true;
  }
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan semua route publik dan file asset tanpa pengecekan sesi
  if (isPublicRoute(pathname)) {
    return await auth0.middleware(request);
  }

  // Jalankan Auth0 SDK middleware/proxy (menangani /auth/* routes & rolling session)
  const auth0Response = await auth0.middleware(request);

  // Jika Auth0 SDK me-redirect (mis. /auth/login -> Auth0 Universal Login, /auth/callback), teruskan langsung
  if (auth0Response.status >= 300 && auth0Response.status < 400) {
    return auth0Response;
  }

  // Helper untuk unauthenticated response
  const handleUnauthorized = () => {
    // Untuk API routes atau fetch request: kembalikan JSON 401 Unauthorized (mencegah CORS redirect)
    const isFetchOrApi =
      pathname.startsWith("/api/") ||
      pathname.endsWith(".json") ||
      request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("sec-fetch-dest") === "empty";

    if (isFetchOrApi) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Untuk Page navigation normal: redirect ke /auth/login dengan returnTo
    const loginUrl = new URL("/auth/login", request.nextUrl.origin);
    loginUrl.searchParams.set("returnTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  };

  // === ROUTE PROTECTION ===
  // 1. Cek keberadaan session cookie (__session / appSession)
  const sessionCookie =
    request.cookies.get("__session") || request.cookies.get("appSession");

  if (!sessionCookie) {
    return handleUnauthorized();
  }

  // 2. Cookie ada -> verifikasi sesi sungguhan dengan Auth0
  try {
    const session = await auth0.getSession(request);
    if (!session || !session.user) {
      return handleUnauthorized();
    }
  } catch {
    return handleUnauthorized();
  }

  return auth0Response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
