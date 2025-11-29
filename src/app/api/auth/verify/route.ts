import { NextRequest, NextResponse } from "next/server";
import { extractTokenFromHeader, getUserFromToken } from "~/server/auth/jwt";

/**
 * API route to verify JWT token and get user info
 * Useful for external services or API clients
 * 
 * Usage:
 * GET /api/auth/verify
 * Headers: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("Authorization");
		const token = extractTokenFromHeader(authHeader);

		if (!token) {
			return NextResponse.json(
				{ error: "No token provided" },
				{ status: 401 },
			);
		}

		const user = await getUserFromToken(token);

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid or expired token" },
				{ status: 401 },
			);
		}

		// Return user info (without sensitive data)
		return NextResponse.json({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			hospital_id: user.hospital_id,
		});
	} catch (error) {
		console.error("Token verification error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

