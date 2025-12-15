import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/look",
  "/closet",
  "/profile",
  "/looks",
  "/create-look",
  "/about",
  "/complete-profile",
  "/checklist",
  "/mycloset",
  "/mylooks",
  "/newcloth",
  "/stylefeed",
  "/sharelookall",
  "/sharelookpersonal",
  "/sharelook",
  "/home",
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const authToken = req.cookies.get("authToken")?.value;
  const userId = req.cookies.get("userId")?.value;

  const isLoggedIn = Boolean(authToken || userId);

  if (!isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/welcome";

    // 👇 Save the full original path (including query params)
    const nextPath = `${pathname}${search}`;
    url.searchParams.set("next", nextPath);

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/look/:path*",
    "/closet/:path*",
    "/profile/:path*",
    "/looks/:path*",
    "/create-look/:path*",
    "/about/:path*",
    "/complete-profile/:path*",
    "/checklist/:path*",
    "/mycloset/:path*",
    "/mylooks/:path*",
    "/newcloth/:path*",
    "/stylefeed/:path*",
    "/sharelookall/:path*",
    "/sharelookpersonal/:path*",
    "/sharelook/:path*",
    "/home/:path*",
  ],
};
