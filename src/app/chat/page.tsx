"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "~/components/header";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";


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
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const initialQuery = searchParams.get("q");
        if (initialQuery) {
            const userMessage: Message = {
                id: Date.now().toString(),
                role: "user",
                content: initialQuery,
            };
            setMessages([userMessage]);

            // Simulate AI response
            setTimeout(() => {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `I understand you're asking about "${initialQuery}". As your healthcare AI assistant, I'm here to help you with patient records, appointments, lab results, prescriptions, and more. How can I assist you further?`,
                };
                setMessages([userMessage, aiMessage]);
            }, 1000);
        }
    }, [searchParams]);

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `I've received your message: "${input}". I'm processing your request and will provide you with the most relevant healthcare information and assistance. This is a demo response - in production, this would connect to a real AI healthcare assistant.`,
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            {/* Chat Header */}
            <div className="sticky top-[73px] z-10 glass-card border-b border-white/20 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Button
                        onClick={() => router.push("/")}
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-500/10 rounded-xl"
                    >
                        <ArrowLeft className="w-5 h-5 text-emerald-700" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold text-emerald-900">Healthcare AI Assistant</h1>
                        <p className="text-sm text-emerald-700/70">Always here to help</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-emerald-700/70">Start a conversation with your healthcare AI assistant</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-xl px-4 py-2.5 ${message.role === "user"
                                        ? "glass-card bg-gradient-to-br from-emerald-500/90 to-green-500/90 text-white"
                                        : "glass-widget text-emerald-900"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="glass-widget rounded-xl px-4 py-2.5">
                                <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
                            </div>
                        </div>
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
                            disabled={isLoading}
                            className="glass-input min-h-[60px] pr-12 text-base resize-none border-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 rounded-lg placeholder:text-emerald-700/40"
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="absolute bottom-5 right-5 h-8 w-8 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
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