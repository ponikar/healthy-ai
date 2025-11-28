"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Header } from "~/components/header";
import { WeatherGreetingWidget } from "~/components/weather-greeting";
import { Textarea } from "~/components/ui/textarea";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query)}`);
    }
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          {/* Logo/Title */}
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-semibold text-foreground">
              Healthcare AI
            </h1>
            <p className="text-lg text-muted-foreground">
              The AI Healthcare Assistant. Supporting hospitals with intelligent workflows
            </p>
          </div>

          {/* Weather & Greeting Widget */}
          <WeatherGreetingWidget />

          {/* Search Input */}
          <div className="relative">
            <Textarea
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[120px] px-4 py-3 text-base bg-white border border-border rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground"
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim()}
              className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Submit"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}