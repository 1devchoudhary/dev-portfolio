import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/sessionToken";

// Optimistic gate for /admin pages. The real check is verifySession() in each page and action.
export async function proxy(request: NextRequest) {
  // Only gate page loads. Server action POSTs must reach the action, which checks the
  // session itself and returns a readable error instead of an unusable redirect.
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const { pathname } = request.nextUrl;
  const loggedIn = await isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    return loggedIn ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!loggedIn) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
