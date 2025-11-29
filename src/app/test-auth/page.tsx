"use client";

import { api } from "~/trpc/react";
import { createSupabaseBrowser } from "~/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";

export default function TestAuthPage() {
	const router = useRouter();
	const supabase = createSupabaseBrowser();
	const { data: user } = api.useUtils().auth.getInvitations;

	const handleLogout = async () => {
		await supabase.auth.signOut();
		toast.success("Logged out");
		router.push("/auth/login");
		router.refresh();
	};

	return (
		<div className="container mx-auto p-8 max-w-4xl">
			<Card>
				<CardHeader>
					<CardTitle>Auth Test Page</CardTitle>
					<CardDescription>
						Test authentication status and user information
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h3 className="font-semibold mb-2">Current User Info</h3>
						<p className="text-sm text-muted-foreground">
							Check the browser console for user data, or use tRPC to fetch user info.
						</p>
					</div>

					<div className="flex gap-4">
						<Button onClick={handleLogout} variant="outline">
							Logout
						</Button>
						<Button onClick={() => router.push("/auth/login")} variant="outline">
							Go to Login
						</Button>
						<Button onClick={() => router.push("/test-invite")} variant="outline">
							Test Invitations
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

