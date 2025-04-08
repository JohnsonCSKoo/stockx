import { NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * API route to get the current user session
 * This is called by the client to check if the user is logged in
 */
export async function GET() {
    const userCookie = (await cookies()).get("user-session")

    if (!userCookie?.value) {
        return NextResponse.json({ user: null })
    }

    try {
        const user = JSON.parse(userCookie.value)
        return NextResponse.json({ user })
    } catch (error) {
        return NextResponse.json({ user: null })
    }
}
