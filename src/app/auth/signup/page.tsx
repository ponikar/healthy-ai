"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { createSupabaseBrowser } from "~/lib/supabase/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { Header } from "~/components/header";

interface SignUpFormData {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
}

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<SignUpFormData>({
        email: "",
        password: "",
        fullName: "",
        phoneNumber: "",
    });

    const signUpMutation = useMutation({
        mutationFn: async (data: SignUpFormData) => {
            const supabase = createSupabaseBrowser();

            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        phone_number: data.phoneNumber,
                    },
                },
            });

            if (error) throw error;
            return authData;
        },
        onSuccess: () => {
            toast.success("Account created successfully!", {
                description: "Redirecting to login...",
            });
            setTimeout(() => {
                router.push("/auth/login");
            }, 500);
        },
        onError: (error: Error) => {
            toast.error("Sign up failed", {
                description: error.message,
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signUpMutation.mutate(formData);
    };

    return (
        <>
            <Header hideUserMenu />
            <div className="flex min-h-screen items-center justify-center bg-white p-4">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
                        <p className="text-muted-foreground text-gray-600">
                            Enter your details to sign up
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Full Name"
                                        className="bg-white"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="bg-white"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Password (min 6 characters)"
                                        className="bg-white"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        placeholder="Phone Number (Optional)"
                                        className="bg-white"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-semibold"
                                disabled={signUpMutation.isPending}
                            >
                                {signUpMutation.isPending ? "Creating account..." : "Sign Up"}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <Link
                                href="/auth/login"
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Already have an account?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
