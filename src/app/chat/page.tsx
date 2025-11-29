"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, Loader2, Wrench, SquarePen } from "lucide-react";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useAgentStream } from "~/app/hooks/useStreamChat";
import { RenderUI } from "~/components/RenderUI";
import { createSupabaseBrowser } from "~/lib/supabase/client";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasProcessedInitialQuery = useRef(false);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createSupabaseBrowser();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
            }
        };
        checkAuth();
    }, [router]);

    const { content, toolCalls, toolResults, isStreaming, error, sendMessage } = useAgentStream();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, content, toolResults]);

    useEffect(() => {
        const initialQuery = searchParams.get("q");
        if (initialQuery && !hasProcessedInitialQuery.current) {
            hasProcessedInitialQuery.current = true;
            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: initialQuery,
            };
            setMessages([userMessage]);
            void sendMessage([userMessage]);
        }
    }, [searchParams, sendMessage]);

    // Append completed assistant response to history
    useEffect(() => {
        if (!isStreaming && content) {
            setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === "assistant" && lastMsg.content === content) {
                    return prev;
                }

                return [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: content,
                    },
                ];
            });
        }
    }, [isStreaming, content]);

    const handleSubmit = async () => {
        if (!input.trim() || isStreaming) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        await sendMessage(newMessages);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex flex-col">

            {/* Chat Header */}
            <div className="sticky z-10 glass-card border-b border-white/20 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Button
                        onClick={() => router.push("/")}
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-500/10 rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5 text-emerald-700" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold text-emerald-900">
                            Healthcare AI Assistant
                        </h1>
                        <p className="text-sm text-emerald-700/70">Always here to help</p>
                    </div>
                    <Button
                        onClick={() => router.push("/chat")}
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-500/10 rounded-xl"
                    >
                        <SquarePen className="w-5 h-5 text-emerald-700" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 && !isStreaming ? (
                        <div className="text-center py-12">
                            <p className="text-emerald-700/70">
                                Start a conversation with your healthcare AI assistant
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-xl px-4 py-2.5 ${message.role === "user"
                                            ? "glass-card bg-gradient-to-br from-emerald-500/90 to-green-500/90 text-white"
                                            : "glass-widget text-emerald-900"
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Streaming Message */}
                            {isStreaming && (
                                <div className="flex justify-start w-full">
                                    <div className="max-w-[80%] space-y-2">
                                        {/* Tool Activity Indicator */}
                                        {toolCalls.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs text-emerald-600/80 bg-emerald-50/50 px-3 py-1.5 rounded-lg w-fit">
                                                <Wrench className="w-3 h-3 animate-pulse" />
                                                <span>
                                                    {toolCalls[toolCalls.length - 1]?.name ===
                                                        "search_crisis_data"
                                                        ? "Thinking..."
                                                        : "Processing..."}
                                                </span>
                                            </div>
                                        )}

                                        {/* Streaming Content */}
                                        {content ? (
                                            <div className="glass-widget text-emerald-900 rounded-xl px-4 py-2.5">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {content}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="glass-widget rounded-xl px-4 py-2.5 w-fit">
                                                <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tool Results - NOW OUTSIDE isStreaming */}
                            {toolResults.length > 0 && (
                                <div className="flex justify-start w-full">
                                    <div className="max-w-[80%] space-y-2">
                                        {toolResults.map((result, i) => (
                                            <div
                                                key={i}
                                                className="glass-widget rounded-lg px-4 py-3"
                                            >
                                                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-2">
                                                    <Wrench className="w-3 h-3" />
                                                    Generated UI Component
                                                </div>
                                                <RenderUI code={result.data} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] glass-card bg-red-50/50 border border-red-200/50 rounded-xl px-4 py-2.5">
                                        <p className="text-sm text-red-700">Error: {error}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 glass-card border-t border-white/20 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="glass-card rounded-xl p-3 relative">
                        <Textarea
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isStreaming}
                            className="glass-input min-h-[60px] pr-12 text-base resize-none border-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 rounded-lg placeholder:text-emerald-700/40"
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isStreaming}
                            size="icon"
                            className="absolute bottom-5 right-5 h-8 w-8 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isStreaming ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
