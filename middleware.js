// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes
const protectedPaths = [
  "/main/dashboard",
  "/main/events",
  "/main/meetings",
  "/main/availability"
];

export default clerkMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],

  afterAuth(auth, req) {
    console.log("Processing request for:", req.nextUrl.pathname);

    const isProtectedRoute = protectedPaths.some(path => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (!auth.userId && isProtectedRoute) {
      console.log("Unauthorized access attempt:", req.nextUrl.pathname);
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },

  onError(err, _req) {
    console.error("Auth Error:", err.message);
    return NextResponse.json(
      { error: "Authentication error", message: err.message },
      { status: 401 }
    );
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|favicon.ico|.*\\.).*)",
    "/api/(.*)"
  ]
};