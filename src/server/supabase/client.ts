import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

// Server-side Supabase client with service role key (for admin operations)
export const createSupabaseAdmin = () => {
	return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};

