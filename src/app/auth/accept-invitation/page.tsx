"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { createSupabaseBrowser } from "~/lib/supabase/client";

const acceptInvitationSchema = z.object({
	name: z.string().min(1, "Name is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

export default function AcceptInvitationPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const supabase = createSupabaseBrowser();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<AcceptInvitationFormData>({
		resolver: zodResolver(acceptInvitationSchema),
	});

	const acceptMutation = api.auth.acceptInvitation.useMutation({
		onSuccess: async () => {
			toast.success("Account created successfully!");
			// Sign in the user
			const email = searchParams.get("email");
			if (email) {
				const password = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value;
				if (password) {
					await supabase.auth.signInWithPassword({ email, password });
				}
			}
			router.push("/");
			router.refresh();
		},
		onError: (error) => {
			toast.error("Failed to accept invitation", {
				description: error.message,
			});
		},
	});

	useEffect(() => {
		if (!token) {
			toast.error("Invalid invitation link");
			router.push("/auth/login");
		}
	}, [token, router]);

	const onSubmit = (data: AcceptInvitationFormData) => {
		if (!token) {
			toast.error("Invalid invitation token");
			return;
		}

		acceptMutation.mutate({
			token,
			name: data.name,
			password: data.password,
		});
	};

	if (!token) {
		return null;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-white p-4">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
					<p className="text-muted-foreground text-gray-600">
						Enter your details below to accept the invitation
					</p>
				</div>

				{/* Card */}
				<div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									className="bg-white"
									{...register("name")}
								/>
								{errors.name && (
									<p className="text-sm text-red-500">{errors.name.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Input
									id="password"
									type="password"
									placeholder="Password"
									className="bg-white"
									{...register("password")}
								/>
								{errors.password && (
									<p className="text-sm text-red-500">
										{errors.password.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Confirm Password"
									className="bg-white"
									{...register("confirmPassword")}
								/>
								{errors.confirmPassword && (
									<p className="text-sm text-red-500">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>
						</div>

						<Button
							type="submit"
							className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold"
							disabled={acceptMutation.isPending}
						>
							{acceptMutation.isPending
								? "Creating account..."
								: "Create Account"}
						</Button>
					</form>

					<p className="mt-6 text-center text-xs text-gray-500">
						By clicking continue, you agree to our{" "}
						<Link href="#" className="underline underline-offset-4 hover:text-blue-600 text-blue-600">
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link href="#" className="underline underline-offset-4 hover:text-blue-600 text-blue-600">
							Privacy Policy
						</Link>
						.
					</p>
				</div>

				{/* Footer */}
				<p className="text-center text-sm text-gray-600">
					Already have an account?{" "}
					<Link
						href="/auth/login"
						className="underline underline-offset-4 hover:text-blue-600 text-blue-600 font-medium"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}

