"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { toast } from "sonner";

const inviteSchema = z.object({
	email: z.string().email("Invalid email address"),
	role: z.enum(["Management", "Doctor", "Nurse"]),
	hospital_id: z.number().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteUserFormProps {
	hospitalId?: number;
	userRole?: "SysAdmin" | "Management";
	onSuccess?: () => void;
}

export function InviteUserForm({ hospitalId, userRole, onSuccess }: InviteUserFormProps) {
	const [open, setOpen] = useState(false);
	const utils = api.useUtils();

	// Get hospitals list for SysAdmin
	const { data: hospitals } = api.hospital.getAll.useQuery(undefined, {
		enabled: userRole === "SysAdmin" && open,
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
		reset,
	} = useForm<InviteFormData>({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			hospital_id: hospitalId,
		},
	});

	const inviteMutation = api.auth.inviteUser.useMutation({
		onSuccess: (data) => {
			toast.success("Invitation sent successfully!", {
				description: `Invitation link: ${data.invitation_link}`,
			});
			reset();
			setOpen(false);
			utils.auth.getInvitations.invalidate();
			onSuccess?.();
		},
		onError: (error) => {
			toast.error("Failed to send invitation", {
				description: error.message,
			});
		},
	});

	const role = watch("role");
	const selectedHospitalId = watch("hospital_id");

	// Reset form when dialog opens/closes
	useEffect(() => {
		if (open) {
			reset({
				hospital_id: hospitalId,
			});
		}
	}, [open, hospitalId, reset]);

	const onSubmit = (data: InviteFormData) => {
		// For Management users, always use their hospital_id
		// For SysAdmin inviting Management, use selected hospital_id (can be undefined)
		// For SysAdmin, hospital_id is optional when inviting Management
		const finalHospitalId = userRole === "Management" ? hospitalId : data.hospital_id;

		inviteMutation.mutate({
			email: data.email,
			role: data.role,
			hospital_id: finalHospitalId,
		});
	};

	// Determine available roles based on user role
	const availableRoles =
		userRole === "SysAdmin"
			? ["Management"]
			: userRole === "Management"
				? ["Doctor", "Nurse"]
				: [];

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Invite User</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite User</DialogTitle>
					<DialogDescription>
						Send an invitation to a new user. They will receive an email with
						instructions to create their account.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="user@example.com"
							{...register("email")}
						/>
						{errors.email && (
							<p className="text-sm text-red-500">{errors.email.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="role">Role</Label>
						<Select
							onValueChange={(value) =>
								setValue("role", value as "Management" | "Doctor" | "Nurse")
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent>
								{availableRoles.includes("Management") && (
									<SelectItem value="Management">Management</SelectItem>
								)}
								{availableRoles.includes("Doctor") && (
									<SelectItem value="Doctor">Doctor</SelectItem>
								)}
								{availableRoles.includes("Nurse") && (
									<SelectItem value="Nurse">Nurse</SelectItem>
								)}
							</SelectContent>
						</Select>
						{errors.role && (
							<p className="text-sm text-red-500">{errors.role.message}</p>
						)}
					</div>

					{/* Show hospital selection for SysAdmin when inviting Management */}
					{userRole === "SysAdmin" && role === "Management" && (
						<div className="space-y-2">
							<Label htmlFor="hospital">Hospital (Optional)</Label>
							<Select
								onValueChange={(value) => {
									if (value === "none") {
										setValue("hospital_id", undefined);
									} else {
										setValue("hospital_id", Number.parseInt(value));
									}
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a hospital (optional)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Hospital (General Admin)</SelectItem>
									{hospitals?.map((hosp) => (
										<SelectItem key={hosp.hospital_id} value={String(hosp.hospital_id)}>
											{hosp.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-sm text-muted-foreground">
								Select a hospital to assign this management user to, or leave blank for general admin.
							</p>
						</div>
					)}

					{/* Show info for Management inviting staff */}
					{userRole === "Management" && (role === "Doctor" || role === "Nurse") && (
						<p className="text-sm text-muted-foreground">
							This user will be assigned to your hospital.
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={inviteMutation.isPending}>
							{inviteMutation.isPending ? "Sending..." : "Send Invitation"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

