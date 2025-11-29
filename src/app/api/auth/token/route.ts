import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "~/server/auth/jwt";
import { getCurrentUser } from "~/server/auth";

/**
 * API route to get current user's JWT token
 * Useful for getting token to use in external API calls
 * 
 * Usage:
 * GET /api/auth/token
 * Returns: { token: string, expires_at: number }
 */
export async function GET(request: NextRequest) {
	try {
		const user = await getCurrentUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Not authenticated" },
				{ status: 401 },
			);
		}

		const token = await getAccessToken();

		if (!token) {
			return NextResponse.json(
				{ error: "No token available" },
				{ status: 401 },
			);
		}

		// Get token expiration from Supabase
		const { createSupabaseServer } = await import("~/server/supabase/server");
		const supabase = await createSupabaseServer();
		const {
			data: { session },
		} = await supabase.auth.getSession();

		return NextResponse.json({
			token,
			expires_at: session?.expires_at ?? null,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Token retrieval error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

