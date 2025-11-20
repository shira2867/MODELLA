import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/look/")) {
    const token = req.cookies.get("authToken"); 
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/welcome";
      url.searchParams.set("redirectLookId", pathname.split("/look/")[1]);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/look/:path*"],
};
