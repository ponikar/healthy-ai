"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getClientAccessToken, authenticatedFetch } from "~/lib/auth/client-jwt";
import { toast } from "sonner";

export default function TestJWTPage() {
	const [token, setToken] = useState<string | null>(null);
	const [verifiedUser, setVerifiedUser] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const handleGetToken = async () => {
		setLoading(true);
		try {
			const accessToken = await getClientAccessToken();
			if (accessToken) {
				setToken(accessToken);
				toast.success("Token retrieved");
			} else {
				toast.error("No token available. Please login first.");
			}
		} catch (error) {
			toast.error("Failed to get token");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyToken = async () => {
		if (!token) {
			toast.error("No token to verify");
			return;
		}

		setLoading(true);
		try {
			const response = await authenticatedFetch("/api/auth/verify");
			if (response.ok) {
				const user = await response.json();
				setVerifiedUser(user);
				toast.success("Token verified successfully");
			} else {
				const error = await response.json();
				toast.error(error.error || "Token verification failed");
			}
		} catch (error) {
			toast.error("Failed to verify token");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-8 max-w-4xl">
			<Card>
				<CardHeader>
					<CardTitle>JWT Token Testing</CardTitle>
					<CardDescription>
						Test JWT token functionality. Make sure you're logged in first.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div>
							<Button onClick={handleGetToken} disabled={loading}>
								{loading ? "Loading..." : "Get My JWT Token"}
							</Button>
						</div>

						{token && (
							<div className="space-y-2">
								<Label>Your JWT Token (first 50 chars):</Label>
								<Input
									value={token.substring(0, 50) + "..."}
									readOnly
									className="font-mono text-xs"
								/>
								<p className="text-sm text-muted-foreground">
									Full token length: {token.length} characters
								</p>
							</div>
						)}
					</div>

					<div className="space-y-4">
						<div>
							<Button
								onClick={handleVerifyToken}
								disabled={!token || loading}
								variant="outline"
							>
								Verify Token
							</Button>
						</div>

						{verifiedUser && (
							<div className="space-y-2 p-4 bg-muted rounded-lg">
								<Label>Verified User Info:</Label>
								<pre className="text-sm overflow-auto">
									{JSON.stringify(verifiedUser, null, 2)}
								</pre>
							</div>
						)}
					</div>

					<div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
						<h3 className="font-semibold">How to use JWT tokens:</h3>
						<ul className="text-sm space-y-1 list-disc list-inside">
							<li>Get token: Call <code>/api/auth/token</code></li>
							<li>Verify token: Call <code>/api/auth/verify</code> with Bearer token</li>
							<li>Use in API calls: Add <code>Authorization: Bearer {"<token>"}</code> header</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

