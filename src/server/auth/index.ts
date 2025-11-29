import { createSupabaseServer } from "~/server/supabase/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

export type UserRole = "Management" | "Doctor" | "Nurse" | "SysAdmin";

export type UserWithRole = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	hospital_id: number | null;
	permissions: string;
};

/**
 * Get the current authenticated user from Supabase and sync with our users table
 */
export const getCurrentUser = cache(async (): Promise<UserWithRole | null> => {
	const supabase = await createSupabaseServer();
	const {
		data: { user: authUser },
	} = await supabase.auth.getUser();

	if (!authUser) {
		return null;
	}

	// Get user from our users table
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.user_id, authUser.id))
		.limit(1);

	if (!user) {
		return null;
	}

	return {
		id: user.user_id,
		email: user.email,
		name: user.name,
		role: user.role as UserRole,
		hospital_id: user.hospital_id,
		permissions: user.permissions,
	};
});

/**
 * Check if user has a specific role
 */
export const hasRole = (user: UserWithRole | null, role: UserRole | UserRole[]): boolean => {
	if (!user) return false;
	const roles = Array.isArray(role) ? role : [role];
	return roles.includes(user.role);
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: UserWithRole | null, permission: string): boolean => {
	if (!user) return false;
	return user.permissions.split(",").includes(permission);
};

/**
 * Check if user belongs to a specific hospital
 */
export const belongsToHospital = (
	user: UserWithRole | null,
	hospitalId: number,
): boolean => {
	if (!user) return false;
	// SysAdmin can access all hospitals
	if (user.role === "SysAdmin") return true;
	return user.hospital_id === hospitalId;
};

/**
 * Get default permissions for a role
 */
export const getDefaultPermissions = (role: UserRole): string => {
	const permissions: Record<UserRole, string[]> = {
		SysAdmin: [
			"view_dashboard",
			"manage_users",
			"manage_hospitals",
			"manage_inventory",
			"view_reports",
			"invite_management",
			"system_config",
		],
		Management: [
			"view_dashboard",
			"manage_users",
			"manage_inventory",
			"view_reports",
			"invite_staff",
			"view_forecasts",
			"manage_schedules",
		],
		Doctor: [
			"view_dashboard",
			"view_forecasts",
			"view_patient_flow",
			"view_reports",
		],
		Nurse: [
			"view_dashboard",
			"view_forecasts",
			"view_patient_flow",
			"manage_patient_intake",
		],
	};

	return permissions[role].join(",");
};

/**
 * Check if user can invite a specific role
 */
export const canInviteRole = (
	user: UserWithRole | null,
	targetRole: UserRole,
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
