"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { toast } from "sonner";
import { InviteUserForm } from "./InviteUserForm";

export function InvitationsList({
	hospitalId,
	userRole,
}: {
	hospitalId?: number;
	userRole?: "SysAdmin" | "Management";
}) {
	const utils = api.useUtils();
	const { data: invitations, isLoading } = api.auth.getInvitations.useQuery({
		hospital_id: hospitalId,
	});

	const revokeMutation = api.auth.revokeInvitation.useMutation({
		onSuccess: () => {
			toast.success("Invitation revoked");
			utils.auth.getInvitations.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to revoke invitation", {
				description: error.message,
			});
		},
	});

	if (isLoading) {
		return <div>Loading invitations...</div>;
	}

	if (!invitations || invitations.length === 0) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold">Pending Invitations</h3>
					<InviteUserForm hospitalId={hospitalId} userRole={userRole} />
				</div>
				<p className="text-muted-foreground">No pending invitations</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Pending Invitations</h3>
				<InviteUserForm hospitalId={hospitalId} userRole={userRole} />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Email</TableHead>
						<TableHead>Role</TableHead>
						<TableHead>Invited</TableHead>
						<TableHead>Expires</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{invitations.map((invitation) => (
						<TableRow key={invitation.invitation_id}>
							<TableCell>{invitation.email}</TableCell>
							<TableCell>{invitation.role}</TableCell>
							<TableCell>
								{invitation.created_at
									? new Date(invitation.created_at).toLocaleDateString()
									: "N/A"}
							</TableCell>
							<TableCell>
								{invitation.expires_at
									? new Date(invitation.expires_at).toLocaleDateString()
									: "N/A"}
							</TableCell>
							<TableCell>
								<Button
									variant="destructive"
									size="sm"
									onClick={() =>
										revokeMutation.mutate({
											invitation_id: invitation.invitation_id,
										})
									}
									disabled={revokeMutation.isPending}
								>
									Revoke
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

