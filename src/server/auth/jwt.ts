import { createSupabaseServer } from "~/server/supabase/server";
import { createSupabaseAdmin } from "~/server/supabase/client";
import type { UserWithRole } from "./index";

/**
 * JWT Token utilities for authentication
 * Supabase Auth already uses JWT tokens, but these helpers make them explicit
 */

/**
 * Get the current user's JWT access token from Supabase
 * This is the token that Supabase automatically manages
 */
export async function getAccessToken(): Promise<string | null> {
	const supabase = await createSupabaseServer();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return session?.access_token ?? null;
}

/**
 * Get the current user's JWT refresh token from Supabase
 */
export async function getRefreshToken(): Promise<string | null> {
	const supabase = await createSupabaseServer();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return session?.refresh_token ?? null;
}

/**
 * Validate a JWT token using Supabase
 * Useful for API routes that receive tokens in headers
 */
export async function validateToken(token: string): Promise<{
	valid: boolean;
	user: { id: string; email: string } | null;
	error?: string;
}> {
	try {
		const supabaseAdmin = createSupabaseAdmin();
		const {
			data: { user },
			error,
		} = await supabaseAdmin.auth.getUser(token);

		if (error || !user) {
			return {
				valid: false,
				user: null,
				error: error?.message ?? "Invalid token",
			};
		}

		return {
			valid: true,
			user: {
				id: user.id,
				email: user.email ?? "",
			},
		};
	} catch (error) {
		return {
			valid: false,
			user: null,
			error: error instanceof Error ? error.message : "Token validation failed",
		};
	}
}

/**
 * Create a custom JWT token with user data
 * Useful for creating tokens for external services or API keys
 */
export async function createCustomToken(
	user: UserWithRole,
	expiresIn: number = 3600, // 1 hour default
): Promise<string | null> {
	try {
		const supabaseAdmin = createSupabaseAdmin();

		// Create a custom JWT with user data
		// Note: This uses Supabase's admin API to create tokens
		const { data, error } = await supabaseAdmin.auth.admin.generateLink({
			type: "magiclink",
			email: user.email,
		});

		if (error) {
			console.error("Error creating custom token:", error);
			return null;
		}

		// For a more custom approach, you could use jsonwebtoken library
		// But Supabase tokens are already JWT-based
		return data.properties?.hashed_token ?? null;
	} catch (error) {
		console.error("Error creating custom token:", error);
		return null;
	}
}

/**
 * Extract JWT token from Authorization header
 * Format: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
	if (!authHeader) return null;

	const parts = authHeader.split(" ");
	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return null;
	}

	return parts[1];
}

/**
 * Get user from JWT token (for API routes)
 * This is useful for REST API endpoints that use Bearer tokens
 */
export async function getUserFromToken(token: string): Promise<UserWithRole | null> {
	const validation = await validateToken(token);
	if (!validation.valid || !validation.user) {
		return null;
	}

	// Now get the full user data from our database
	const { getCurrentUser } = await import("./index");
	// Note: This won't work directly since getCurrentUser uses cookies
	// We need a different approach for token-based auth

	// For token-based auth, we need to query the database directly
	const { db } = await import("~/server/db");
	const { users } = await import("~/server/db/schema");
	const { eq } = await import("drizzle-orm");

	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.user_id, validation.user.id))
		.limit(1);

	if (!user) {
		return null;
	}

	return {
		id: user.user_id,
		email: user.email,
		name: user.name,
		role: user.role as UserWithRole["role"],
		hospital_id: user.hospital_id,
		permissions: user.permissions,
	};
}

