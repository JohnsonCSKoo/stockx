"use server"

import { cookies } from "next/headers"
import {CreateUserRequest, UserResponse} from "@/@types/user";
import {createUser} from "@/api/userApi";
import {getUserPortfolio} from "@/api/portfolioApi";

/**
 * Creates a temporary account with the given username
 * Stores the user information in a cookie
 */
export async function createTemporaryAccount(username: string) {
    // Validate username
    if (!username || username.trim().length < 1) {
        throw new Error("Username is required")
    }

    // Create a simple user object
    const user: CreateUserRequest = {
        username: username,
    };

    await createUser(user)
        .then((response) => {
            const data = response.data;
            cookies().set({
                name: "user-session",
                value: JSON.stringify(data),
                httpOnly: true,
                path: "/",
                maxAge: 60 * 60 * 24, // 24 hours
            })
            console.log("User created successfully:", response.data);

            return user;
        })
        .catch((error) => {
            console.error("Error creating user:", error);
        });
}

/**
 * Gets the current user from the session
 * Returns null if no user is logged in
 */
export async function getCurrentUser() {
    const userCookie = cookies().get("user-session")

    if (!userCookie?.value) {
        return null;
    }

    try {
        return JSON.parse(userCookie.value);
    } catch (error) {
        return null;
    }
}

/**
 * Gets the bearer token of the current user session
 */
export async function getToken() {
    const cookie = await getCurrentUser();
    if (cookie) {
        return cookie.token;
    }
    return null;
}

/**
 * Logs out the current user by removing the session cookie
 */
export async function logoutUser() {
    cookies().delete("user-session");
}

/**
* Retrieves the portfolio of the current user
*/
export async function getPortfolio() {

    const userCookie: UserResponse | null = await getCurrentUser();

    if (userCookie !== null) {
        await getUserPortfolio(userCookie.sessionId)
            .then((response) => {
                return response.data;
            }).catch((error) => {
                console.error("Error fetching portfolio:", error);
                return null;
            });
    }
}