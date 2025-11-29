import { redirect } from "next/navigation";
import { getCurrentUser } from "~/server/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { InvitationsList } from "~/components/auth/InvitationsList";
import { LogoutButton } from "~/components/auth/LogoutButton";

export default async function DashboardPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/login");
	}

	return (
		<div className="container mx-auto p-8 max-w-6xl">
			<div className="mb-8 flex justify-between items-center">
				<div>
					<h1 className="text-4xl font-bold mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome, {user.name} ({user.role})
					</p>
				</div>
				<LogoutButton />
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>User Information</CardTitle>
						<CardDescription>Your account details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<p><strong>Email:</strong> {user.email}</p>
						<p><strong>Role:</strong> {user.role}</p>
						{user.hospital_id && (
							<p><strong>Hospital ID:</strong> {user.hospital_id}</p>
						)}
						<p><strong>Permissions:</strong> {user.permissions}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common tasks</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{(user.role === "SysAdmin" || user.role === "Management") && (
							<Link href="/test-invite">
								<Button variant="outline" className="w-full">
									Manage Invitations
								</Button>
							</Link>
						)}
						<Link href="/test-jwt">
							<Button variant="outline" className="w-full">
								Test JWT Tokens
							</Button>
						</Link>
						<Link href="/">
							<Button variant="outline" className="w-full">
								Go to Home
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>

			{(user.role === "SysAdmin" || user.role === "Management") && (
				<div className="mt-8">
					<Card>
						<CardHeader>
							<CardTitle>Invitations</CardTitle>
							<CardDescription>
								Manage user invitations for your {user.role === "SysAdmin" ? "organization" : "hospital"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<InvitationsList
								hospitalId={user.hospital_id ?? undefined}
								userRole={user.role === "SysAdmin" || user.role === "Management" ? user.role : undefined}
							/>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

