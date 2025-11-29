import { createBrowserClient } from "@supabase/ssr";
import { env } from "~/env";

// Client-side Supabase client
export const createSupabaseBrowser = () => {
	return createBrowserClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);
};

