"use client";

import { createSupabaseBrowser } from "~/lib/supabase/client";

/**
 * Client-side JWT token utilities
 */

/**
 * Get the current user's JWT access token
 * Useful for making authenticated API calls
 */
export async function getClientAccessToken(): Promise<string | null> {
	const supabase = createSupabaseBrowser();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return session?.access_token ?? null;
}

/**
 * Make an authenticated fetch request with JWT token
 */
export async function authenticatedFetch(
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	const token = await getClientAccessToken();

	if (!token) {
		throw new Error("No access token available");
	}

	return fetch(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	});
}

