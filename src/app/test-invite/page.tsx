"use client";

import { InviteUserForm } from "~/components/auth/InviteUserForm";
import { InvitationsList } from "~/components/auth/InvitationsList";
import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function TestInvitePage() {
	const { data: user } = api.useUtils().auth.getInvitations;

	return (
		<div className="container mx-auto p-8 max-w-4xl">
			<Card>
				<CardHeader>
					<CardTitle>Test Invitation System</CardTitle>
					<CardDescription>
						Use this page to test the invitation flow. You must be logged in as SysAdmin or Management.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-8">
					<div>
						<h2 className="text-xl font-semibold mb-4">Send Invitation</h2>
						<InviteUserForm />
					</div>

					<div>
						<h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
						<InvitationsList />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

