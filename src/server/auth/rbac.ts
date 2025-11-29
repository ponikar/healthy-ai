import { TRPCError } from "@trpc/server";
import type { UserWithRole } from "./index";
import { hasRole, hasPermission, belongsToHospital } from "./index";

/**
 * Role-based access control helpers for tRPC procedures
 */

export const requireAuth = (user: UserWithRole | null): UserWithRole => {
	if (!user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be logged in to perform this action",
		});
	}
	return user;
};

export const requireRole = (
	user: UserWithRole | null,
	allowedRoles: UserWithRole["role"][],
): UserWithRole => {
	const authenticatedUser = requireAuth(user);
	if (!hasRole(authenticatedUser, allowedRoles)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
		});
	}
	return authenticatedUser;
};

export const requirePermission = (
	user: UserWithRole | null,
	permission: string,
): UserWithRole => {
	const authenticatedUser = requireAuth(user);
	if (!hasPermission(authenticatedUser, permission)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: `This action requires the following permission: ${permission}`,
		});
	}
	return authenticatedUser;
};

export const requireHospitalAccess = (
	user: UserWithRole | null,
	hospitalId: number,
): UserWithRole => {
	const authenticatedUser = requireAuth(user);
	if (!belongsToHospital(authenticatedUser, hospitalId)) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You do not have access to this hospital",
		});
	}
	return authenticatedUser;
};

/**
 * Check if user can invite a specific role
 */
export const canInviteRole = (
	user: UserWithRole | null,
	targetRole: UserWithRole["role"],
): boolean => {
	if (!user) return false;

	// SysAdmin can invite Management
	if (user.role === "SysAdmin" && targetRole === "Management") {
		return true;
	}

	// Management can invite Doctor and Nurse
	if (user.role === "Management" && (targetRole === "Doctor" || targetRole === "Nurse")) {
		return true;
	}

	return false;
};

