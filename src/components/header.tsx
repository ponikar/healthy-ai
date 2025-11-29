"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { createSupabaseBrowser } from "~/lib/supabase/client";
import { toast } from "sonner";


export function Header({ hideUserMenu = false }: { hideUserMenu?: boolean }) {
    const router = useRouter();
    const [userName, setUserName] = useState<string>("User");
    const [userEmail, setUserEmail] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createSupabaseBrowser();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const fullName = user.user_metadata?.full_name;
                setUserName(fullName || user.email?.split('@')[0] || "User");
                setUserEmail(user.email || "");
            }
        };

        if (!hideUserMenu) {
            fetchUser();
        }
    }, [hideUserMenu]);

    const handleSignOut = async () => {
        try {
            const supabase = createSupabaseBrowser();
            await supabase.auth.signOut();
            toast.success("Signed out successfully");
            router.push("/auth/login");
            router.refresh();
        } catch (error) {
            toast.error("Failed to sign out");
            console.error("Sign out error:", error);
        }
    };

    return (
        <header className="sticky top-0 z-10 glass-card border-b border-white/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">HC</span>
                    </div>
                    <span className="text-lg font-semibold text-emerald-900">Healthcare AI</span>
                </div>

                {/* User Menu */}
                {!hideUserMenu && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex items-center gap-2 hover:bg-emerald-500/10 rounded-lg h-auto py-1.5 px-2"
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                                        {userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-emerald-900">{userName}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-2">
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Button>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </header>
    );
}

