import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hospital } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "~/server/auth/rbac";

export const hospitalRouter = createTRPCRouter({
	/**
	 * Get all hospitals (for SysAdmin)
	 */
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const user = requireRole(ctx.user, ["SysAdmin"]);
		return await ctx.db.select().from(hospital).orderBy(hospital.name);
	}),

	/**
	 * Get hospital by ID
	 */
	getById: protectedProcedure
		.input(z.object({ hospital_id: z.number() }))
		.query(async ({ ctx, input }) => {
			const [hospitalData] = await ctx.db
				.select()
				.from(hospital)
				.where(eq(hospital.hospital_id, input.hospital_id))
				.limit(1);

			if (!hospitalData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Hospital not found",
				});
			}

			return hospitalData;
		}),
});

