import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ── Constants ────────────────────────────────────────────────────────
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "pansar_token";
const JWT_SECRET = process.env.JWT_SECRET || "";

// Public paths — no token required
const PUBLIC_PREFIXES = [
  "/admin/login",
  "/api/admin/auth", // login / logout / me
];

// jose needs the secret as a Uint8Array
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    console.log("JWT verify failed:", err.message);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only intercept admin routes
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  // ── Case 1: Login page ──────────────────────────────────────────
  if (pathname.startsWith("/admin/login")) {
    // Agar already logged in hai, login page pe mat aane do — dashboard bhej do
    if (payload) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // ── Case 2: Other public paths (e.g. auth API) ──────────────────
  if (isPublic) return NextResponse.next();

  // ── Case 3: Protected routes — token required ────────────────────
  if (!payload) {
    // API routes → JSON 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    // Pages → redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Attach user info to request headers so API routes can read them
  const headers = new Headers(request.headers);
  headers.set("x-user-id", payload.id || "");
  headers.set("x-user-role", payload.role || "");
  headers.set("x-user-name", payload.name || "");

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

// import { NextResponse } from "next/server";

// export function middleware(req) {
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [],
// };
