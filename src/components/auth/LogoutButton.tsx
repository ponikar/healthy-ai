"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "~/lib/supabase/client";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export function LogoutButton() {
	const router = useRouter();
	const supabase = createSupabaseBrowser();

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			toast.success("Logged out successfully");
			router.push("/auth/login");
			router.refresh();
		} catch (error) {
			toast.error("Failed to logout");
			console.error(error);
		}
	};

	return (
		<Button onClick={handleLogout} variant="outline">
			Logout
		</Button>
	);
}

