import { NextResponse, NextRequest } from "next/server";
import { checkAuth } from "./lib/helper";

export async function middleware(request: NextRequest) {
  const user = await checkAuth();

  if (["/signup", "/login"].includes(request.nextUrl.pathname) && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  //   if (
  //     request.nextUrl.pathname.startsWith("/admin") &&
  //     (!user || user.role !== "admin")
  //   ) {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};
