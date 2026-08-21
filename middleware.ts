import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

// Routes yang bisa diakses tanpa login (termasuk halaman utama '/')
const PUBLIC_ROUTES = new Set(["/", "/auth/login", "/auth/logout", "/auth/callback", "/auth/profile"]);

// Prefix yang bisa diakses tanpa login
const PUBLIC_PREFIXES = [
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
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Selalu jalankan Auth0 SDK middleware (menangani /auth/* routes & rolling session)
  const auth0Response = await auth0.middleware(request);

  // Jika Auth0 SDK me-redirect (mis. /auth/callback), teruskan langsung
  if (auth0Response.status >= 300 && auth0Response.status < 400) {
    return auth0Response;
  }

  // Izinkan semua route publik tanpa pengecekan sesi
  if (isPublicRoute(pathname)) {
    return auth0Response;
  }

  // Helper untuk unauthenticated response
  const handleUnauthorized = () => {
    // Untuk API routes: kembalikan JSON 401 Unauthorized (bukan redirect HTML agar fetch() tidak error CORS)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Untuk Page routes: redirect ke /auth/login dengan returnTo
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

  // 2. Cookie ada → verifikasi sesi sungguhan dengan Auth0
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
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
