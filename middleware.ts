import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "jeetlabs.in";
const REDIRECT_HOSTS = new Set(["my-portfolio.jeetlabs.in", "www.jeetlabs.in"]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (REDIRECT_HOSTS.has(host)) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
