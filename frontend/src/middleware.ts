import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * iPhone/Android: serve lightweight static HTML for marketing pages only.
 * Do NOT rewrite /course/:id — checkout/purchase must use the React app.
 */
export function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent") || "";
  const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(ua);
  if (!isMobile) return NextResponse.next();

  const path = request.nextUrl.pathname;

  if (path === "/" || path === "/m") {
    return NextResponse.rewrite(new URL("/m.html", request.url));
  }

  if (path === "/courses") {
    return NextResponse.rewrite(new URL("/courses.html", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/m", "/courses"],
};
