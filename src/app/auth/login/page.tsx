"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createSupabaseBrowser } from "~/lib/supabase/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { Header } from "~/components/header";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const supabase = createSupabaseBrowser();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			const { data: authData, error } = await supabase.auth.signInWithPassword({
				email: data.email,
				password: data.password,
			});

			if (error) {
				console.error("Login error:", error);
				toast.error("Login failed", {
					description: error.message || "Invalid email or password. Please check your credentials.",
				});
				setIsLoading(false);
				return;
			}

			if (!authData.user) {
				toast.error("Login failed", {
					description: "No user data returned. Please try again.",
				});
				setIsLoading(false);
				return;
			}

			// Success! Show toast and redirect
			toast.success("Logged in successfully!", {
				description: "Redirecting to dashboard...",
			});

			// Small delay to show success message, then redirect
			setTimeout(() => {
				const redirectTo = searchParams.get("redirect") || "/new";
				router.push(redirectTo);
				router.refresh();
			}, 500);
		} catch (error) {
			console.error("Unexpected login error:", error);
			toast.error("An error occurred", {
				description: error instanceof Error ? error.message : "Please try again later",
			});
			setIsLoading(false);
		}
	};


	return (
		<>
			<Header hideUserMenu />
			<div className="flex min-h-screen items-center justify-center bg-white p-4">
				<div className="w-full max-w-md space-y-8">
					{/* Header */}
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
						<p className="text-muted-foreground text-gray-600">
							Enter your credentials to access your account
						</p>
					</div>

					{/* Card */}
					<div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Input
										id="email"
										type="email"
										placeholder="name@example.com"
										className="bg-white"
										{...register("email")}
									/>
									{errors.email && (
										<p className="text-sm text-red-500">{errors.email.message}</p>
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
							</div>

							<Button
								type="submit"
								className="w-full font-semibold"
								disabled={isLoading}
							>
								{isLoading ? "Signing in..." : "Sign In with Email"}
							</Button>
						</form>

						<div className="mt-6">
							<Link
								href="/auth/signup"
								className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
							>
								Need an account?
							</Link>
						</div>
					</div>
				</div>
			</div></>
	);
}

