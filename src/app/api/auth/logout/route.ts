import { NextResponse } from "next/server";
import { createSupabaseServer } from "~/server/supabase/server";

export async function POST() {
	const supabase = await createSupabaseServer();
	await supabase.auth.signOut();
	return NextResponse.json({ success: true });
}

