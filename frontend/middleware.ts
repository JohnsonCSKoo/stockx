import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware to check if user is authenticated for protected routes
 */
export function middleware(request: NextRequest) {
    const userSession = request.cookies.get("user-session")

    // Check if the route requires authentication
    const isProtectedRoute = ["/portfolio", "/transactions", "/rankings"].some((route) =>
        request.nextUrl.pathname.startsWith(route),
    )

    // If it's a protected route and user is not logged in, redirect to login
    if (isProtectedRoute && !userSession) {
        return NextResponse.redirect(new URL("/create-account", request.url))
    }

    // If user is logged in and trying to access login page, redirect to dashboard
    if (userSession && request.nextUrl.pathname === "/create-account") {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/portfolio/:path*", "/transactions/:path*", "/rankings/:path*", "/create-account"],
}
