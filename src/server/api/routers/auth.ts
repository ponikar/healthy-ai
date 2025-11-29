import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users, invitations, hospital } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { createSupabaseAdmin } from "~/server/supabase/client";
import { getDefaultPermissions, canInviteRole } from "~/server/auth";
import { requireRole } from "~/server/auth/rbac";
import { randomBytes } from "crypto";

export const authRouter = createTRPCRouter({
	/**
	 * Send invitation to a user
	 * SysAdmin can invite Management
	 * Management can invite Doctor and Nurse
	 */
	inviteUser: protectedProcedure
		.input(
			z.object({
				email: z.string().email(),
				role: z.enum(["Management", "Doctor", "Nurse"]),
				hospital_id: z.number().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = requireRole(ctx.user, ["SysAdmin", "Management"]);

			// Check if user can invite this role
			if (!canInviteRole(user, input.role)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `You cannot invite users with role: ${input.role}`,
				});
			}

			// If inviting Management, hospital_id is optional (SysAdmin can create hospital admins)
			// If inviting Doctor/Nurse, hospital_id is required and must match user's hospital
			if (input.role === "Doctor" || input.role === "Nurse") {
				if (!input.hospital_id) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "hospital_id is required for Doctor and Nurse roles",
					});
				}
				if (user.hospital_id !== input.hospital_id) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You can only invite staff to your own hospital",
					});
				}
			} else if (input.role === "Management" && input.hospital_id) {
				// Verify hospital exists
				const [hospitalExists] = await ctx.db
					.select()
					.from(hospital)
					.where(eq(hospital.hospital_id, input.hospital_id))
					.limit(1);

				if (!hospitalExists) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Hospital not found",
					});
				}
			}

			// Check if user already exists
			const [existingUser] = await ctx.db
				.select()
				.from(users)
				.where(eq(users.email, input.email))
				.limit(1);

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User with this email already exists",
				});
			}

			// Check if there's a pending invitation
			const [existingInvitation] = await ctx.db
				.select()
				.from(invitations)
				.where(
					and(
						eq(invitations.email, input.email),
						eq(invitations.status, "pending"),
					),
				)
				.limit(1);

			if (existingInvitation) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "An invitation is already pending for this email",
				});
			}

			// Generate invitation token
			const token = randomBytes(32).toString("hex");
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

			// Create invitation
			const [invitation] = await ctx.db
				.insert(invitations)
				.values({
					email: input.email,
					role: input.role,
					hospital_id: input.hospital_id ?? null,
					invited_by: user.id,
					token,
					status: "pending",
					expires_at: expiresAt,
				})
				.returning();

			// TODO: Send invitation email with link
			// For now, we'll return the token (in production, send via email)
			const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/accept-invitation?token=${token}`;

			return {
				invitation_id: invitation.invitation_id,
				email: invitation.email,
				invitation_link: invitationLink,
				expires_at: invitation.expires_at,
			};
		}),

	/**
	 * Accept invitation and create user account
	 */
	acceptInvitation: protectedProcedure
		.input(
			z.object({
				token: z.string(),
				name: z.string().min(1),
				password: z.string().min(8),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Find invitation
			const [invitation] = await ctx.db
				.select()
				.from(invitations)
				.where(
					and(
						eq(invitations.token, input.token),
						eq(invitations.status, "pending"),
					),
				)
				.limit(1);

			if (!invitation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invitation not found or already used",
				});
			}

			// Check if expired
			if (new Date() > invitation.expires_at) {
				await ctx.db
					.update(invitations)
					.set({ status: "expired" })
					.where(eq(invitations.invitation_id, invitation.invitation_id));

				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invitation has expired",
				});
			}

			// Check if email matches current user (if logged in) or create new account
			const supabaseAdmin = createSupabaseAdmin();
			const currentUser = ctx.user;

			let authUserId: string;

			if (currentUser && currentUser.email === invitation.email) {
				// User is already logged in with this email
				authUserId = currentUser.id;
			} else {
				// Create new Supabase auth user
				const { data: authData, error: authError } =
					await supabaseAdmin.auth.admin.createUser({
						email: invitation.email,
						password: input.password,
						email_confirm: true, // Auto-confirm email
					});

				if (authError || !authData.user) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create user account",
					});
				}

				authUserId = authData.user.id;
			}

			// Create user in our users table
			const permissions = getDefaultPermissions(invitation.role);

			await ctx.db.insert(users).values({
				user_id: authUserId,
				name: input.name,
				email: invitation.email,
				role: invitation.role,
				hospital_id: invitation.hospital_id,
				permissions,
				is_active: true,
			});

			// Mark invitation as accepted
			await ctx.db
				.update(invitations)
				.set({
					status: "accepted",
					accepted_at: new Date(),
				})
				.where(eq(invitations.invitation_id, invitation.invitation_id));

			return {
				success: true,
				message: "Invitation accepted successfully",
			};
		}),

	/**
	 * Get pending invitations (for Management and SysAdmin)
	 */
	getInvitations: protectedProcedure
		.input(
			z
				.object({
					hospital_id: z.number().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const user = requireRole(ctx.user, ["SysAdmin", "Management"]);

			let query = ctx.db.select().from(invitations);

			// Management can only see invitations for their hospital
			if (user.role === "Management") {
				query = query.where(
					and(
						eq(invitations.hospital_id, user.hospital_id!),
						eq(invitations.status, "pending"),
					),
				);
			} else if (input?.hospital_id) {
				// SysAdmin can filter by hospital
				query = query.where(
					and(
						eq(invitations.hospital_id, input.hospital_id),
						eq(invitations.status, "pending"),
					),
				);
			} else {
				// SysAdmin can see all pending invitations
				query = query.where(eq(invitations.status, "pending"));
			}

			return await query;
		}),

	/**
	 * Cancel/revoke an invitation
	 */
	revokeInvitation: protectedProcedure
		.input(z.object({ invitation_id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const user = requireRole(ctx.user, ["SysAdmin", "Management"]);

			// Get invitation
			const [invitation] = await ctx.db
				.select()
				.from(invitations)
				.where(eq(invitations.invitation_id, input.invitation_id))
				.limit(1);

			if (!invitation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invitation not found",
				});
			}

			// Management can only revoke invitations for their hospital
			if (
				user.role === "Management" &&
				invitation.hospital_id !== user.hospital_id
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only revoke invitations for your hospital",
				});
			}

			// Delete invitation
			await ctx.db
				.delete(invitations)
				.where(eq(invitations.invitation_id, input.invitation_id));

			return { success: true };
		}),
});

